import { EmbedBuilder } from "discord.js";
import {
  developerId,
  testServerId,
  moderatorRoleId,
} from "../../config.json.js";
import { mConfig  } from "../../messageConfig.json.js";
import { getAutocomplete  } from "../../utils/getAutocomplete.js";
import { Logger } from "../../util.js";

export default async (client, interaction) => {
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
