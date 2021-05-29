const fs = require("fs");
const path = require("path");

const { program } = require("commander");
const prettier = require("prettier");

const havelock = require("../index");

const opts = program.opts();
const explorer = havelock.explorer;

/**
 * Shows an optional error message and exits the program with an error code.
 *
 * @param {string} message Message to show before exiting. Will be sent to `stderr`.
 * @param {any[]} optionalParams Any additional params to help the user.
 */
const error = (message = null, ...optionalParams) => {
  if (message) {
    console.error(message, optionalParams);
  }

  process.exit(1);
};

/**
 * Shows an optional message and exits the program normally.
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

const writeToFile = (fileName, data) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(process.cwd(), fileName);
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

exports.logins = (browser, profile = "Default") => {
  console.debug("logins");
  console.debug("browser", browser);
  console.debug("profile", profile);
  console.debug("opts", opts);

  browser = havelock.browser[browser];

  if (!browser) {
    error(
      "Failed to convert the specified browser string to a verified Havelock browser. Make sure the browser is supported."
    );

    return;
  }

  console.debug(
    "Converted the specified browser string to a verified Havelock browser."
  );

  explorer
    .getLoginsFromLoginDataFile(browser, profile)
    .then((logins) => {
      console.debug("Retrieved logins from data file.");
      console.debug("logins", logins.length);

      if (opts.tabular) {
        console.table(logins, [
          "origin_url",
          "username_value",
          "password_value",
        ]);
      } else if (opts.file) {
        writeToFile("logins.json", logins)
          .then((filePath) => {
            success(filePath);
          })
          .catch((reason) => {
            error(reason.message);
          });
      } else {
        success(logins);
      }
    })
    .catch((reason) => {
      error("Failed to retrieve logins from data file.", reason);
    });
};

exports.cookies = (browser, profile = "Default", opts) => {
  console.debug("cookies");
  console.debug("browser", browser);
  console.debug("profile", profile);
  console.debug("opts", opts);

  browser = havelock.browser[browser];

  if (!browser) {
    error(
      "Failed to convert the specified browser string to a verified Havelock browser. Make sure the browser is supported."
    );

    return;
  }

  console.debug(
    "Converted the specified browser string to a verified Havelock browser."
  );

  explorer
    .getCookiesFromCookiesFile(browser, profile)
    .then((cookies) => {
      console.debug("Retrieved cookies from data file.");
      console.debug("cookies", cookies.length);

      if (opts.tabular) {
        console.table(urls, ["host_key", "name", "encrypted_value"]);
      } else if (opts.file) {
        writeToFile("cookies.json", cookies)
          .then((filePath) => {
            success(filePath);
          })
          .catch((reason) => {
            error(reason.message);
          });
      } else {
        success(cookies);
      }
    })
    .catch((reason) => {
      error("Failed to retrieve cookies from data file.", reason);
    });
};

exports.urls = (browser, profile = "Default", opts) => {
  console.debug("urls");
  console.debug("browser", browser);
  console.debug("profile", profile);
  console.debug("opts", opts);

  browser = havelock.browser[browser];

  if (!browser) {
    error(
      "Failed to convert the specified browser string to a verified Havelock browser. Make sure the browser is supported."
    );

    return;
  }

  console.debug(
    "Converted the specified browser string to a verified Havelock browser."
  );

  explorer
    .getUrlsFromHistoryFile(browser, profile)
    .then((urls) => {
      console.debug("Retrieved URLs from data file.");
      console.debug("urls", urls.length);

      if (opts.tabular) {
        console.table(urls, ["url", "title"]);
      } else if (opts.urls) {
        writeToFile("urls.json", urls)
          .then((filePath) => {
            success(filePath);
          })
          .catch((reason) => {
            error(reason.message);
          });
      } else {
        success(urls);
      }
    })
    .catch((reason) => {
      error("Failed to retrieve URLs from data file.", reason);
    });
};