//We use this create the SHA256 hash
import crypto from 'crypto';

/**
 * Creates a salted and hashed string of hexadecimal characters. Used to encrypt
 * "safely" store user passwords.
 * @param {string} pw the password to hash
 * @param {string} salt the salt to use when hashing
 */
const generateHash = (pw: string, salt: string) =>
    crypto
        .createHash('sha256')
        .update(pw + salt)
        .digest('hex');

/**
 * Creates a random string of hexadecimal characters with the length of size.
 * @param {string} size the size (in bits) of the salt to create
 * @returns random string of hexadecimal characters
 */
const generateSalt = (size: number) => crypto.randomBytes(size).toString('hex');

const credentialingFunctions = { generateHash, generateSalt };

export { credentialingFunctions };
