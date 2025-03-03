const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
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
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
    });
    await interaction.editReply(
      `Roundtrip latency: ${
        sent.createdTimestamp - interaction.createdTimestamp
      }ms\nWebsocket heartbeat: ${client.ws.ping}ms`,
    );
  },
};
