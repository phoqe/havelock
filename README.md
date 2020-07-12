# Havelock

Havelock is a simple Node.js package capable of extracting data such as accounts, cookies, and history from web browsers based on Chromium, e.g., Google Chrome and Brave.

<p align="center">
  <img src="https://user-images.githubusercontent.com/7033377/87176128-f148e700-c2d9-11ea-83c3-700c7f318b2a.png">  
</p>

## Verified web browsers

Every Chromium-based web browser using the same storage mechanism for user data is supported. These are the web browsers I’ve tested:

| Name                 | API            | Platform(s)           |
| -------------------- | -------------- | --------------------- |
| Chromium             | `chromium`     | Windows, macOS, Linux |
| Google Chrome Stable | `chrome`       | Windows, macOS, Linux |
| Google Chrome Beta   | `chromeBeta`   | Linux                 |
| Google Chrome Dev    | `chromeDev`    | Linux                 |
| Google Chrome Canary | `chromeCanary` | Windows, macOS        |
| Brave Stable         | `brave`        | Windows, macOS, Linux |

## String decryption

You can decrypt strings retrieved from your web browser using Havelock. Currently, there is only support for macOS.

| Platform | Algorithm   | Supported | Source                                                                                                                  |
| -------- | ----------- | --------- | ----------------------------------------------------------------------------------------------------------------------- |
| Windows  | AES-256-GCM | No        | [`os_crypt_win.cc`](https://source.chromium.org/chromium/chromium/src/+/master:components/os_crypt/os_crypt_win.cc)     |
| macOS    | AES-128-CBC | Yes       | [`os_crypt_mac.mm`](https://source.chromium.org/chromium/chromium/src/+/master:components/os_crypt/os_crypt_mac.mm)     |
| Linux    | AES-128-CBC | No        | [`os_crypt_linux.cc`](https://source.chromium.org/chromium/chromium/src/+/master:components/os_crypt/os_crypt_linux.cc) |

## Getting started

Havelock is easy to install, make sure you have Node.js installed and you’re ready to go.

```sh
yarn add havelock
```

### Extracting data

Here’s an example of retrieving data from the `logins` table in the `Login Data` file of the `Default` profile in Google Chrome:

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
  .then((value) => {
    console.log(value);
  })
  .catch((reason) => {
    console.error(reason);
  });
```

There are also shortcuts available for files of interest, you can achieve the same result using this shorter function:

```js
explorer
  .getLoginsFromLoginDataFile(browser.chrome, "Default")
  .then((value) => {
    console.log(value);
  })
  .catch((reason) => {
    console.error(reason);
  });
```

### Decrypting data

Havelock supports decryption of encrypted passwords and credit cards numbers, here’s an example of decrypting a password from the `logins` table in the `Login Data` file of the `Default` profile of Google Chrome:

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
```

## CLI

If you’re not interested in the programmatic API, you can use the CLI version of Havelock. You can install it globally using Yarn:

```sh
yarn global add havelock
```

The command `havelock` is now available globally throughout your system. You can see the commands and options with:

```sh
havelock --help
```

For example, you could retrieve your logins from the default profile in Google Chrome with:

```sh
havelock logins chrome default
```

## Attribution

Thank you to David Sheldrick ([ds300](https://github.com/ds300)) for passing on the package name.

## License

MIT
