const {
  PermissionFlagsBits,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { Logger } = require("../util.js");

module.exports = {
  customId: "tempMuteBtn",
  userPermissions: [PermissionFlagsBits.KickMembers],
  botPermissions: [PermissionFlagsBits.KickMembers],
  run: async (client, interaction) => {
    try {
      const tempMuteModal = new ModalBuilder()
        .setTitle("Temp Mute")
        .setCustomId("tempMuteMdl")
        .setComponents(
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel("Time")
              .setCustomId("tempMuteTime")
              .setPlaceholder("m = minutes, h = hours, D = days, M = month")
              .setStyle(TextInputStyle.Short),
          ),
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel("Reason")
              .setCustomId("tempMuteReason")
              .setPlaceholder("the reason to temp mute this user")
              .setStyle(TextInputStyle.Paragraph),
          ),
        );
      return await interaction.showModal(tempMuteModal);
    } catch (e) {
      Logger.error(`from tempMuteBtn.js :\n${e.stack}`);
    }
  },
};
