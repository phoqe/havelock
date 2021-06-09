const fs = require("fs");
const path = require("path");
const { program } = require("commander");
const prettier = require("prettier");
const havelock = require("../havelock");
const commander = require("commander");

const explorer = havelock.explorer;

/**
 * Show an optional error message and exits the program with an error code.
 *
 * @param {string} message Message to show before exiting. Will be sent to `stderr`.
 * @param {any[]} optionalParams Any additional params to help the user.
 */
const error = (message = null, ...optionalParams) => {
  if (message) {
    console.error(message, ...optionalParams);
  }

  process.exit(1);
};

/**
 * Show an optional message and exits the program normally.
 *
 * @param {string} message Message to show before exiting. Will be sent to `stdout`.
 * @param {any[]} optionalParams Any additional params to help the user.
 */
const success = (message = null, ...optionalParams) => {
  if (message) {
    console.info(message, ...optionalParams);
  }

  process.exit(0);
};

/**
 * Instead of printing the data to `stdout` you can use this method to write the data to a file.
 *
 * @param {string} fileName The name of the file to write the `data` to. Do not include the file extension, it will use `.json` by default.
 * @param {any} data The data to write to the file. It should be convertable using `JSON.stringify()`.
 *
 * @returns {Promise<string>} Promise resolved with the complete file path or rejected with a `NodeJS.ErrnoException`.
 */
const writeToFile = (fileName, data) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(process.cwd(), fileName + ".json");
    const json = JSON.stringify(data);
    const fmtJson = prettier.format(json, { parser: "json" });

    fs.writeFile(filePath, fmtJson, { encoding: "utf8" }, (err) => {
      if (err) {
        reject(err);

        return;
      }

      resolve(filePath);
    });
  });
};

/**
 * Print array of `data` in a table structure.
 * Supply `type` to use typical data points.
 *
 * @param {string} type Type of data, e.g., `logins` or `urls`.
 * @param {object[]} data Data to structure in a table.
 */
const tabular = (type, data) => {
  switch (type) {
    case "logins":
      console.table(data, ["origin_url", "username_value", "password_value"]);
      break;

    case "cookies":
      console.table(data, ["host_key", "name", "encrypted_value"]);
      break;

    case "urls":
      console.table(data, ["url", "title"]);
      break;

    default:
      console.table(data);
      break;
  }
};

/**
 * Return the encrypted field for a type of data, e.g., for `logins` it's `password_value`.
 *
 * @param {string} type
 * @returns {string}
 */
const encryptedFieldForType = (type) => {
  switch (type) {
    case "logins":
      return "password_value";
    case "cookies":
      return "encrypted_value";
    default:
      return null;
  }
};

/**
 * Decrypt specified `rows` and return them in the same format but with the decrypted value.
 *
 * @param {object[]} rows Rows to decrypt. Must adhere to correct fields.
 * @param {object} browser Browser to decrypt from.
 * @param {string} type Type of data to decrypt.
 * @returns {Promise<object[]>}
 */
const decrypt = (rows, browser, type) => {
  return new Promise((resolve, reject) => {
    if (!rows) {
      reject(new TypeError("No rows."));

      return;
    }

    const decs = [];

    rows.forEach((row) => {
      const encField = encryptedFieldForType(type);

      decs.push(
        havelock.crypto.decrypt(browser, row[encField]).then((plaintext) => {
          return {
            ...row,
            [encField]: plaintext,
          };
        })
      );
    });

    Promise.all(decs)
      .then((decRows) => {
        resolve(decRows);
      })
      .catch((reason) => {
        reject(reason);
      });
  });
};

/**
 * Print `data` in multiple formats.
 * Format is deduced from `opts`.
 *
 * @param {string} type Type of data to print. Used to determine interesting data points.
 * @param {Array} data Data to print. Must be an `Array`.
 * @param {commander.OptionValues} opts Program options used to determine format type.
 * @param {object} browser
 * @returns
 */
const printData = (type, data, opts, browser) => {
  return new Promise((resolve, reject) => {
    if (!data.length) {
      reject();

      return;
    }

    if (opts.decrypt) {
      decrypt(data, browser, type)
        .then((rows) => {
          if (opts.tabular) {
            tabular(type, rows);

            resolve();

            return;
          }

          if (opts.file) {
            writeToFile(type, rows)
              .then((filePath) => {
                resolve(filePath);
              })
              .catch((reason) => {
                reject(reason);
              });

            return;
          }

          console.info(rows);

          resolve();
        })
        .catch((reason) => {
          reject(reason);
        });

      return;
    }

    if (opts.tabular) {
      tabular(type, data);

      resolve();

      return;
    }

    if (opts.file) {
      writeToFile(type, data)
        .then((filePath) => {
          resolve(filePath);
        })
        .catch((reason) => {
          reject(reason);
        });

      return;
    }

    console.info(data);

    resolve();
  });
};

exports.logins = (browser, profile = "Default") => {
  const opts = program.opts();

  browser = havelock.browser[browser];

  if (!browser) {
    error(
      "Couldn't convert the specified browser to a verified Havelock browser."
    );

    return;
  }

  explorer
    .logins(browser, profile)
    .then((logins) => {
      printData("logins", logins, opts, browser)
        .then((filePath) => {
          if (filePath) {
            success(filePath);

            return;
          }

          success();
        })
        .catch((reason) => {
          if (reason) {
            error("Failed to write data to file.", reason);

            return;
          }

          error("No data.");
        });
    })
    .catch((reason) => {
      error("Failed to retrieve logins from data file.", reason);
    });
};

exports.cookies = (browser, profile = "Default") => {
  const opts = program.opts();

  browser = havelock.browser[browser];

  if (!browser) {
    error(
      "Couldn't convert the specified browser to a verified Havelock browser."
    );

    return;
  }

  explorer
    .cookies(browser, profile)
    .then((cookies) => {
      printData("cookies", cookies, opts, browser)
        .then((filePath) => {
          if (filePath) {
            success(filePath);

            return;
          }

          success();
        })
        .catch((reason) => {
          if (reason) {
            error("Failed to write data to file.", reason);

            return;
          }

          error("No data.");
        });
    })
    .catch((reason) => {
      error("Failed to retrieve cookies from data file.", reason);
    });
};

exports.urls = (browser, profile = "Default") => {
  const opts = program.opts();

  browser = havelock.browser[browser];

  if (!browser) {
    error(
      "Couldn't convert the specified browser to a verified Havelock browser."
    );

    return;
  }

  explorer
    .urls(browser, profile)
    .then((urls) => {
      printData("urls", urls, opts, browser)
        .then((filePath) => {
          if (filePath) {
            success(filePath);

            return;
          }

          success();
        })
        .catch((reason) => {
          if (reason) {
            error("Failed to write data to file.", reason);

            return;
          }

          error("No data.");
        });
    })
    .catch((reason) => {
      error("Failed to retrieve URLs from data file.", reason);
    });
};
