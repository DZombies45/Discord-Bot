const { EmbedBuilder } = require("discord.js");
const {
  developerId,
  testServerId,
  moderatorRoleId,
} = require("../../config.json");
const mConfig = require("../../messageConfig.json");
const getAutocomplete = require("../../utils/getAutocomplete.js");
const { Logger } = require("../../util.js");

module.exports = async (client, interaction) => {
  if (!interaction.isAutocomplete()) return;
  const localAutocomplete = getAutocomplete();

  try {
    const autocompleteObject = localAutocomplete.find(
      (cmd) => cmd.commandName === interaction.commandName,
    );
    if (!autocompleteObject) return;

    if (autocompleteObject.devOnly) {
      if (!developerId.includes(interaction.member.id)) {
        return;
      }
    }

    if (autocompleteObject.modOnly) {
      if (
        !moderatorRoleId.some((roleId) =>
          interaction.member.roles.cache.has(roleId),
        )
      ) {
        return;
      }
    }

    if (autocompleteObject.testMode) {
      if (interaction.guild.id !== testServerId) {
        return;
      }
    }

    if (autocompleteObject.userPermissions?.length) {
      for (const permission of autocompleteObject.userPermissions) {
        if (interaction.member.permissions.has(permission)) {
          continue;
        }
        return;
      }
    }

    await autocompleteObject.run(client, interaction);
  } catch (err) {
    Logger.error(`from autoCompleteCommandValidation.js :\n${err.stack}`);
  }
};
