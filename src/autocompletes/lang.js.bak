const { PermissionFlagsBits } = require("discord.js");
const parseBahasa = require("../utils/getBahasa.js");

module.exports = {
  commandName: "translate",
  userPermissions: [],
  run: async (client, interaction) => {
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name !== "lang") return;

    interaction
      .respond(parseBahasa(focusedOption.value).slice(0, 15))
      .catch((err) =>
        Logger.error(`from autocomplete/lang.js :\n${err.stack}`),
      );
  },
};
