# Havelock

Havelock is a module capable of extracting data such as login data, cookies, and history from Chromium-based web browsers such as Google Chrome.

## Usage

Havelock provides a simple API that is easy to use, you can for example extract logins from Google Chrome using this code:

```js
const havelock = require("havelock.js");

havelock
  .getData("chrome", "Default", "Login Data")
  .then(value => {
    console.log(value);
  })
  .catch(reason => {
    console.log(reason);
  });
```

This code assumes that Google Chrome is installed, your profile is `Default`, and data exists in the file `Login Data`.

## Supported Web Browsers

Havelock supports all Chromium-based web browsers that use the user data directory for storing user data.

These are supported out of the box:

| Name                 | Identifier      | Platform(s)           |
| -------------------- | --------------- | --------------------- |
| Chromium             | `chromium`      | Windows, macOS, Linux |
| Google Chrome        | `chrome`        | Windows, macOS, Linux |
| Google Chrome Beta   | `chrome-beta`   | Linux                 |
| Google Chrome Canary | `chrome-canary` | Windows, macOS        |
| Google Chrome Dev    | `chrome-dev`    | Linux                 |

If your web browser isn’t listed here, you can use the `getDataFromPath(path, table)` function.
You need to know the full path to the file and which table to access.

## License

[MIT License](https://github.com/phoqe/havelock/blob/master/LICENSE.md)
