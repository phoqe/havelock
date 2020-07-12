if (process.platform === "win32") {
  module.exports = require("./crypto/win32");

  return;
}

if (process.platform === "darwin") {
  module.exports = require("./crypto/darwin");

  return;
}

if (process.platform === "linux") {
  module.exports = require("./crypto/linux");

  return;
}
