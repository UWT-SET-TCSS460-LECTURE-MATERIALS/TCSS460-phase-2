"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentialingFunctions = void 0;
//We use this create the SHA256 hash
const crypto_1 = __importDefault(require("crypto"));
/**
 * Creates a salted and hashed string of hexadecimal characters. Used to encrypt
 * "safely" store user passwords.
 * @param {string} pw the password to hash
 * @param {string} salt the salt to use when hashing
 */
const generateHash = (pw, salt) => crypto_1.default
    .createHash('sha256')
    .update(pw + salt)
    .digest('hex');
/**
 * Creates a random string of hexadecimal characters with the length of size.
 * @param {string} size the size (in bits) of the salt to create
 * @returns random string of hexadecimal characters
 */
const generateSalt = (size) => crypto_1.default.randomBytes(size).toString('hex');
const credentialingFunctions = { generateHash, generateSalt };
exports.credentialingFunctions = credentialingFunctions;
//# sourceMappingURL=credentialingUtils.js.map