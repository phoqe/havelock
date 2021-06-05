// Core modules
const crypto = require("crypto");

// Third-party modules
const keytar = require("keytar");

// Password Versions
const PASSWORD_V10 = "v10";
const PASSWORD_V11 = "v11";

// Encryption Key
const KEY_SALT = "saltysalt";
const KEY_ITERS = 1;
const KEY_LEN_BYTES = 16;
const KEY_DIGEST = "sha1";

// Decipher
const DEC_ALGO = "aes-128-cbc";

// Initialization Vector
const IV_BLOCK_SIZE = 16;

/**
 * Retrieve the password used in Chromium's cryptography logic, i.e., when encrypting and decrypting strings.
 * The password is stored in a form of key storage solution.
 *
 * @param {object} browser Decides which service and account to use in the key storage solution.
 * @param {string} version Determines whether we should retrieve the password through the key storage solution or just use the hardcoded password.
 * @returns {Promise<string>} Resolved with the password string or rejected with an error.
 */
const getPassword = (browser, version) => {
  return new Promise((resolve, reject) => {
    if (!browser) {
      reject(new TypeError("No browser."));

      return;
    }

    if (!version) {
      reject(new TypeError("No version."));

      return;
    }

    if (version === PASSWORD_V10) {
      resolve("peanuts");

      return;
    }

    if (version === PASSWORD_V11) {
      const service = browser.keychain.service;
      const account = browser.keychain.account;

      keytar
        .getPassword(service, account)
        .then((password) => {
          resolve(password);
        })
        .catch((reason) => {
          reject(reason);
        });
    }
  });
};

/**
 * Create an encryption key for the specified `browser`.
 *
 * @param {object} browser
 * @param {string} version
 * @returns {Promise<Buffer>}
 */
const createEncryptionKey = (browser, version) => {
  return new Promise((resolve, reject) => {
    if (!browser) {
      reject(new TypeError("No browser."));

      return;
    }

    if (!version) {
      reject(new TypeError("No version."));

      return;
    }

    getPassword(browser, version)
      .then((password) => {
        if (!password) {
          reject(new TypeError("No password."));

          return;
        }

        crypto.pbkdf2(
          password,
          KEY_SALT,
          KEY_ITERS,
          KEY_LEN_BYTES,
          KEY_DIGEST,
          (error, key) => {
            if (error) {
              reject(error);

              return;
            }

            resolve(key);
          }
        );
      })
      .catch((reason) => {
        reject(reason);
      });
  });
};

/**
 * Decrypt data from a buffer to a plaintext string using the defined algorithm.
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

    const dataString = data.toString();
    let version;

    // Check that the incoming data was encrypted and with what version.
    // Credit card numbers are current legacy unencrypted data at the time of writing.
    // So false match with prefix won't happen.
    if (dataString.startsWith(PASSWORD_V10)) {
      version = PASSWORD_V10;
    } else if (dataString.startsWith(PASSWORD_V11)) {
      version = PASSWORD_V11;
    } else {
      // If the prefix is not found then we'll assume we're dealing with old data.
      // It's saved as clear text and we'll return it directly.
      resolve(data);

      return;
    }

    createEncryptionKey(browser, version)
      .then((key) => {
        if (!key) {
          reject(new TypeError("No key."));

          return;
        }

        const iv = Buffer.alloc(IV_BLOCK_SIZE, "20", "hex");
        const decipher = crypto.createDecipheriv(DEC_ALGO, key, iv);
        const ciphertext = Buffer.from(data).toString("base64");
        const rawCiphertext = ciphertext.substring(version.length + 1);
        let plaintext = decipher.update(rawCiphertext, "base64", "utf8");

        plaintext += decipher.final("utf8");

        resolve(plaintext);
      })
      .catch((reason) => {
        reject(reason);
      });
  });
};
