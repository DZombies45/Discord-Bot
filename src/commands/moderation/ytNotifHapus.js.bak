const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
} = require("discord.js");
const rssParserObj = require("rss-parser");
const ytNotifSch = require("../../schemas/ytNotifSch.js");
const rssParser = new rssParserObj();
const { Logger } = require("../../util.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("yt-remove")
    .setDescription("remove notif for a yt channel upload")
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("yt-id")
        .setDescription("the id of the youtube channel")
        .setRequired(true),
    )
    .addChannelOption((opt) =>
      opt
        .setName("notif-channel")
        .setDescription("channel to remove the notification from")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
    )
    .toJSON(),
  deleted: false,
  devOnly: false,
  modOnly: true,
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    try {
      const { options, guildId, guild, member } = interaction;
      const ytId = options.getString("yt-id");
      const channel = options.getChannel("notif-channel");

      if (!channel || !ytId)
        return interaction.reply("error, try filling all requared data first");
      await interaction.deferReply({ flags: 64 });
      const notifSetup = await ytNotifSch.findOne({
        channelId: channel.id,
        ytId: ytId,
      });
      if (!notifSetup)
        return interaction.followUp(
          `yt notif for that yt channel don't exist in that notif channel.\nrun \`yt-config <yt-id> <channel>\` first to create it`,
        );
      ytNotifSch
        .findOneAndDelete({ _id: notifSetup._id })
        .then(() =>
          interaction.followUp({
            embeds: [
              new EmbedBuilder()
                .setTitle("yt notif successfully removed")
                .setTimestamp(),
            ],
          }),
        )
        .catch((e) =>
          interaction.followUp(
            `error when removing from the database, try again later`,
          ),
        );
    } catch (e) {
      Logger.error(`from ${__filename} :\n${e.stack}`);
    }
  },
};
