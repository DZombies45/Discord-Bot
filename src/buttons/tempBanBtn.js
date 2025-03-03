const {
  PermissionFlagsBits,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { formatDate, Logger } = require("../util.js");

module.exports = {
  customId: "tempBanBtn",
  userPermissions: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
  run: async (client, interaction) => {
    try {
      const tempBanModal = new ModalBuilder()
        .setTitle("Temp Ban")
        .setCustomId("tempBanMdl")
        .setComponents(
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel("Time")
              .setCustomId("tempBanTime")
              .setPlaceholder(
                "m = minutes, h = hours, D = days, M = month, Y = years",
              )
              .setStyle(TextInputStyle.Short),
          ),
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel("Reason")
              .setCustomId("tempBanReason")
              .setPlaceholder("the reason to tempban this user")
              .setStyle(TextInputStyle.Paragraph),
          ),
        );
      return await interaction.showModal(tempBanModal);
    } catch (e) {
      Logger.error(`from tempBanBtn.js :\n${e.stack}`);
    }
  },
};
