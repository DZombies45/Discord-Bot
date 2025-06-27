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
    .setName("yt-setup")
    .setDescription("setup notif for a yt channel upload")
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
        .setDescription("channel to send the notification")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
    )
    .addStringOption((option) =>
      option
        .setName("notif-message")
        .setDescription(
          "template= {VIDEO_TITLE} {VIDEO_URL} {CHANNEL_NAME} {CHANNEL_URL}",
        )
        .setRequired(false),
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
      const customMsg = options.getString("notif-message");
      if (!channel || !ytId)
        return interaction.reply("error, try filling all requared data first");
      await interaction.deferReply({ flags: 64 });
      const duplicateNotif = await ytNotifSch.exists({
        channelId: channel.id,
        ytId: ytId,
      });
      if (duplicateNotif)
        return interaction.followUp(
          `yt notif for that yt channel aready exist in that notif channel.\nrun \`yt-remove <yt-id> <channel>\` first to remove it`,
        );

      const YT_RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${ytId}`;
      const feeds = await rssParser
        .parseURL(YT_RSS_URL)
        .catch((e) =>
          interaction.followUp(
            `error at getting the youtube channel, make sure its the real yt id`,
          ),
        );
      if (!feeds) return;
      const channelName = feeds.title;
      const notifConfig = new ytNotifSch({
        GuildId: guildId,
        channelId: channel.id,
        ytId: ytId,
        message: customMsg,
        lastChaked: new Date(),
        lastVid: null,
      });
      if (feeds.items.length > 0) {
        const videoTerakhir = feeds.items[0];
        notifConfig.lastVid = {
          id: videoTerakhir.id.split(":")[2],
          pubDate: videoTerakhir.pubDate,
        };
      }
      notifConfig
        .save()
        .then(() =>
          interaction.followUp({
            embeds: [
              new EmbedBuilder()
                .setTitle("yt notif successfully setup")
                .setDescription(
                  `${channel} now recive notification when ${channelName} upload new video`,
                )
                .setTimestamp(),
            ],
          }),
        )
        .catch((e) =>
          interaction.followUp(
            `error when saving to the database, try again later`,
          ),
        );
    } catch (e) {
      Logger.error(`from ${__filename} :\n${e.stack}`);
    }
  },
};
