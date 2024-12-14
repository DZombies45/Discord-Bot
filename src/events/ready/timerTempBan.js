const { EmbedBuilder } = require("discord.js");
const { formatDate, Logger } = require("../../util.js");
const tempBanSch = require("../../schemas/tempBanSch.js");
const moderationSch = require("../../schemas/moderationSch.js");
const { startTimeout } = require("../../utils/banTimmer.js");

module.exports = async client => {
    async function checkTempBan() {
        try {
            const banDic = await tempBanSch.find();
            if (!banDic) return;
            for (const tb of banDic) {
                //check guild
                const targetGuild =
                    client.guilds.cache.get(tb.GuildId) ||
                    (await client.guilds.fetch(tb.GuildId));
                if (!targetGuild) {
                    tb.findOneAndDelete({ _id: tb._id }).catch(e => null);
                    continue;
                }
                //start timer
                startTimeout(client, targetGuild, tb);

                //                 let timeout = tb.endTime - Date.now();
                //                 if (timeout > 353998) continue;
                //
                //              timeout = timeout <= 0 ? 5 : timeout;
                //                 if (tb.reason === "ban") {
                //                     setTimeout(() => {
                //                         tb.findOneAndDelete({ _id: tb._id })
                //                             .then(() => targetGuild.members.unban(tb.memberId))
                //                             .catch(e => null);
                //                     }, timeout);
                //                 } else {
                //                     setTimeout(() => {
                //                         tb.findOneAndDelete({ _id: tb._id })
                //                             .then(async () => {
                //                                 let dataDB = await moderationSch.findOne({
                //                                     GuildId: tb.GuildId
                //                                 });
                //                                 let member =
                //                                     targetGuild.members.cache.get(
                //                                         tb.memberId
                //                                     ) ||
                //                                     (await targetGuild.members.fetch(
                //                                         tb.memberId
                //                                     ));
                //                                 member.roles.remove(dataDB.MuteRoleId);
                //                             })
                //                             .catch(e => null);
                //                     }, timeout);
                //                }
            }
        } catch (e) {
            Logger.error(`from ${__filename} :\n${e.stack}`);
        }
    }
    checkTempBan();
    setInterval(checkTempBan, 354000);
    async function timer() {}
};
