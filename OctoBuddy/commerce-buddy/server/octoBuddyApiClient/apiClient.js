import axios from 'axios';
import { loadAccountInfo, getAccountCredentials } from './loadAccountInfo.js';
import { generateOAuthHeader } from './oauthUtils.js';

export const doPost = async (data) => {
  const acctInfo = await loadAccountInfo();
  const account =
    acctInfo.selectedAccount || process.env.DEFAULT_NETSUITE_ACCOUNT;
  const { consumerKey, consumerSecret, tokenKey, tokenSecret, requestURL } =
    getAccountCredentials(account);

  const authHeader = generateOAuthHeader('POST', requestURL, account, {
    consumerKey,
    consumerSecret,
    tokenKey,
    tokenSecret,
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: requestURL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    data,
  };

  try {
    const response = await axios.request(config);

    return response.data;
  } catch (error) {
    console.error(
      'Error:',
      error.response ? error.response.data : error.message,
    );
    throw error;
  }
};

export const doGet = async (params) => {
  const acctInfo = await loadAccountInfo();
  const account =
    acctInfo.selectedAccount || process.env.DEFAULT_NETSUITE_ACCOUNT;
  const { consumerKey, consumerSecret, tokenKey, tokenSecret, requestURL } =
    getAccountCredentials(account);

  const authHeader = generateOAuthHeader(
    'GET',
    requestURL,
    account,
    {
      consumerKey,
      consumerSecret,
      tokenKey,
      tokenSecret,
    },
    params,
  );

  const config = {
    method: 'get',
    url: requestURL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    maxRedirects: 5,
  };

  try {
    const response = await axios.request(config);

    if (response.status === 200) {
      return response.data.summary
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error(
      'Error:',
      error.response ? error.response.data : error.message,
    );
    throw error;
  }
};
