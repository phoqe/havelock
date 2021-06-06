const path = require("path");

exports.id = "chrome-canary";
exports.name = "Google Chrome Canary";
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
      "Chrome SxS",
      "User Data"
    );
  }

  if (process.platform === "darwin") {
    userDataDirectoryPath = path.join(
      process.env.HOME,
      "Library",
      "Application Support",
      "Google",
      "Chrome Canary"
    );
  }

  return userDataDirectoryPath;
};
