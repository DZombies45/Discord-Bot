const { Logger } = require("../../util.js");
const ytNotifSch = require("../../schemas/ytNotifSch.js");
const rssParserObj = require("rss-parser");
const rssParser = new rssParserObj();

module.exports = async (client) => {
  async function checkYt() {
    try {
      const ytConfigs = await ytNotifSch.find();
      for (const ytConfig of ytConfigs) {
        const YT_RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${ytConfig.ytId}`;
        const feeds = await rssParser.parseURL(YT_RSS_URL).catch((e) => null);
        if (!feeds?.items.length) continue;
        const videoTerakhir = feeds.items[0];
        const terakhirDiCheck = ytConfig.lastVid;

        if (
          !terakhirDiCheck ||
          (videoTerakhir.id.split(":")[2] !== terakhirDiCheck.id &&
            new Date(videoTerakhir.pubDate) > new Date(terakhirDiCheck.pubDate))
        ) {
          //upload notif
          const targetGuild =
            client.guilds.cache.get(ytConfig.GuildId) ||
            (await client.guilds.fetch(ytConfig.GuildId));
          if (!targetGuild) {
            ytNotifSch
              .findOneAndDelete({ _id: ytConfig._id })
              .catch((e) => null);
            continue;
          }
          const targetChannel =
            targetGuild.channels.cache.get(ytConfig.channelId) ||
            (await targetGuild.channels.fetch(ytConfig.channelId));
          if (!targetChannel) {
            ytNotifSch
              .findOneAndDelete({ _id: ytConfig._id })
              .catch((e) => null);
            continue;
          }

          ytConfig.lastVid = {
            id: videoTerakhir.id.split(":")[2],
            pubDate: videoTerakhir.pubDate,
          };
          ytConfig
            .save()
            .then(() => {
              let msg =
                terakhirDiCheck.message
                  ?.replace("{VIDEO_TITLE}", videoTerakhir.title)
                  ?.replace("{VIDEO_URL}", videoTerakhir.link)
                  ?.replace("{CHANNEL_NAME}", feeds.title)
                  ?.replace("{CHANNEL_URL}", feeds.link) ||
                `new upload by ${feeds.title}, check it out:\n${videoTerakhir.link}`;
              targetChannel.send(msg);
            })
            .catch((e) => null);
        }
      }
    } catch (e) {
      Logger.error(`from ${__filename} :\n${e.stack}`);
    }
  }
  checkYt();
  setInterval(checkYt, 60000);
};
