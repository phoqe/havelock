const path = require("path");

exports.id = "chromium";
exports.name = "Chromium";
exports.keychain = {
  service: "Chromium Safe Storage",
  account: "Chromium",
};

exports.userDataDirectoryPath = () => {
  let userDataDirectoryPath;

  if (process.platform === "win32") {
    userDataDirectoryPath = path.join(
      process.env.LOCALAPPDATA,
      "Chromium",
      "User Data"
    );
  }

  if (process.platform === "darwin") {
    userDataDirectoryPath = path.join(
      process.env.HOME,
      "Library",
      "Application Support",
      "Chromium"
    );
  }

  if (process.platform === "linux") {
    userDataDirectoryPath = path.join(process.env.HOME, ".config", "chromium");
  }

  return userDataDirectoryPath;
};
