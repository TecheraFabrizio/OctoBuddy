import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';

export const runNpmCommands = async (extensionPath) => {
  try {
    console.log(
      `Starting 'npm install' followed by 'npm run build' at ${extensionPath}...`,
    );
    await runCommandsInSameTerminal(
      ['npm cache clean --force', 'npm install', 'npm run build'],
      extensionPath,
    );
    console.log('All commands executed successfully, terminal will close.');
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  }
};

const runCommandsInSameTerminal = (commands, extensionPath) => {
  return new Promise((resolve, reject) => {
    const fullCommand = commands.join(' && '); // Combine commands using `&&` to execute sequentially

    // For Windows
    if (process.platform === 'win32') {
      const terminalCommand = `start cmd /C "cd ${extensionPath} && ${fullCommand}"`; // /C executes and closes terminal
      exec(terminalCommand, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Error running command: ${error.message}`));
        } else {
          console.log(stdout);
          resolve();
        }
      });
    } else {
      // For Linux/macOS
      const terminalCommand = `gnome-terminal -- bash -c "cd ${extensionPath} && ${fullCommand} && exit"`; // `exit` closes terminal
      exec(terminalCommand, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Error running command: ${error.message}`));
        } else {
          console.log(stdout);
          resolve();
        }
      });
    }
  });
};

export const copyNpmrcToUserDirectory = async () => {
  try {
    const basePath = process.cwd();
    const sourcePath = path.join(basePath, 'config', '.npmrc');
    const targetPath = path.join(os.homedir(), '.npmrc');

    await fs.access(sourcePath); // Check if source exists
    console.log(`.npmrc file found at ${sourcePath}, copying...`);

    const fileContent = await fs.readFile(sourcePath, 'utf-8');
    await fs.writeFile(targetPath, fileContent, 'utf-8');
    console.log(`.npmrc file copied successfully to ${targetPath}`);
  } catch (error) {
    console.error(`Failed to copy .npmrc: ${error.message}`);
  }
};

export const deleteNpmrcInUserDirectory = async () => {
  try {
    const targetPath = path.join(os.homedir(), '.npmrc');
    await fs.unlink(targetPath); // Attempt to delete the file
    console.log('.npmrc file successfully deleted');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('.npmrc file does not exist, nothing to delete.');
    } else {
      console.error('An error occurred:', error.message);
    }
  }
};
