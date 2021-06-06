const path = require("path");

exports.id = "chrome-dev";
exports.name = "Google Chrome Dev";
exports.keychain = {
  service: "Chrome Safe Storage",
  account: "Chrome",
};

exports.userDataDirectoryPath = () => {
  let userDataDirectoryPath;

  if (process.platform === "linux") {
    userDataDirectoryPath = path.join(
      process.env.HOME,
      ".config",
      "google-chrome-unstable"
    );
  }

  return userDataDirectoryPath;
};
