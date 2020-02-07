const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3");

/**
 * Extracts data from an SQLite file located at `filePath` using the SQL statement `SELECT * FROM table`.
 *
 * @param filePath {string} The path to an SQLite file.
 * @param table {string} The table to use in the `SELECT` statement, i.e. the table to extract data from.
 * @returns {Promise<Array>} The rows selected from `table`.
 */
exports.getDataFromFile = (filePath, table) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      reject();

      return;
    }

    // Check if the file exists and is accessible.
    fs.access(filePath, fs.constants.R_OK, error => {
      if (error) {
        reject(error);

        return;
      }

      const database = new sqlite3.Database(
        filePath,
        sqlite3.OPEN_READONLY,
        error => {
          if (error) {
            reject(error);

            return;
          }

          database.all(`SELECT * FROM ${table}`, (error, rows) => {
            if (error) {
              reject(error);

              return;
            }

            // Resolves the promise with all found entries in the table.
            resolve(rows);
          });
        }
      );
    });
  });
};

/**
 * Short-hand for `getDataFromFile()` that combines the parameters to a path.
 *
 * @param browser {object} A Havelock browser object, e.g. `browser.chromium`.
 * @param profile {string} A profile where the user data of interest resides.
 * @param file {string} The SQLite file to extract data from.
 * @param table {string} The table to use in the `SELECT` statement, i.e. the table to extract data from.
 * @returns {Promise<Array>} The rows selected from `table`.
 */
exports.getDataFromUserDataDirectoryFile = (browser, profile, file, table) => {
  if (!browser || !profile || !file || !table) {
    return;
  }

  const filePath = path.join(browser.getUserDataDirectoryPath(), profile, file);

  return exports.getDataFromFile(filePath, table);
};

/**
 * Short-hand for `getDataFromFile()` that combines the parameters to a path to the `Login Data` file using the table `logins`.
 *
 * @param browser {object} A Havelock browser object, e.g. `browser.chromium`.
 * @param profile {string} A profile where the user data of interest resides.
 * @returns {Promise<Array>} The rows selected from `logins`.
 */
exports.getLoginsFromLoginDataFile = (browser, profile) => {
  if (!browser || !profile) {
    return;
  }

  const filePath = path.join(
    browser.getUserDataDirectoryPath(),
    profile,
    "Login Data"
  );

  return exports.getDataFromFile(filePath, "logins");
};

/**
 * Short-hand for `getDataFromFile()` that combines the parameters to a path to the `Cookies` file using the table `cookies`.
 *
 * @param browser {object} A Havelock browser object, e.g. `browser.chromium`.
 * @param profile {string} A profile where the user data of interest resides.
 * @returns {Promise<Array>} The rows selected from `cookies`.
 */
exports.getCookiesFromCookiesFile = (browser, profile) => {
  if (!browser || !profile) {
    return;
  }

  const filePath = path.join(
    browser.getUserDataDirectoryPath(),
    profile,
    "Cookies"
  );

  return exports.getDataFromFile(filePath, "cookies");
};

/**
 * Short-hand for `getDataFromFile()` that combines the parameters to a path to the `History` file using the table `urls`.
 *
 * @param browser {object} A Havelock browser object, e.g. `browser.chromium`.
 * @param profile {string} A profile where the user data of interest resides.
 * @returns {Promise<Array>} The rows selected from `urls`.
 */
exports.getUrlsFromHistoryFile = (browser, profile) => {
  if (!browser || !profile) {
    return;
  }

  const filePath = path.join(
    browser.getUserDataDirectoryPath(),
    profile,
    "History"
  );

  return exports.getDataFromFile(filePath, "urls");
};
