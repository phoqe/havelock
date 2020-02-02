const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3");

/**
 * Supported Chromium-based web browsers.
 * @type {string[]}
 */
const browsers = [
  "chromium",
  "chrome",
  "chrome-beta",
  "chrome-canary",
  "chrome-dev"
];

/**
 * Supported files in the user data directory.
 * @type {[string, string, string]}
 */
const files = ["Login Data", "Cookies", "History"];

/**
 * Helper method to retrieve the user data directory path for different
 * browsers and platforms.
 * @param browser {string}
 * @returns {null|string}
 */
userDataDirectory = browser => {
  if (!browser || !browsers.includes(browser)) {
    return null;
  }

  const platform = process.platform;
  let userDataDirectory = null;

  if (browser === "chromium") {
    if (platform === "win32") {
      userDataDirectory = path.join(
        process.env.LOCALAPPDATA,
        "Chromium",
        "User Data"
      );
    }

    if (platform === "darwin") {
      userDataDirectory = path.join(
        process.env.HOME,
        "Library",
        "Application Support",
        "Chromium"
      );
    }

    if (platform === "linux") {
      userDataDirectory = path.join(process.env.HOME, ".config", "chromium");
    }
  }

  if (browser === "chrome") {
    if (platform === "win32") {
      userDataDirectory = path.join(
        process.env.LOCALAPPDATA,
        "Google",
        "Chrome",
        "User Data"
      );
    }

    if (platform === "darwin") {
      userDataDirectory = path.join(
        process.env.HOME,
        "Library",
        "Application Support",
        "Google",
        "Chrome"
      );
    }

    if (platform === "linux") {
      userDataDirectory = path.join(
        process.env.HOME,
        ".config",
        "google-chrome"
      );
    }
  }

  if (browser === "chrome-beta") {
    if (platform === "linux") {
      userDataDirectory = path.join(
        process.env.HOME,
        ".config",
        "google-chrome-beta"
      );
    }
  }

  if (browser === "chrome-canary") {
    if (platform === "win32") {
      userDataDirectory = path.join(
        process.env.LOCALAPPDATA,
        "Google",
        "Chrome SxS",
        "User Data"
      );
    }

    if (platform === "darwin") {
      userDataDirectory = path.join(
        process.env.HOME,
        "Library",
        "Application Support",
        "Google",
        "Chrome Canary"
      );
    }
  }

  if (browser === "chrome-dev") {
    if (platform === "linux") {
      userDataDirectory = path.join(
        process.env.HOME,
        ".config",
        "google-chrome-unstable"
      );
    }
  }

  return userDataDirectory;
};

/**
 * Extracts data from a browser’s profile’s file.
 *
 * The `browser` needs to be a supported browser, consult the exported
 * `browsers` array for all supported browsers.
 *
 * The `profile` must be a Chromium profile, meaning it contains user data. In
 * most cases, `Default` is the default profile but if you have created a new
 * profile or synchronized with Google, this might have changed to `Profile 1`
 * or something else.
 *
 * The `file` needs to be a supported file, consult the exported `files` array
 * for all supported files.
 *
 * @param browser {string}
 * @param profile {string}
 * @param file {string}
 * @returns {Promise<Array>}
 */
exports.getData = (browser, profile, file) => {
  return new Promise((resolve, reject) => {
    if (!browser || !profile || !file) {
      reject();

      return;
    }

    if (!browsers.includes(browser)) {
      reject();

      return;
    }

    if (!files.includes(file)) {
      reject();

      return;
    }

    const filePath = path.join(userDataDirectory(browser), profile, file);

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

          let table;

          switch (file) {
            case "Login Data":
              table = "logins";
              break;

            case "Cookies":
              table = "cookies";
              break;

            case "History":
              table = "urls";
              break;

            default:
              table = null;
              break;
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

/**
 * Short-hand method for using the Login Data file with `getData()`.
 *
 * @param browser {string}
 * @param profile {string}
 * @returns {Promise<Array>}
 */
exports.getLoginData = (browser, profile) => {
  return exports.getData(browser, profile, "Login Data");
};

/**
 * Short-hand method for using the Cookies file with `getData()`.
 *
 * @param browser {string}
 * @param profile {string}
 * @returns {Promise<Array>}
 */
exports.getCookies = (browser, profile) => {
  return exports.getData(browser, profile, "Cookies");
};

/**
 * Short-hand method for using the History file with `getData()`.
 *
 * @param browser {string}
 * @param profile {string}
 * @returns {Promise<Array>}
 */
exports.getHistory = (browser, profile) => {
  return exports.getData(browser, profile, "History");
};
