import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("test bot ping")
    .setDMPermission(false)
    .toJSON(),
  deleted: false,
  userPermissions: [],
  botPermissions: [],
  devOnly: true,
  run: async (client, interaction) => {
    await interaction.reply("Pinging...");

    const sent = await interaction.fetchReply();

    await interaction.editReply(
      `> Roundtrip latency: ${
        sent.createdTimestamp - interaction.createdTimestamp
      }ms\n> Websocket heartbeat: ${client.ws.ping}ms`,
    );
  },
};
