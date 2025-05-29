import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';

dotenv.config();

export const loadAccountInfo = async () => {
  const basePath = process.cwd();
  const filePath = path.join(basePath, 'config', 'accounts.json');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(fileContent);
};

export const getAccountCredentials = (account) => {
  return {
    consumerKey: process.env[`${account}_OAUTH_CONSUMER_KEY`],
    consumerSecret: process.env[`${account}_OAUTH_CONSUMER_SECRET`],
    tokenKey: process.env[`${account}_OAUTH_TOKEN`],
    tokenSecret: process.env[`${account}_OAUTH_TOKEN_SECRET`],
    requestURL: process.env[`${account}_EXTERNAL_API_URL`],
  };
};