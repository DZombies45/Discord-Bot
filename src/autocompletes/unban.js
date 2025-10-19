import { PermissionFlagsBits } from "discord.js";
import { Logger, parseDate } from "../util.js";
import { tempBanSch } from "../schemas/tempBanSch.js";

export default {
  commandName: "unban",
  userPermissions: [],
  run: async (client, interaction) => {
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name === "id") {
      const focusedObj = await interaction.guild.bans.fetch();
      const db = (await tempBanSch.find({ GuildId: guild.id })) || {};
      const filteredFocused = focusedObj.filter(
        (v) =>
          v.user.username
            .toLowerCase()
            .includes(focusedOption.value.toLowerCase()) ||
          v.user.id.startsWith(focusedOption.value),
      );
      const result = filteredFocused.map((filtered) => {
        const ada = db.find((b) => memberId === filtered.user.id);
        return {
          name: ada
            ? `${filtered.user.username}(${parseDate(
                ada.endTime - Date.now(),
              )})`
            : filtered.user.username,
          value: filtered.user.id,
        };
      });
      interaction
        .respond(result.slice(0, 25))
        .catch((err) =>
          Logger.error(`from autocomplete/unban.js :\n${err.stack}`),
        );
    }
  },
};
