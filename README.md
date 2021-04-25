# Havelock

Havelock can extract and decrypt accounts, cookies, and history from web browsers based on Chromium. Initially developed as part of a remote administration tool for harvesting accounts from a computer and sending them to a remote endpoint securely. Now available as a programmatic API in JavaScript and a CLI for local operations.

## Verified Web Browsers

Every web browser using the same storage mechanism for user data is supported. These are the verified web browsers:

| Name                 | API            | Platform(s)           |
| -------------------- | -------------- | --------------------- |
| Chromium             | `chromium`     | Windows, macOS, Linux |
| Google Chrome Stable | `chrome`       | Windows, macOS, Linux |
| Google Chrome Beta   | `chromeBeta`   | Linux                 |
| Google Chrome Dev    | `chromeDev`    | Linux                 |
| Google Chrome Canary | `chromeCanary` | Windows, macOS        |
| Brave Stable         | `brave`        | Windows, macOS, Linux |

### Adding a Browser

Feel free to add support for more browsers through a Pull Request. To get started, take a look at the existing browser definitions in [`/browsers`](browsers). The gist of adding a browser is simple. You need to figure out the Keychain credentials and provide a path resolution that works on Windows, macOS, and Linux.

## String Decryption

You can decrypt strings retrieved from your web browser using Havelock. Currently, there is only support for macOS.

| Platform | Algorithm   | Supported | Source                                                                                                                  |
| -------- | ----------- | --------- | ----------------------------------------------------------------------------------------------------------------------- |
| Windows  | AES-256-GCM | No        | [`os_crypt_win.cc`](https://source.chromium.org/chromium/chromium/src/+/master:components/os_crypt/os_crypt_win.cc)     |
| macOS    | AES-128-CBC | Yes       | [`os_crypt_mac.mm`](https://source.chromium.org/chromium/chromium/src/+/master:components/os_crypt/os_crypt_mac.mm)     |
| Linux    | AES-128-CBC | No        | [`os_crypt_linux.cc`](https://source.chromium.org/chromium/chromium/src/+/master:components/os_crypt/os_crypt_linux.cc) |

### Windows and Linux

There is no decryption support for Windows and Linux yet.

## Usage

### Extracting Data

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

### Decrypting Data

Havelock supports decryption of encrypted passwords and credit cards numbers, here’s an example of decrypting a password from the `logins` table in the `Login Data` file of the `Default` profile of Google Chrome:

```js
const crypto = havelock.crypto;

explorer
  .getDataFromUserDataDirectoryFile(
    browser.chrome,
    "Default",
    "Login Data",
    "logins"
  )
  .then((logins) => {
    logins.forEach((login) => {
      crypto
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

If you want a more filtered version of the output, i.e. interesting data points, you can use the option `-t`:

```sh
havelock logins chrome default -t
```

Also, if you want to decrypt known encrypted fieds, use the option `-d`.

## Attribution

Thank you to David Sheldrick ([ds300](https://github.com/ds300)) for passing on the package name.

## License

MIT
