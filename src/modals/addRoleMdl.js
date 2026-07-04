import { PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { formatDate, Logger } from "../util.js";

export default {
  customId: "addRoleMdl",
  userPermissions: [PermissionFlagsBits.ManageRoles],
  botPermissions: [PermissionFlagsBits.ManageRoles],
  run: async (client, interaction) => {
    const { message, channel, guildId, guild, user, fields } = interaction;
    try {
      const embedAuthor = message.embeds[0].author;
      const targetMembers = await guild.members.fetch({
        query: embedAuthor.name,
        limit: 1,
      });
      const targetMember = targetMembers.first();
      if (!targetMember) {
        return interaction.reply({
          content: "❗ Could not find that member (they may have left the server).",
          flags: 64,
        });
      }

      const roleId = fields.getTextInputValue("role_id_add");
      const role = guild.roles.cache.get(roleId);

      await interaction.deferReply({ flags: 64 });

      if (!role) {
        return interaction.editReply({
          content: `❗ Could not find a role with ID \`${roleId}\`. Check the ID and try again.`,
        });
      }

      const embed = new EmbedBuilder()
        .setAuthor({
          iconURL: `${targetMember.user.displayAvatarURL({
            dynamic: true,
          })}`,
          name: `${targetMember.user.username}`,
        })
        .setColor("FFFFFF")
        .setDescription(`**${role} successfully added to ${targetMember}**`);

      try {
        await targetMember.roles.add(role);
      } catch (err) {
        Logger.log(
          `some error at adding role ${roleId} to ${targetMember.user.username}`,
        );
        return interaction.editReply({
          content: "❗ Failed to add role: bot may be missing permissions or role hierarchy issue.",
          components: [],
        });
      }

      return interaction.editReply({ embeds: [embed], components: [] });
    } catch (e) {
      Logger.error(`from addRoleMdl.js :\n${e.stack}`);
    }
  },
};
