import { PermissionFlagsBits } from "discord.js";

export {
  commandName: "$NAME",
  userPermissions: [],
  run: async (client, interaction) => {
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name !== "") return;

    interaction
      .respond([])
      .catch((err) =>
        Logger.error(`from autocomplete/lang.js :\n${err.stack}`),
      );
  },
};
