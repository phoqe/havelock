const { exec } = require("child_process");

const keytar = require("keytar");
const CryptoJS = require("crypto-js");

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
const getPassword = browser => {
  return new Promise((resolve, reject) => {
    if (!browser) {
      reject();

      return null;
    }

    keytar
      .getPassword(browser.keychain.service, browser.keychain.account)
      .then(password => {
        resolve(password);
      })
      .catch(reason => {
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
 * @param browser
 * @returns {Promise<WordArray>}
 */
const createEncryptionKey = browser => {
  return new Promise((resolve, reject) => {
    if (!browser) {
      reject();

      return;
    }

    getPassword(browser)
      .then(password => {
        if (!password) {
          reject();

          return;
        }

        const encryptionKey = CryptoJS.PBKDF2(password, salt, {
          iterations: 1003
        });

        if (!encryptionKey) {
          reject();

          return;
        }

        resolve(encryptionKey);
      })
      .catch(reason => {
        reject(reason);
      });
  });
};

/**
 * Decrypts data in a Buffer to a string using 128 bit AES with CBC through OpenSSL.
 *
 * This function assumes that `openssl` is installed in the calling environment.
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
      .then(encryptionKey => {
        if (!encryptionKey) {
          reject();

          return;
        }

        const iv = "20".repeat(aes128BlockSize);
        const command = `openssl enc -AES-128-CBC -d -a -iv '${iv}' -K '${encryptionKey.toString()}' <<< ${Buffer.from(
          data
        )
          .toString("base64")
          .substring(encryptionVersionPrefix.length + 1)}`;

        exec(command, (error, stdout) => {
          if (error) {
            reject(error);

            return;
          }

          resolve(stdout);
        });
      })
      .catch(reason => {
        reject(reason);
      });
  });
};
