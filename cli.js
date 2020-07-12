#!/usr/bin/env node

const { program } = require("commander");
const havelock = require("./index");
const package = require("./package.json");

program.name(package.name);
program.version(package.version);

program
  .option(
    "-d, --decrypt",
    "decrypt fields known to be encrypted, i.e. `password_value`"
  )
  .option("-t, --table", "output interesting data in a table");

program
  .command("logins <browser> <profile>")
  .alias("accounts")
  .action((browser, profile) => {
    havelock.explorer
      .getLoginsFromLoginDataFile(havelock.browser[browser], profile)
      .then((value) => {
        if (program.table) {
          console.table(value, [
            "origin_url",
            "username_value",
            "password_value",
          ]);

          return;
        }

        console.log(value);
      })
      .catch((reason) => {
        console.error(reason);
      });
  });

program.command("cookies <browser> <profile>").action((browser, profile) => {
  havelock.explorer
    .getCookiesFromCookiesFile(havelock.browser[browser], profile)
    .then((value) => {
      if (program.table) {
        console.table(value, ["host_key", "name", "encrypted_value"]);

        return;
      }

      console.log(value);
    })
    .catch((reason) => {
      console.error(reason);
    });
});

program
  .command("urls <browser> <profile>")
  .alias("history")
  .action((browser, profile) => {
    havelock.explorer
      .getUrlsFromHistoryFile(havelock.browser[browser], profile)
      .then((value) => {
        if (program.table) {
          console.table(value, ["url", "title"]);

          return;
        }

        console.log(value);
      })
      .catch((reason) => {
        console.error(reason);
      });
  });

program.parse(process.argv);
