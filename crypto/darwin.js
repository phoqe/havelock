const crypto = require("crypto");
const keytar = require("keytar");

const ENC_VER_PREFIX = "v10";
const SALT = "saltysalt";
const AES_128_BLOCK_SIZE = 16;

const PBKDF2_ITERS = 1003;
const PBKDF2_KEY_LEN = 16;
const PBKDF2_DIG = "sha1";

const DEC_ALGO = "AES-128-CBC";

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
          SALT,
          PBKDF2_ITERS,
          PBKDF2_KEY_LEN,
          PBKDF2_DIG,
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
exports.decryptData = (browser, data) => {
  return new Promise((resolve, reject) => {
    if (!browser || !data) {
      reject();

      return;
    }

    if (data.toString().indexOf(ENC_VER_PREFIX) !== 0) {
      resolve(data);

      return;
    }

    createEncryptionKey(browser)
      .then((encryptionKey) => {
        if (!encryptionKey) {
          reject();

          return;
        }

        const iv = Buffer.alloc(AES_128_BLOCK_SIZE, "20", "hex");
        const decipher = crypto.createDecipheriv(DEC_ALGO, encryptionKey, iv);
        const ciphertext = Buffer.from(data).toString("base64");
        const rawCiphertext = ciphertext.substring(ENC_VER_PREFIX.length + 1);
        let plaintext = decipher.update(rawCiphertext, "base64", "utf8");

        plaintext += decipher.final("utf8");

        resolve(plaintext);
      })
      .catch((reason) => {
        reject(reason);
      });
  });
};
