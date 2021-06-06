// Core modules
const crypto = require("crypto");

// Third-party modules
const hkdf = require("futoin-hkdf");

// Password Versions
const PASSWORD_V10 = "v10";

// Encryption Key
const KEY_SECRET = "peanuts";
const KEY_LEN = 256 / 8; // 32 bytes
const KEY_SALT = "salt";
const KEY_INFO = "info";
const KEY_HASH = "sha-256";

const NONCE_LEN = 96 / 8; // 12 bytes
const DEC_ALGO = "aes-256-gcm";

/**
 *
 * @returns {Buffer}
 */
const createEncryptionKey = () => {
  return hkdf(KEY_SECRET, KEY_LEN, {
    salt: KEY_SALT,
    info: KEY_INFO,
    hash: KEY_HASH,
  });
};

/**
 *
 * @param {string} ciphertext
 * @returns {string}
 */
const decryptWithDpApi = (ciphertext) => {};

/**
 *
 * @param {object} browser
 * @param {Buffer} data
 * @returns {Promise<string>}
 */
exports.decrypt = (browser, data) => {
  return new Promise((resolve, reject) => {
    if (!browser) {
      reject(new TypeError("No browser."));

      return;
    }

    if (!data) {
      reject(new TypeError("No data."));

      return;
    }

    const ciphertext = data.toString();

    if (ciphertext.startsWith(PASSWORD_V10)) {
      // TODO: Unprotect data.

      return;
    }

    const key = createEncryptionKey();
    const nonce = ciphertext.substring(PASSWORD_V10.length - 1, NONCE_LEN);
    const rawCiphertext = ciphertext.substring(
      NONCE_LEN + PASSWORD_V10.length - 1
    );
    const decipher = crypto.createDecipheriv(DEC_ALGO, key, iv);
  });
};
