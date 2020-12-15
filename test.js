const havelock = require("./index");

const explorer = havelock.explorer;
const browser = havelock.browser;

explorer
  .getUrlsFromHistoryFile(browser.brave, "Default")
  .then((urls) => {
    urls.forEach((url) => {
      console.log(url);
    });
  })
  .catch((reason) => {
    console.error(reason);
  });
