import { exec, spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { doPost } from '../octoBuddyApiClient/apiClient.js';
import readManifest from './manifestHandler.js';

import extensionFieldsets from '../config/extensionFieldsets.json' assert { type: 'json' };

import {
  runNpmCommands,
  copyNpmrcToUserDirectory,
  deleteNpmrcInUserDirectory,
} from '../utils/npmrcHelper.js';

const clientPath = `"C:\\Program Files (x86)\\Cisco\\Cisco Secure Client"`;
let vpnConnected = false; // Initialized to false
const maxRetries = 1;

// Function to execute a shell command
const executeCommand = async (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`Command stderr: ${stderr}`);
        return reject(new Error(stderr));
      }
      resolve(stdout.trim());
    });
  });
};

// Function to manage VPN connections
const vpn = async (state) => {
  try {
    const command = `cd /d ${clientPath} && vpncli.exe status`;
    const vpnActivate = `start cmd /c "vpn && exit"`;

    const stdout = await executeCommand(command);
    const vpnStatus = stdout.includes('state: Connected');

    !vpnStatus && state === 'on' ? await executeCommand(vpnActivate) : false;

    vpnStatus && state === 'off' ? await executeCommand(vpnActivate) : false;
  } catch (error) {
    console.error(`VPN command failed: ${error.message}`);
    throw error;
  }
};

// Function to compile TypeScript extensions
async function compileExtensionTS(extensionPath) {
  const packageJsonPath = path.join(extensionPath, 'package.json');
  try {
    if (
      await fs
        .access(packageJsonPath)
        .then(() => true)
        .catch(() => false)
    ) {
      console.log('Compiling extension...');
      await vpn('on');
      await copyNpmrcToUserDirectory();
      await runNpmCommands(extensionPath);
      await deleteNpmrcInUserDirectory();
      await vpn('off');
      return true;
    } else {
      console.log('package.json not found. Skipping compilation.');
      return false;
    }
  } catch (error) {
    console.error(`Error compiling extension: ${error.message}`);
    throw error;
  }
}

// process XML to remove custtab_260_t1533071_680 dependancy duplicated
async function processXMLFiles(repo, workingDir) {
  let objectsPath = '';

  try {
    let pathToCheck = path.join(workingDir, repo, 'Objects');
    await fs.access(pathToCheck); // Check file existence
    objectsPath = pathToCheck;
  } catch (error) {
    objectsPath = path.join(workingDir, 'Objects');
  }

  const fileName = 'custtab_260_t1533071_680.xml'; // The XML file for the object ID
  const fileDependancy = 'custtab_260_t1533071_680';

  // Get the list of files in the directory
  const files = await fs.readdir(objectsPath);
  const matchingFile = files.find((file) => file === fileName); // Find the matching file

  if (matchingFile) {
    console.log(`Deleting file: ${matchingFile}`);
    await fs.unlink(path.join(objectsPath, matchingFile)); // Delete the file

    // Optionally process XML files if necessary
    const files = await fs.readdir(objectsPath);

    for (const file of files) {
      const filePath = path.join(objectsPath, file);
      const content = await fs.readFile(filePath, 'utf-8');

      if (content.includes(fileDependancy)) {
        // Split content into lines
        const lines = content.split('\n');

        // Filter out lines containing the dependency string
        const updatedLines = lines.filter(
          (line) => !line.includes(fileDependancy),
        );

        // Join the updated lines back into a single string
        const updatedContent = updatedLines.join('\n');

        // Write the updated content to the file
        await fs.writeFile(filePath, updatedContent, 'utf-8');
        console.log(`Updated file: ${file}`);
      }
    }
  } else {
    console.log('No matching file found.');
  }
}

// Deploy command
const deployCommand = async (repo, workingDir, website) => {
  return new Promise(async (resolve, reject) => {
    try {
      const extensionPath = workingDir.includes(repo)
        ? workingDir
        : path.join(workingDir, repo);

      await processXMLFiles(repo, extensionPath);

      const manifestData = await readManifest(extensionPath);
      const isCompiled = await compileExtensionTS(extensionPath);

      await vpn('off');

      let projectName = isCompiled ? 'dist' : repo;
      workingDir = isCompiled ? extensionPath : workingDir;

      const child = spawn('cmd.exe', { cwd: workingDir });

      const basePath = process.cwd();
      const filePath = path.join(basePath, 'config', 'accounts.json');
      const acctInfo = JSON.parse(await fs.readFile(filePath, 'utf-8'));

      child.stdout.on('data', async (data) => {
        console.log(`stdout: ${data}`);

        // Handle user prompts in the deployment process
        if (data.includes('Proceed with deploy? Type Yes (Y) to proceed.')) {
          child.stdin.write('Y\n');
        }
        if (
          data.includes(
            'WARNING! You are deploying to a Production account, enter YES to continue.',
          )
        ) {
          child.stdin.write('YES\n');
        }

        // When deployment is complete
        if (data.includes('Installation COMPLETE')) {
          console.log('Deployment successful.');

          let suiteAppData = {
            manifest: manifestData,
            fieldsets: extensionFieldsets[repo],
            website: website,
          };
          await doPost(suiteAppData); // Post deployment action (e.g., save data)

          child.stdin.end(); // Close the stdin of the child process
          resolve(true); // Resolve the promise to indicate success
        }
      });

      child.stderr.on('data', async (data) => {
        console.log(`ERROR: ${data}`);
        child.stdin.end();
        resolve(true);

        /* // Handle installation failure and retry logic
        if (data.includes('Installation FAILED') && retryCount < maxRetries) {
          console.log(
            `Retrying deployment (${retryCount + 1}/${maxRetries})...`,
          );

          // Retry deployment after handling failure
          await deployCommand(repo, workingDir, website, retryCount + 1);
        } else if (
          data.includes('Installation FAILED') &&
          retryCount == maxRetries
        ) {
          child.stdin.end(); // Close the stdin of the child process
          resolve(true); // Resolve the promise to indicate success
        } else {
          console.log('hi');
          resolve(true);
        } */
      });

      child.on('close', (code) => {
        console.log(`Deployment process exited with code ${code}`);
        if (code !== 0) {
          reject(new Error(`Deployment process failed with code ${code}`)); // Reject on failure
        }
      });

      // Start the deployment process
      child.stdin.write(
        `sdfcli deploy -p ${projectName} -authid ${acctInfo.selectedAuthId} \n`,
      );
    } catch (error) {
      console.error(`Error during deployment: ${error.message}`);
      reject(error); // Reject the promise if an error occurs
    }
  });
};

// Function to get AuthIDs for a specific account
const getAuthIdsFromAccount = async (account) => {
  return new Promise((resolve, reject) => {
    const authIDs = [];
    let buffer = '';

    const child = spawn('cmd.exe');

    child.stdin.write(`sdfcli manageauth -list | findstr ${account}\n`);

    child.stdout.on('data', (data) => {
      buffer += data.toString();
    });

    child.stdin.end();

    child.on('exit', () => {
      const output = buffer.trim().split('\n');
      output.forEach((line) => {
        const match = line.match(/^(.*?)\s*\|/);
        if (match && match[1]) {
          authIDs.push(match[1].trim());
        }
      });
      resolve(authIDs);
    });

    child.on('error', (error) => {
      console.error(`Error: ${error}`);
      reject(error);
    });
  });
};

export { vpn, compileExtensionTS, deployCommand, getAuthIdsFromAccount };
