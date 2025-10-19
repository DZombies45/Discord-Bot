import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { Logger } from "../../util.js";

export {
  data: new SlashCommandBuilder()
    .setName("$NAME")
    .setDescription("ini $NAME command descripsi")
    .toJSON(),
  deleted: true,
  devOnly: false,
  modOnly: false,
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    const { options, guildId, guild, member } = interaction;
  },
};
