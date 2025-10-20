import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import paginator from "../../utils/buttonPaginator.js";
import jsonMessageConfig from "../../messageConfig.json" with { type: "json" };
const { mConfig } = jsonMessageConfig;
import { formatDate, parseDate } from "../../util.js";
import tempBanSch from "../../schemas/tempBanSch.js";

export default {
  data: new SlashCommandBuilder()
    .setName("banlist")
    .setDescription("[mod] get list of banned user on the server")
    .toJSON(),
  deleted: false,
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [],
  run: async (client, interaction) => {
    const { options, guildId, guild, member } = interaction;
    const banObj = await interaction.guild.bans.fetch();
    if (banObj.length === 0) {
      return interaction.reply({
        content: "no banned user to list",
        flags: 64,
      });
    }

    const db = await tempBanSch.find({ GuildId: guild.id });

    const banList = banObj
      .map((v) => {
        const ada = db.find((b) => memberId === v.user.id);
        return `\`\`\`name: ${v.user.username}\nreason: ${
          v.reason || "-"
        }\ntime: ${ada ? parseDate(ada.endTime - Date.now()) : "perma"}\`\`\``;
      })
      .join("\n");
    const banListTrimed = chunkSubstr(banList, 4000);

    const embed = [];
    banListTrimed.forEach((blt) => {
      embed.push(
        new EmbedBuilder()
          .setColor("#fcb4fc")
          .setTitle("User Baned List")
          .setDescription(blt)
          .setFooter({
            iconURL: `${client.user.displayAvatarURL({
              dynamic: true,
            })}`,
            text: `${client.user.username} - ban list`,
          }),
      );
    });

    await paginator(interaction, embed);
  },
};
