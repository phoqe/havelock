const path = require("path");

exports.id = "brave";
exports.name = "Brave";
exports.keychain = {
  service: "Brave Safe Storage",
  account: "Brave",
};

exports.userDataDirectoryPath = () => {
  let userDataDirectoryPath;

  if (process.platform === "win32") {
    userDataDirectoryPath = path.join(
      process.env.LOCALAPPDATA,
      "BraveSoftware",
      "Brave-Browser",
      "User Data"
    );
  }

  if (process.platform === "darwin") {
    userDataDirectoryPath = path.join(
      process.env.HOME,
      "Library",
      "Application Support",
      "BraveSoftware",
      "Brave-Browser"
    );
  }

  if (process.platform === "linux") {
    userDataDirectoryPath = path.join(process.env.HOME, ".config", "brave");
  }

  return userDataDirectoryPath;
};
