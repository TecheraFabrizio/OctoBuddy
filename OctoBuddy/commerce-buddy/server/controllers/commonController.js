import path from 'path';
import fs from 'fs/promises';
import { getAuthIdsFromAccount } from '../utils/cmdTool.js';
import { doGet } from '../octoBuddyApiClient/apiClient.js';

const basePath = process.cwd();

export const getAccountsList = async (req, res) => {
  const filePath = path.join(basePath, 'config', 'accounts.json');

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    res.json(data); // Respond with the accounts list
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAuthIds = async (req, res) => {
  try {
    const account = req.query.account; // Get account from query params

    // Check if the account query parameter is present
    if (!account) {
      return res.status(400).json({ error: 'Account parameter is required' });
    }

    // Call the utility function to get auth IDs
    const authIds = await getAuthIdsFromAccount(account);
    // Respond with the auth IDs
    res.json(authIds);
  } catch (error) {
    console.error('Error fetching auth IDs:', error);
    res.status(500).json({ error: 'Failed to retrieve Auth IDs' });
  }
};

export const setAccountAuthInfo = async (req, res) => {
  const { account, authId } = req.body;

  // Check if account or authId is missing
  if (!account || !authId) {
    return res.status(400).json({ error: 'Account or authId missing' });
  }

  const filePath = path.join(basePath, 'config', 'accounts.json');

  try {
    // Read the current file content
    const fileContent = await fs.readFile(filePath, 'utf-8');
    let data = JSON.parse(fileContent);

    // Update the file with new account and authId
    data.selectedAccount = account;
    data.selectedAuthId = authId;

    // Write updated data back to the file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

    // Respond with the updated data
    return res.json(data);
  } catch (error) {
    console.error('Error reading or writing file:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get websites available
export const getWebsitesAvailable = async (req, res) => {
  try {
    const response = await doGet();

    const combinedArray = response.map(
      (item) => `${item.websiteId}_${item.displayName}`,
    );

    res.json(combinedArray);
  } catch (error) {
    console.error('Error :', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
