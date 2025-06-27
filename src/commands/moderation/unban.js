const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const moderationSchema = require("../../schemas/moderationSch.js");
const tempBanSchema = require("../../schemas/tempBanSch.js");
const mConfig = require("../../messageConfig.json");
const { formatDate } = require("../../util.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("unban banned user on the server")
    .addStringOption((opt) =>
      opt
        .setName("id")
        .setDescription("the id of the banned user")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .toJSON(),
  deleted: false,
  userPermissions: [
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.ModerateMembers,
  ],
  botPermissions: [PermissionFlagsBits.BanMembers],
  run: async (client, interaction) => {
    const { options, guildId, guild, member } = interaction;
    const targetId = options.getString("id");

    let dataDB = await moderationSchema.findOne({
      GuildId: guildId,
    });
    const embed = new EmbedBuilder()
      .setFooter({
        iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
        text: `${client.user.username} - unban user`,
      })
      .setColor("FFFFFF");
    //no data
    if (!dataDB) {
      embed
        .setColor(mConfig.embedColorError)
        .setDescription("moderation system is not configured for this server.");
      return interaction.reply({ embeds: [embed], flags: 64 });
    }
    if (targetId === member.id) {
      embed
        .setColor(mConfig.embedColorError)
        .setDescription(mConfig.unableToInteractWithSelf);
      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    const logChannel = guild.channels.cache.get(dataDB.LogChannelId);

    const embedLog = new EmbedBuilder()
      .setColor("#fcb4fc")
      .setTitle("User Unbaned")
      .setAuthor({
        name: `${targetId}`,
      })
      .setDescription(`successfully unban ${targetId}.`)
      .addFields(
        { name: "unban by: ", value: `<@${user.id}>`, inline: true },
        { name: "date: ", value: `${formatDate()}`, inline: true },
      )
      .setFooter({
        iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
        text: `${client.user.username} - unban user`,
      });
    logChannel.send({ embeds: [embedLog] });

    await guild.bans.remove(targetId);
    await tempBanSchema
      .deleteOne({ GuildId: guildId, memberId: targetId })
      .catch(() => {});
    embed
      .setColor(mConfig.embedColorSuccess)
      .setDescription(`successfuly unban user with id ${targetId}`);
    interaction.reply({ embeds: [embed], flags: 64 });
  },
};
