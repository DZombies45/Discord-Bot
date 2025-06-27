const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const mConfig = require("../../messageConfig.json");
const { Logger } = require("../../util.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("[mod] clear a number of message")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("amount of message to clear")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true),
    )
    .addUserOption((option) =>
      option.setName("target").setDescription("target user to delete message"),
    ),
  deleted: false,
  userPermissions: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.ManageMessages],
  run: async (client, interaction) => {
    const { options, channel } = interaction;
    let amount = options.getInteger("amount");
    const target = options.getUser("target");
    const multi = (a) => (a === 1 ? "message" : "messages");

    if (!amount || amount < 1 || amount > 100)
      return await interaction.reply({
        content: "need amount to be between 1 and 100 message",
        flags: 64,
      });

    try {
      const channelMessage = await channel.messages.fetch();
      if (channelMessage.size <= 0) {
        _m = await interaction.reply({
          content: "no message on this channel",
          flags: 64,
        });
        setTimeout(function () {
          _m.delete();
        }, 5000);
      }

      if (amount > channelMessage.size) amount = channelMessage.size;

      const clearEmbed = new EmbedBuilder().setColor(mConfig.embedColorSuccess);
      await interaction.deferReply({ flags: 64 });

      let msgToDelete = [];

      if (target) {
        channelMessage.forEach((msg) => {
          if (msg.author.id === target.id) {
            msgToDelete.push(msg);
          }
        });
        msgToDelete = msgToDelete.splice(0, amount);

        clearEmbed.setDescription(
          `Successfully delete ${msgToDelete.length} ${multi(
            msgToDelete.length,
          )} from ${target} on ${channel}`,
        );
      } else {
        msgToDelete = channelMessage.first(amount);
        clearEmbed.setDescription(
          `Successfully delete ${msgToDelete.length} ${multi(
            msgToDelete.length,
          )} on ${channel}`,
        );
      }

      if (msgToDelete.length > 0) {
        await channel.bulkDelete(msgToDelete, true);
      }
      interaction.editReply({ embeds: [clearEmbed] });
    } catch (e) {
      Logger.error(`from cmd > clear.js :\n${e.stack}`);
      await interaction.editReply({
        content: "an error occured while clearing message",
        flags: 64,
      });
    }
  },
};
