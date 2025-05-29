import crypto from 'crypto';

export const createSignatureBaseString = (httpMethod, url, parameters) => {
  const urlParts = url.split('?');
  const baseUrl = urlParts[0];
  const queryParams = urlParts[1] || '';

  const queryParamsArray = queryParams.split('&').reduce((acc, param) => {
    const [key, value] = param.split('=');
    if (key) {
      acc[key] = decodeURIComponent(value || '');
    }
    return acc;
  }, {});

  const combinedParams = { ...parameters, ...queryParamsArray };

  const sortedParams = Object.keys(combinedParams)
    .sort()
    .map(
      (key) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(combinedParams[key])}`
    )
    .join('&');

  return [
    httpMethod.toUpperCase(),
    encodeURIComponent(baseUrl),
    encodeURIComponent(sortedParams),
  ].join('&');
};

export const generateOAuthHeader = (
  httpMethod,
  url,
  account,
  { consumerKey, consumerSecret, tokenKey, tokenSecret },
  parameters = {}
) => {
  const nonce = crypto.randomBytes(16).toString('hex');
  const timestamp = Math.floor(Date.now() / 1000);

  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA256',
    oauth_timestamp: timestamp,
    oauth_token: tokenKey,
    oauth_version: '1.0',
  };

  const allParams = { ...oauthParams, ...parameters };
  const baseString = createSignatureBaseString(httpMethod, url, allParams);

  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(
    tokenSecret
  )}`;
  const signature = crypto
    .createHmac('sha256', signingKey)
    .update(baseString)
    .digest('base64');
  const encodedSignature = encodeURIComponent(signature);

  let authorizationHeader = `OAuth realm="${account}"`;
  for (const key in oauthParams) {
    authorizationHeader += `, ${encodeURIComponent(
      key
    )}="${encodeURIComponent(oauthParams[key])}"`;
  }
  authorizationHeader += `, oauth_signature="${encodedSignature}"`;

  return authorizationHeader;
};