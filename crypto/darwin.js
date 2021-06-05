// Core modules
const crypto = require("crypto");

// Third-party modules
const keytar = require("keytar");

// Password Versions
const PASSWORD_V10 = "v10";

// Encryption Key
const KEY_SALT = "saltysalt";
const KEY_ITERS = 1003;
const KEY_LEN_BYTES = 16;
const KEY_DIGEST = "sha1";
const AES_128_BLOCK_SIZE = 16;

// Decipher
const DEC_ALGO = "aes-128-cbc";

// Initialization Vector
const IV_BLOCK_SIZE = 16;

/**
 * Retrieves the password used in Chromium’s cryptography logic, i.e. when encrypting and decrypting strings.
 * This password is stored in Keychain on macOS and is only available once the user has granted access.
 *
 * The `browser` parameter decides which service and account to use, e.g. for Chromium it’s Chromium Safe Storage and
 * Chromium.
 *
 * @param browser {object}
 * @returns {Promise<string>}
 */
const getPassword = (browser) => {
  return new Promise((resolve, reject) => {
    if (!browser) {
      reject();

      return;
    }

    keytar
      .getPassword(browser.keychain.service, browser.keychain.account)
      .then((password) => {
        resolve(password);
      })
      .catch((reason) => {
        reject(reason);
      });
  });
};

/**
 * Creates an encryption key for the specified `browser` from an associated password retrieved from Keychain and an
 * existing salt.
 *
 * Access to Keychain is required to create an encryption key.
 *
 * @param browser {object}
 * @returns {Promise<Buffer>}
 */
const createEncryptionKey = (browser) => {
  return new Promise((resolve, reject) => {
    if (!browser) {
      reject();

      return;
    }

    getPassword(browser)
      .then((password) => {
        if (!password) {
          reject();

          return;
        }

        crypto.pbkdf2(
          password,
          KEY_SALT,
          KEY_ITERS,
          KEY_LEN_BYTES,
          KEY_DIGEST,
          (err, derivedKey) => {
            if (err) {
              reject(err);

              return;
            }

            resolve(derivedKey);
          }
        );
      })
      .catch((reason) => {
        reject(reason);
      });
  });
};

/**
 * Decrypts data in a Buffer to a string using 128 bit AES with CBC.
 *
 * @param browser {object}
 * @param data {Buffer}
 * @returns {Promise<string>}
 */
exports.decrypt = (browser, data) => {
  return new Promise((resolve, reject) => {
    if (!browser || !data) {
      reject();

      return;
    }

    // Check that the incoming data was encrypted and with what version.
    // Credit card numbers are current legacy unencrypted data at the time of writing.
    // So false match with prefix won't happen.
    if (data.toString().indexOf(PASSWORD_V10) !== 0) {
      // If the prefix is not found then we'll assume we're dealing with old data.
      // It's saved as clear text and we'll return it directly.

      resolve(data);

      return;
    }

    createEncryptionKey(browser)
      .then((encryptionKey) => {
        if (!encryptionKey) {
          reject();

          return;
        }

        const iv = Buffer.alloc(IV_BLOCK_SIZE, "20", "hex");
        const decipher = crypto.createDecipheriv(DEC_ALGO, encryptionKey, iv);
        const ciphertext = Buffer.from(data).toString("base64");
        const rawCiphertext = ciphertext.substring(PASSWORD_V10.length + 1);
        let plaintext = decipher.update(rawCiphertext, "base64", "utf8");

        plaintext += decipher.final("utf8");

        resolve(plaintext);
      })
      .catch((reason) => {
        reject(reason);
      });
  });
};
