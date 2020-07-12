const crypto = require("crypto");
const keytar = require("keytar");

const encryptionVersionPrefix = "v10";
const salt = "saltysalt";
const aes128BlockSize = 16;

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

        crypto.pbkdf2(password, salt, 1003, 16, "sha1", (err, derivedKey) => {
          if (err) {
            reject(err);

            return;
          }

          resolve(derivedKey);
        });
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
exports.decryptData = (browser, data) => {
  return new Promise((resolve, reject) => {
    if (!browser || !data) {
      reject();

      return;
    }

    if (data.toString().indexOf(encryptionVersionPrefix) !== 0) {
      resolve(data);

      return;
    }

    createEncryptionKey(browser)
      .then((encryptionKey) => {
        if (!encryptionKey) {
          reject();

          return;
        }

        const iv = Buffer.alloc(aes128BlockSize, "20", "hex");

        const decipher = crypto.createDecipheriv(
          "AES-128-CBC",
          encryptionKey,
          iv
        );

        const ciphertext = Buffer.from(data).toString("base64");
        const rawCiphertext = ciphertext.substring(
          encryptionVersionPrefix.length + 1
        );

        let plaintext = decipher.update(rawCiphertext, "base64", "utf8");

        plaintext += decipher.final("utf8");

        resolve(plaintext);
      })
      .catch((reason) => {
        reject(reason);
      });
  });
};
