import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
} from "discord.js";

export {
  data: new ContextMenuCommandBuilder()
    .setName("$NAME")
    .setType(ApplicationCommandType.Message),
  deleted: true,
  reload: true,
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    const { targetMessage, user, channel } = interaction;
  },
};
