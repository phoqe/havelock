const havelock = require("./havelock");

const explorer = havelock.explorer;
const browser = havelock.browser;
const crypto = havelock.crypto;

explorer
  .dataFromUddFile(browser.chrome, "Default", "Login Data", "logins")
  .then((logins) => {
    logins.forEach((login) => {
      crypto
        .decrypt(browser.chrome, login.password_value)
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
