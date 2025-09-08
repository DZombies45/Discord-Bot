const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ActionRowBuilder,
} = require("discord.js");
const moderationSchema = require("../schemas/moderationSch.js");
const mConfig = require("../messageConfig.json");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Moderate User")
    .setType(ApplicationCommandType.User),
  deleted: false,
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ModerateMembers],
  run: async (client, interaction) => {
    const { targetMember, guildId, member } = interaction;

    const embed = new EmbedBuilder()
      .setFooter({
        iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
        text: `${client.user.username} - moderate user`,
      })
      .setColor("FFFFFF");
    let dataDB = await moderationSchema.findOne({
      GuildId: guildId,
    });
    //no data
    if (!dataDB) {
      embed
        .setColor(mConfig.embedColorError)
        .setDescription("moderation system is not configured for this server.");
      return interaction.reply({ embeds: [embed], flags: 64 });
    }
    //with self
    if (targetMember.id === member.id) {
      embed
        .setColor(mConfig.embedColorError)
        .setDescription(mConfig.unableToInteractWithSelf);
      return interaction.reply({ embeds: [embed], flags: 64 });
    }
    //role hight
    if (targetMember.roles.highest.position >= member.roles.highest.position) {
      embed
        .setColor(mConfig.embedColorError)
        .setDescription(mConfig.hasHigherRolePosition);
      return interaction.reply({ embeds: [embed], flags: 64 });
    }
    //buat button
    const modetationButtons = new ActionRowBuilder().setComponents(
      new ButtonBuilder()
        .setCustomId("punishmentBtn")
        .setLabel("Punishment")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("otherBtn")
        .setLabel("Utility")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("cancelBtn")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary),
    );
    embed
      .setAuthor({
        iconURL: `${targetMember.user.displayAvatarURL({
          dynamic: true,
        })}`,
        name: `${targetMember.user.username}`,
      })
      .setDescription(
        `what action do you want to do on ${targetMember.user.username}`,
      );

    interaction.reply({
      embeds: [embed],
      components: [modetationButtons],
    });
  },
};
