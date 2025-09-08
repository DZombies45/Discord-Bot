const {
  PermissionFlagsBits,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { formatDate, Logger } = require("../util.js");

module.exports = {
  customId: "addRoleBtn",
  userPermissions: [PermissionFlagsBits.ManageRoles],
  botPermissions: [PermissionFlagsBits.ManageRoles],
  run: async (client, interaction) => {
    try {
      const addRoleModal = new ModalBuilder()
        .setTitle("Add Role")
        .setCustomId("addRoleMdl")
        .setComponents(
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel("Role")
              .setCustomId("role_id_add")
              .setPlaceholder("the id of a role")
              .setStyle(TextInputStyle.Short),
          ),
        );
      return await interaction.showModal(addRoleModal);
    } catch (e) {
      Logger.error(`from addRoleBtn.js :\n${e.stack}`);
    }
  },
};
