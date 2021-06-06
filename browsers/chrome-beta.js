const path = require("path");

exports.id = "chrome-beta";
exports.name = "Google Chrome Beta";
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
      "google-chrome-beta"
    );
  }

  return userDataDirectoryPath;
};
