const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { formatDate, Logger } = require("../util.js");

module.exports = {
  customId: "addRoleMdl",
  userPermissions: [PermissionFlagsBits.ManageRoles],
  botPermissions: [PermissionFlagsBits.ManageRoles],
  run: async (client, interaction) => {
    const { message, channel, guildId, guild, user, fields } = interaction;
    try {
      const embedAuthor = message.embeds[0].author;
      const targetMember = await guild.members
        .fetch({
          query: embedAuthor.name,
          limit: 1,
        })
        .first();
      const roleId = fields.getTextInputValue("role_id_add");
      const role = await guild.roles.cache.get(roleId);

      await interaction.deferReply({ flags: 64 });

      const embed = new EmbedBuilder()
        .setAuthor({
          iconURL: `${targetMember.user.displayAvatarURL({
            dynamic: true,
          })}`,
          name: `${targetMember.user.username}`,
        })
        .setColor("FFFFFF")
        .setDescription(`**${role} successfully added to ${targetMember}**`);
      await targetMember.roles.add(role).catch((err) => {
        Logger.log(
          `some error at adding role ${roleId} to ${targetMember.user.username}`,
        );
        return interaction.editReply({
          embeds: "error, try again latter",
          components: [],
        });
      });
      return interaction.editReply({ embeds: [embed], components: [] });
    } catch (e) {
      Logger.error(`from addRoleBtn.js :\n${e.stack}`);
    }
  },
};
