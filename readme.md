# Havelock

Extract and decrypt accounts, cookies, and history from web browsers based on Chromium. Havelock was initially developed as part of a remote administration tool for harvesting accounts from a computer and sending them to a remote endpoint securely. It’s now available as an API in JavaScript and a standalone CLI.

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

### Adding a browser

Feel free to add support for more browsers through a Pull Request. To get started, take a look at the existing browser definitions in [`/browsers`](browsers). The gist of adding a browser is simple. You need to figure out the Keychain credentials and provide a path resolution that works on Windows, macOS, and Linux.

## String Decryption

You can decrypt strings retrieved from your web browser using Havelock.

| Platform | Algorithm   | Supported | Source                                                                                                                  |
| -------- | ----------- | --------- | ----------------------------------------------------------------------------------------------------------------------- |
| Windows  | AES-256-GCM | No        | [`os_crypt_win.cc`](https://source.chromium.org/chromium/chromium/src/+/master:components/os_crypt/os_crypt_win.cc)     |
| macOS    | AES-128-CBC | Yes       | [`os_crypt_mac.mm`](https://source.chromium.org/chromium/chromium/src/+/master:components/os_crypt/os_crypt_mac.mm)     |
| Linux    | AES-128-CBC | Yes       | [`os_crypt_linux.cc`](https://source.chromium.org/chromium/chromium/src/+/master:components/os_crypt/os_crypt_linux.cc) |

## API

The Havelock API is available in JavaScript. You can only use it from a Node.js environment.

### Installation

Havelock is available as `havelock` in npm. Use your favorite package manager to install it for your Node.js project:

```sh
yarn add havelock
```

### Usage

Using the Havelock API is quick and easy.

#### Extracting data

Here’s an example of retrieving data from the `logins` table in the `Login Data` file of the `Default` profile in Google Chrome:

```js
const havelock = require("havelock");

const explorer = havelock.explorer;
const browser = havelock.browser;

explorer
  .dataFromUddFile(browser.chrome, "Default", "Login Data", "logins")
  .then((logins) => {
    console.info(logins);
  })
  .catch((reason) => {
    console.error(reason);
  });
```

There are also shorthands available for interesting files. You can achieve the same result using this shorter function:

```js
explorer
  .logins(browser.chrome, "Default")
  .then((logins) => {
    console.log(logins);
  })
  .catch((reason) => {
    console.error(reason);
  });
```

#### Decrypting data

Havelock can decrypt passwords and credit cards numbers. Here’s an example of decrypting a password from the `logins` table in the `Login Data` file of the `Default` profile of Google Chrome:

```js
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
```

## CLI

Havelock is also available as a standalone CLI. It can be used separately to execute commands on the local machine.

### Installation

The Havelock CLI can be included by using your favorite package manager to install it globally:

```sh
yarn global add havelock
```

### Usage

The command `havelock` should now be available globally throughout your system. You can see the commands and options with:

```sh
havelock --help
```

### Extracting data

You can retrieve your logins from the default profile in Google Chrome with:

```sh
havelock logins chrome default
```

If you want a more filtered version of the output, i.e. interesting data points, you can use the option `-t`:

```sh
havelock logins chrome default -t
```

### Decrypting data

Use the option `-d` if you want to decrypt fields known to be encrypted.

## Attribution

Thank you to David Sheldrick ([ds300](https://github.com/ds300)) for passing on the package name.

## License

MIT
