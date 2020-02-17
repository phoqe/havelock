# Havelock

Havelock is a simple Node.js package that is capable of extracting data such as logins, cookies, and history from web browsers based on Chromium, e.g. Google Chrome and Brave.

It’s a simple yet extensible API that can be applied for all Chromium-based browsers of the platforms Windows, macOS, and Linux, so long as the user data storage mechanism from Chromium persists through the vendor customization.

## Default web browsers

All Chromium-based browsers are supported implicitly. However, the browsers listed here are supported explicitly. What this means is that these browsers have detailed information about them readily available, like paths and password and salt combinations for string decryption.

| Name                 | API            | Platform(s)           |
| -------------------- | -------------- | --------------------- |
| Chromium             | `chromium`     | Windows, macOS, Linux |
| Google Chrome Stable | `chrome`       | Windows, macOS, Linux |
| Google Chrome Beta   | `chromeBeta`   | Linux                 |
| Google Chrome Dev    | `chromeDev`    | Linux                 |
| Google Chrome Canary | `chromeCanary` | Windows, macOS        |
| Brave Stable         | `brave`        | Windows, macOS, Linux |

## Installation

Havelock is very easy to install, just make sure you have Node.js installed and you’re ready to go. You can use your package manager of choice when installing Havelock:

### npm

```
npm install havelock
```

### yarn

```
yarn add havelock
```

## Usage

Using Havelock is also easy, with its idiomatic API you can get started in no time.

### Extract data

Here’s an example of retrieving logins from the Login Data file in the Default profile in Google Chrome:

```js
const havelock = require("havelock");

const explorer = havelock.explorer;
const browser = havelock.browser;

explorer
  .getDataFromUserDataDirectoryFile(
    browser.chrome,
    "Default",
    "Login Data",
    "logins"
  )
  .then(value => {
    console.log(value);
  })
  .catch(reason => {
    console.error(reason);
  });
```

There are also shortcuts available for files of interest, you can achieve the same result using this shorter function:

```js
const havelock = require("havelock");

const explorer = havelock.explorer;
const browser = havelock.browser;

explorer
  .getLoginsFromLoginDataFile(browser.chrome, "Default")
  .then(value => {
    console.log(value);
  })
  .catch(reason => {
    console.error(reason);
  });
```

### Decrypt data (macOS only)

Havelock supports decrypting data such as passwords and credit cards, note that this is a macOS only feature at the moment, Windows and Linux support will arrive momentarily.

```js
const havelock = require("havelock");

const explorer = havelock.explorer;
const browser = havelock.browser;
const security = havelock.security;

explorer
  .getDataFromUserDataDirectoryFile(
    browser.chrome,
    "Default",
    "Login Data",
    "logins"
  )
  .then(logins => {
    logins.forEach(login => {
      security
        .decryptData(browser.chrome, login.password_value)
        .then(value => {
          console.log(value);
        })
        .catch(reason => {
          console.error(reason);
        });
    });
  })
  .catch(reason => {
    console.error(reason);
  });
```

## Attribution

Thank you to David Sheldrick ([ds300](https://github.com/ds300)) for passing on the package name.

## [License](https://github.com/phoqe/havelock/blob/master/LICENSE.md)
