const { program } = require("commander");

const package = require("../package.json");
const actions = require("./actions");

program.name(package.name);
program.version(package.version);
program.description(package.description);

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
