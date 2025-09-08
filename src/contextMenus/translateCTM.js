const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
  TextInputBuilder,
  ModalBuilder,
  ActionRowBuilder,
  TextInputStyle,
} = require("discord.js");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Translate")
    .setType(ApplicationCommandType.Message),
  deleted: true,
  reload: true,
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    const { targetMessage, user, channel } = interaction;

    const addRoleModal = new ModalBuilder()
      .setTitle("Translate")
      .setCustomId("translateMdl")
      .setComponents(
        new ActionRowBuilder().setComponents(
          new TextInputBuilder()
            .setLabel("Language")
            .setCustomId("language_id")
            .setPlaceholder("language id")
            .setMinLength(2)
            .setRequired(true)
            .setStyle(TextInputStyle.Short),
        ),
        new ActionRowBuilder().setComponents(
          new TextInputBuilder()
            .setLabel("Msg Id (don't change this)")
            .setCustomId("message_id")
            .setPlaceholder("message id")
            .setValue(targetMessage.id)
            .setRequired(true)
            .setStyle(TextInputStyle.Short),
        ),
      );
    return await interaction.showModal(addRoleModal);
  },
};
