// Core modules
const crypto = require("crypto");

// Third-party modules
const keytar = require("keytar");

/**
 *
 * @param {object} browser
 * @param {string} version
 * @returns {Promise<string>}
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

    if (version === "v10") {
      resolve("peanuts");

      return;
    }

    if (version === "v11") {
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
          password, // password
          "saltysalt", // salt
          1, // iterations
          128, // keylen
          "sha1", // digest
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
 *
 * @param {object} browser
 * @param {Buffer} data
 * @returns {Promise<string>}
 */
exports.decryptData = (browser, data) => {
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
    let version = null;

    // Check that the incoming data was encrypted and with what version.
    // Credit card numbers are current legacy unencrypted data at the time of writing.
    // So false match with prefix won't happen.
    if (dataString.startsWith("v10")) {
      version = "v10";
    } else if (dataString.startsWith("v11")) {
      version = "v11";
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

        const iv = Buffer.alloc(16, "20", "hex");
        const decipher = crypto.createDecipheriv("aes-128-gcm", key, iv);
        const ciphertext = Buffer.from(data).toString("base64");
        const rawCiphertext = ciphertext.substring(version);
        let plaintext = decipher.update(rawCiphertext, "base64", "utf8");

        plaintext += decipher.final("utf8");

        resolve(plaintext);
      })
      .catch((reason) => {
        reject(reason);
      });
  });
};
