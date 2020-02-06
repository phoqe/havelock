const explorer = require("./explorer");
const browser = require("./browser");

explorer
  .getDataFromUserDataDirectoryFile(
    browser.chrome,
    "Profile 1",
    "Login Data",
    "logins"
  )
  .then(value => {
    console.log(value);
  })
  .catch(reason => {
    console.log(reason);
  });
