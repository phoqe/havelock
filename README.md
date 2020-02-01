# Havelock

A simple module to extract logins, cookies, and history from Chromium-based web browsers using SQLite.

## Usage

Havelock presents a simple to use API that is robust and easy to get started with.
In fact, there is only one major method, `getData(browser, profile, file)`, that is extended with shortcut methods.

Here is an example of how to retrieve logins in the Google Chrome web browser:

```js
const havelock = require("havelock");

havelock
  .getData("chrome", "Profile 1", "Login Data")
  .then(value => {
    console.log(value);
  })
  .catch(reason => {
    console.log(reason);
  });
```

You can find supported web browsers and files using `havelock.browsers` and `havelock.files`.

## License

[MIT License](https://github.com/phoqe/havelock/blob/master/LICENSE.md)
