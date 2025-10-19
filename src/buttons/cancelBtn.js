import { PermissionFlagsBits } from "discord.js";

export default {
  customId: "cancelBtn",
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    await interaction.message.delete();
  },
};
