#!/usr/bin/env node

const { program } = require("commander");

const package = require("../package.json");
const actions = require("./actions");

/**
 * Configuration
 */

program.name(package.name);
program.version(package.version);
program.description(package.description);

/**
 * Options
 */

program.option("-t, --tabular", "present data of interest in a table", false);
program.option("-f, --file", "write requested data to file", false);
program.option("-d, --decrypt", "decrypt fields known to be encrypted", false);

/**
 * Actions
 */

program
  .command("logins <browser> [profile]")
  .alias("accounts")
  .action((browser, profile) => actions.logins(browser, profile));

program
  .command("cookies <browser> [profile]")
  .action((browser, profile) => actions.cookies(browser, profile));

program
  .command("urls <browser> [profile]")
  .alias("history")
  .action((browser, profile) => actions.urls(browser, profile));

program.parse(process.argv);
