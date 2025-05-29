// Importing required modules using ES module syntax
import path from 'path';
import simpleGit from 'simple-git';
import fs from 'fs/promises';
import { deployCommand, vpn } from '../utils/cmdTool.js';
import os from 'os';

// Initialize git instance
const git = simpleGit();
const basePath = process.cwd();
const filePath = path.join(basePath, 'config', 'repository_source.json');
const fileContent = await fs.readFile(filePath, 'utf-8');
const data = JSON.parse(fileContent);

const clonesPath = path.join(os.homedir(), 'clones');

let repoBaseUrl = `https://gitlab.eng.netsuite.com/commerce-prod/suitecommerce-`;

export const getExtensionsList = async (req, res) => {
  try {
    res.json(data);
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const repoExist = async (req, res) => {
  const params = { ...req.query };
  const repoPath = path.join(clonesPath, params.reponame);

  try {
    await fs.access(repoPath);
    res.status(200).json({ exists: true });
  } catch (error) {
    res.status(200).json({ exists: false });
  }
};

// Fetch remote branches
export const getRemoteBranches = async (req, res) => {
  const { repo } = req.query;
  if (repo) {
    const repoPath = path.join(clonesPath, repo);
    try {
      const gitInstance = simpleGit({ baseDir: repoPath });
      await gitInstance.fetch();
      const branches = await gitInstance.branch(['-r']);
      res.json({ remoteBranches: branches.all });
    } catch (error) {
      console.error('Error fetching remote branches:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(400).json({ error: 'Invalid query parameters' });
  }
};

// Clone a new repository
export const cloneRepo = async (req, res) => {
  const { repo } = req.query;
  const repoType = data.extensionName.includes(repo) ? 'extensions' : 'themes';
  if (!repo)
    return res.status(400).json({ error: 'Repository URL is required' });

  try {
    const repoPath = path.join(clonesPath, repo);

    await vpn('on');

    await git.clone(repoBaseUrl + repoType + '/' + repo, repoPath);
    //const branches = await getRemoteBranches({ query: { repo } }, res);
    res.status(200).json({ message: `${repo} cloned successfully` });
  } catch (error) {
    console.error('Error cloning repository:', error);
    res
      .status(500)
      .json({ error: 'Failed to clone repository', details: error.message });
  }
};

// Update a new repository
export const updateRepo = async (req, res) => {
  const { repo } = req.query;

  if (!repo) {
    return res.status(400).json({ error: 'Repository URL is required' });
  }

  const repoType = repo.includes('extension') ? 'extensions' : 'themes';
  if (!repoType) {
    return res.status(400).json({ error: 'Unable to determine repo type' });
  }

  try {
    const repoPath = path.join(clonesPath, repo);
    const repoUrl = repoBaseUrl + repoType + '/' + repo;

    // Ensure VPN is enabled before pulling
    await vpn('on');
    console.log('VPN connection established');

    // Check if the repository already exists asynchronously using fs.access
    try {
      await fs.access(repoPath); // This checks if the path exists
      console.log(`Repository exists. Pulling latest changes from ${repoUrl}`);
      await simpleGit(repoPath).reset('hard', 'HEAD');
      // Clean up untracked files (removes untracked files and directories)
      await simpleGit(repoPath).clean('fd');
      await simpleGit(repoPath).pull(); // Pull the latest changes if repo exists
      console.log(`Successfully pulled the latest changes for ${repo}`);

      res.status(200).json({ message: `${repo} updated successfully` });
    } catch (err) {
      // If access fails (repo doesn't exist), handle it here
      console.log(`Repository not found locally: ${repoPath}`);
      res.status(404).json({
        error: `Repository ${repo} not found locally. No cloning performed.`,
      });
    }
  } catch (error) {
    console.error('Error updating repository:', error);
    res.status(500).json({
      error: 'Failed to update repository',
      details: error.message,
    });
  }
};

// Deploy repositories
export const deployRepo = async (req, res) => {
  const { repositories, website } = req.body;

  if (!repositories)
    return res.status(400).json({ error: 'Repository array missing' });

  try {
    const deploymentResults = [];

    // Loop through repositories sequentially using for...of
    for (let repo of repositories) {
      try {
        // Wait for the deployment to finish for the current repository
        await deployCommand(repo.repository, clonesPath, website);

        // If deployment is successful, push the result
        deploymentResults.push({
          repo: repo.repository,
          status: 'success',
        });
      } catch (error) {
        console.log('ERROR CATCHED IN GIT CONTROLLER');
        // If deployment fails, push the failure result and stop further deployments
        deploymentResults.push({
          repo: repo.repository,
          status: 'failure',
          error: error.message,
        });

        // Optionally, log and break out of the loop if you want to stop further deployments
        console.error(
          `Deployment of ${repo.repository} failed: ${error.message}`,
        );
        break; // Stop the loop after a failure
      }
    }

    // Return the deployment results
    res.status(200).json({
      message: 'Deployment completed.',
      results: deploymentResults,
    });
  } catch (error) {
    console.error('Error during deployment:', error);
    res
      .status(500)
      .json({ error: 'Failed to deploy repositories', details: error.message });
  }
};

// Checkout to a remote branch
export const checkoutRemoteBranch = async (req, res) => {
  const params = { ...req.query };

  let { branch, repo } = params;
  if (!branch || !repo)
    return res
      .status(400)
      .json({ error: 'Branch and repository are required' });

  try {
    const repoPath = path.join(clonesPath, repo);
    const gitInstance = simpleGit({ baseDir: repoPath });

    branch = await branch.replace('origin/', '');

    await gitInstance.checkout(branch);
    res.status(200).json({ message: `Checked out to branch ${branch}` });
  } catch (error) {
    console.error('Error checking out branch:', error);
    res.status(500).json({ error: 'Failed to checkout branch' });
  }
};

// Get local repositories
export const getLocalRepos = async (req, res) => {
  try {
    try {
      await fs.access(clonesPath);
    } catch (error) {
      // Directory does not exist, create it
      await fs.mkdir(clonesPath, { recursive: true });
    }

    const folders = await fs.readdir(clonesPath, { withFileTypes: true });
    if (!folders.length)
      return res.status(200).json({ message: 'No repositories found.' });

    const repoInfo = await Promise.all(
      folders
        .filter((folder) => folder.isDirectory())
        .map(async (folder) => {
          const folderName = folder.name;
          const folderFullPath = path.join(clonesPath, folderName);

          const currentBranch = await simpleGit({
            baseDir: folderFullPath,
          }).branch();

          return {
            repo: folderName,
            localPath: folderFullPath,
            currentBranch: currentBranch.current,
          };
        }),
    );

    res.status(200).json(repoInfo);
  } catch (error) {
    console.error('Error accessing local repositories:', error);
    res.status(500).json({ error: 'Failed to access local repositories' });
  }
};
