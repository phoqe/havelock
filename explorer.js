const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3");

exports.getDataFromFile = (filePath, table) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      reject();

      return;
    }

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

            resolve(rows);
          });
        }
      );
    });
  });
};

exports.getDataFromUserDataDirectoryFile = (browser, profile, file, table) => {
  if (!browser || !profile || !file || !table) {
    return;
  }

  const filePath = path.join(browser.getUserDataDirectoryPath(), profile, file);

  return exports.getDataFromFile(filePath, table);
};
