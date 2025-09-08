const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { Logger } = require("../util.js");

module.exports = {
  customId: "$NAME",
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    const { guild, guildId, user, fields, channel } = interaction;
  },
};
