const path = require("path");
const fs = require("fs");
const os = require("os");
const sqlite3 = require("sqlite3");

const package = require("./package.json");

const TEMP_DIR_PREFIX = `${package.name}-`;

/**
 * Copy data file to a temporary directory and try reading the file again.
 * This function can be used to mitigate `SQLITE_BUSY` errors by moving them
 * from where they were being used at the time.
 *
 * @param {string} filePath Path to the original data file being read by a browser.
 * @param {string} table Table that was being accessed at the time of the error.
 */
const dataFromTempFile = (filePath, table) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      reject(new TypeError("No file path."));

      return;
    }

    const prefix = path.join(os.tmpdir(), TEMP_DIR_PREFIX);

    fs.mkdtemp(prefix, (error, dirPath) => {
      if (error) {
        reject(error);

        return;
      }

      const fileName = path.basename(filePath);
      const destPath = path.join(dirPath, fileName);

      fs.copyFile(filePath, destPath, (error) => {
        if (error) {
          reject(error);

          return;
        }

        exports
          .dataFromFile(filePath, table)
          .then((rows) => {
            resolve(rows);
          })
          .catch((reason) => {
            reject(reason);
          });
      });
    });
  });
};

/**
 * Extract rows from a given table using a database and a file path for error handling.
 *
 * @param {sqlite3.Database} db An open SQLite database, preferably from a file.
 * @param {string} table Table to use when selecting the rows.
 * @param {string} filePath Path to the file being read.
 * @returns {Promise<any[]>}
 */
const rowsFromTable = (db, table, filePath) => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${table}`, (error, rows) => {
      if (error) {
        if (error.code === "SQLITE_BUSY") {
          dataFromTempFile(filePath, table)
            .then((rows) => {
              resolve(rows);
            })
            .catch((reason) => {
              reject(reason);
            });

          return;
        }

        reject(error);

        return;
      }

      resolve(rows);
    });
  });
};

/**
 * Extracts data from an SQLite file located at `filePath` using the SQL statement `SELECT * FROM table`.
 *
 * @param filePath {string} The path to an SQLite file.
 * @param table {string} The table to use in the `SELECT` statement, i.e. the table to extract data from.
 * @returns {Promise<any[]>} The rows selected from `table`.
 */
exports.dataFromFile = (filePath, table) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      reject(new Error("No file path provided."));

      return;
    }

    fs.access(filePath, fs.constants.R_OK, (error) => {
      if (error) {
        reject(error);

        return;
      }

      const db = new sqlite3.Database(
        filePath,
        sqlite3.OPEN_READONLY,
        (error) => {
          if (error) {
            reject(error);

            return;
          }

          rowsFromTable(db, table, filePath)
            .then((rows) => {
              resolve(rows);
            })
            .catch((reason) => {
              reject(reason);
            });
        }
      );
    });
  });
};

/**
 * Short-hand for `dataFromFile()` that combines the parameters to a path.
 *
 * @param browser {object} A Havelock browser object, e.g. `browser.chromium`.
 * @param profile {string} A profile where the user data of interest resides.
 * @param file {string} The SQLite file to extract data from.
 * @param table {string} The table to use in the `SELECT` statement, i.e. the table to extract data from.
 * @returns {Promise<Array>} The rows selected from `table`.
 */
exports.dataFromUddFile = (browser, profile, file, table) => {
  if (!browser || !profile || !file || !table) {
    return;
  }

  const filePath = path.join(browser.userDataDirectoryPath(), profile, file);

  return exports.dataFromFile(filePath, table);
};

/**
 * Short-hand for `dataFromFile()` that combines the parameters to a path to the `Login Data` file using the table `logins`.
 *
 * @param browser {object} A Havelock browser object, e.g. `browser.chromium`.
 * @param profile {string} A profile where the user data of interest resides.
 * @returns {Promise<Array>} The rows selected from `logins`.
 */
exports.logins = (browser, profile) => {
  if (!browser || !profile) {
    return;
  }

  const filePath = path.join(
    browser.userDataDirectoryPath(),
    profile,
    "Login Data"
  );

  return exports.dataFromFile(filePath, "logins");
};

/**
 * Short-hand for `dataFromFile()` that combines the parameters to a path to the `Cookies` file using the table `cookies`.
 *
 * @param browser {object} A Havelock browser object, e.g. `browser.chromium`.
 * @param profile {string} A profile where the user data of interest resides.
 * @returns {Promise<Array>} The rows selected from `cookies`.
 */
exports.cookies = (browser, profile) => {
  if (!browser || !profile) {
    return;
  }

  const filePath = path.join(
    browser.userDataDirectoryPath(),
    profile,
    "Cookies"
  );

  return exports.dataFromFile(filePath, "cookies");
};

/**
 * Short-hand for `dataFromFile()` that combines the parameters to a path to the `History` file using the table `urls`.
 *
 * @param browser {object} A Havelock browser object, e.g. `browser.chromium`.
 * @param profile {string} A profile where the user data of interest resides.
 * @returns {Promise<Array>} The rows selected from `urls`.
 */
exports.urls = (browser, profile) => {
  if (!browser || !profile) {
    return;
  }

  const filePath = path.join(
    browser.userDataDirectoryPath(),
    profile,
    "History"
  );

  return exports.dataFromFile(filePath, "urls");
};
