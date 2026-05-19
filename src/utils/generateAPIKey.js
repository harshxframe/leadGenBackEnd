import crypto from 'crypto';

/**
 * Generates a secure, random 20-character API key.
 * @returns {string} The 20-character API key.
 */
export const generateApiKey = () => {
  const prefix = 'kx_'; 
  const targetLength = 32;
  const randomLength = targetLength - prefix.length;

  const randomBytes = crypto.randomBytes(Math.ceil(randomLength / 2))
    .toString('hex')
    .slice(0, randomLength);

  return `${prefix}${randomBytes}`;
};
