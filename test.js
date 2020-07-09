const havelock = require("./index");

const explorer = havelock.explorer;
const browser = havelock.browser;
const security = havelock.security;

explorer
  .getLoginsFromLoginDataFile(browser.chrome, "Default")
  .then((logins) => {
    logins.forEach((login) => {
      security
        .decryptData(browser.chrome, login.password_value)
        .then((value) => {
          console.log(value);
        })
        .catch((reason) => {
          console.error(reason);
        });
    });
  })
  .catch((reason) => {
    console.error(reason);
  });
