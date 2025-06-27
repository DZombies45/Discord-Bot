const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const moderationSchema = require("../../schemas/moderationSch.js");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("moderate")
    .setDescription("moderate server member")
    .addUserOption((opt) =>
      opt
        .setName("user")
        .setDescription("target user to moderate")
        .setRequired(true),
    )
    .toJSON(),
  deleted: false,
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [],
  run: async (client, interaction) => {
    const { options, guildId, guild, member } = interaction;
    const target = options.getUser("user");
    const targetMember = await guild.members.fetch(target);

    const embed = new EmbedBuilder()
      .setFooter({
        iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
        text: `${client.user.username} - moderate user`,
      })
      .setColor("#cfd453");
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
