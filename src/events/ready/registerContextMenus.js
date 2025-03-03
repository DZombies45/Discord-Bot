const { testServerId } = require("../../config.json");
const getAppContextMenu = require("../../utils/getAppCommands.js");
const getLocalContextMenus = require("../../utils/getLocalContextMenus.js");
const { Logger, TabbleConsole } = require("../../util.js");

module.exports = async (client) => {
  try {
    const [localCtms, appCtms] = await Promise.all([
      getLocalContextMenus(),
      getAppContextMenu(client),
    ]);
    let count = 0;

    TabbleConsole.start("context menus register");
    let loading = null;

    for (const localCtm of localCtms) {
      const { data, deleted, reload } = localCtm;
      if (!data) continue;
      const { name: contextMenuName, type: contestMenuType } = data;

      const existContestMenu = await appCtms.cache.find(
        (cmd) => cmd.name === contextMenuName,
      );

      count++;

      if (existContestMenu) {
        if (deleted) {
          loading = TabbleConsole.showLoading(contextMenuName);
          await appCtms.delete(existContestMenu.id);
          count--;
          if (reload) {
            count++;
            await appCtms.create({
              name: contextMenuName,
              type: contestMenuType,
            });
          }
          TabbleConsole.add(
            deleted && reload ? "\x1B[32mR" : "\x1B[91mD",
            contextMenuName,
            loading,
          );
          //Logger.log(`(-) aplication contest menu "${contextMenuName}" deleted`);
        } else {
          TabbleConsole.add("\x1B[92mY", contextMenuName);
        }
      } else {
        loading = TabbleConsole.showLoading(contextMenuName);
        await appCtms.create({
          name: contextMenuName,
          type: contestMenuType,
        });
        TabbleConsole.add("\x1B[32mC", contextMenuName, loading);
        //Logger.log(`(+) aplication context menu "${contextMenuName}" added`);
      }
    }

    TabbleConsole.end();
    TabbleConsole.add(
      " ",
      `\x1B[95m${count} context menus has been loaded\x1B[0m`,
    );
    TabbleConsole.end();
    //Logger.success(`(+) ${count} context menus has been loaded`);
  } catch (e) {
    Logger.error(`from registerContextMenus.js :\n${e.stack}`);
  }
};
