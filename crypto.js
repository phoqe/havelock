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
 * @param browser
 * @returns {Promise<string>}
 */
const getPassword = browser => {
  return new Promise((resolve, reject) => {
    if (!browser) {
      reject();

      return null;
    }

    let service, account;

    switch (browser) {
      case "chromium":
        service = "Chromium Safe Storage";
        account = "Chromium";
        break;

      case "chrome":
        service = "Chrome Safe Storage";
        account = "Chrome";
        break;
    }

    keytar
      .getPassword(service, account)
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

exports.decryptString = (browser, ciphertext) => {
  return new Promise((resolve, reject) => {
    if (!browser || !ciphertext) {
      reject();

      return;
    }

    if (ciphertext.indexOf(encryptionVersionPrefix) !== 0) {
      resolve(ciphertext);

      return;
    }

    createEncryptionKey(browser)
      .then(encryptionKey => {
        if (!encryptionKey) {
          reject();

          return;
        }

        const rawCiphertext = ciphertext.substring(
          encryptionVersionPrefix.length
        );
        const iv = " ".repeat(aes128BlockSize);
      })
      .catch(reason => {
        console.log(reason);
      });
  });
};
