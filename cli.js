#!/usr/bin/env node

const { program } = require("commander");
const havelock = require("./index");
const package = require("./package.json");

program.name(package.name);
program.version(package.version);

program
  .command("logins <browser> <profile>")
  .alias("accounts")
  .action((browser, profile) => {
    havelock.explorer.printLoginsFromLoginDataFile(
      havelock.browser[browser],
      profile
    );
  });

program.command("cookies <browser> <profile>").action((browser, profile) => {
  havelock.explorer.printCookiesFromCookiesFile(
    havelock.browser[browser],
    profile
  );
});

program
  .command("urls <browser> <profile>")
  .alias("history")
  .action((browser, profile) => {
    havelock.explorer.printUrlsFromHistoryFile(
      havelock.browser[browser],
      profile
    );
  });

program.parse(process.argv);
