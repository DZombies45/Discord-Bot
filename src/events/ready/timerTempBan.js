const { EmbedBuilder } = require("discord.js");
const { formatDate, Logger } = require("../../util.js");
const tempBanSch = require("../../schemas/tempBanSch.js");
const { startTimeout } = require("../../utils/banTimmer.js");

module.exports = async (client) => {
  async function tempBan(data) {
    let delay = data.endTime - Date.now();
    if (delay < 0) delay = 1;
    setTimeout(async () => {
      try {
        const { GuildId, memberId, reason } = data;
        const guild = client.guilds.fetch(GuildId);
        if (reason === "ban") {
          await guild.bans.remove(memberId);
        } else if (reason === "mute") {
          await guild.members.fetch(memberId).roles.remove(dataDB.MuteRoleId);
        }
        await tempBanSch.deleteOne({ _id: data._id });
      } catch (e) {
        Logger.error(`from ${__filename} :\n${e.stack}`);
      }
    }, delay);
  }
  const banData = await tempBanSch.find();
  banData.forEach(tempBan);

  tempBanSch.watch().on("change", async (change) => {
    if (change.operationType == "insert") tempBan(change.fullDocument);
  });
};

async function a() {
  async function checkTempBan() {
    try {
      const banDic = await tempBanSch.find();
      if (!banDic) return;
      for (const tb of banDic) {
        const targetGuild =
          client.guilds.cache.get(tb.GuildId) ||
          (await client.guilds.fetch(tb.GuildId));
        if (!targetGuild) {
          tb.findOneAndDelete({ _id: tb._id }).catch((e) => null);
          continue;
        }

        startTimeout(client, targetGuild, tb);
      }
    } catch (e) {
      Logger.error(`from ${__filename} :\n${e.stack}`);
    }
  }
  checkTempBan();
  setInterval(checkTempBan, 354000);
}
