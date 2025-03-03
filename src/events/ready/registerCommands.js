const { testServerId } = require("../../config.json");
const compareCommands = require("../../utils/compareCommands.js");
const getAppCommand = require("../../utils/getAppCommands.js");
const getLocalCommands = require("../../utils/getLocalCommands.js");
const { Logger, TabbleConsole } = require("../../util.js");

module.exports = async (client) => {
  try {
    const [localCmds, appCmds] = await Promise.all([
      getLocalCommands(),
      getAppCommand(client),
    ]);
    let count = 0;

    TabbleConsole.start("commands register");

    for (const localCmd of localCmds) {
      const { data, deleted } = localCmd;
      if (!data) continue;
      const {
        name: commandName,
        description: commandDesc,
        options: commandOpt,
      } = data;

      const existCommand = await appCmds.cache.find(
        (cmd) => cmd.name === commandName,
      );

      count++;

      let loading = null;

      if (deleted) {
        if (existCommand) {
          loading = TabbleConsole.showLoading(commandName);
          await appCmds.delete(existCommand.id);
          count--;
          TabbleConsole.add("\x1B[91mD", commandName, loading);
          //Logger.log(`(-) aplication command "${commandName}" deleted`);
        }
      } else if (existCommand) {
        if (compareCommands(existCommand, localCmd)) {
          loading = TabbleConsole.showLoading(commandName);
          await appCmds.edit(existCommand.id, {
            name: commandName,
            description: commandDesc,
            options: commandOpt,
          });
          TabbleConsole.add("\x1B[33mR", commandName, loading);
          //Logger.log(`(*) aplication command "${commandName}" edited` );
        } else {
          //Logger.debug(`${commandName} id: ${existCommand.id}`);
          TabbleConsole.add("\x1B[92mY", commandName);
        }
      } else {
        loading = TabbleConsole.showLoading(commandName);
        await appCmds.create({
          name: commandName,
          description: commandDesc,
          options: commandOpt,
        });
        TabbleConsole.add("\x1B[32mC", commandName, loading);
        //Logger.log(`(+) aplication command "${commandName}" added`);
      }
    }

    TabbleConsole.end();
    TabbleConsole.add(" ", `\x1B[95m${count} commands has been loaded\x1B[0m`);
    TabbleConsole.end();
    //Logger.success(`(+) ${count} commands has been loaded`);
  } catch (e) {
    Logger.error(`from registerCommand.js :\n${e.stack}`);
  }
};
