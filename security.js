if (process.platform === "win32") {
  module.exports = require("./security/win32");

  return;
}

if (process.platform === "darwin") {
  module.exports = require("./security/darwin");

  return;
}

if (process.platform === "linux") {
  module.exports = require("./security/linux");

  return;
}
