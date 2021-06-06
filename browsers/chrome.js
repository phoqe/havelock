const path = require("path");

exports.id = "chrome";
exports.name = "Google Chrome";
exports.keychain = {
  service: "Chrome Safe Storage",
  account: "Chrome",
};

exports.userDataDirectoryPath = () => {
  let userDataDirectoryPath;

  if (process.platform === "win32") {
    userDataDirectoryPath = path.join(
      process.env.LOCALAPPDATA,
      "Google",
      "Chrome",
      "User Data"
    );
  }

  if (process.platform === "darwin") {
    userDataDirectoryPath = path.join(
      process.env.HOME,
      "Library",
      "Application Support",
      "Google",
      "Chrome"
    );
  }

  if (process.platform === "linux") {
    userDataDirectoryPath = path.join(
      process.env.HOME,
      ".config",
      "google-chrome"
    );
  }

  return userDataDirectoryPath;
};
