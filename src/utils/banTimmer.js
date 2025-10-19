import { EmbedBuilder } from "discord.js";
import { formatDate, Logger } from "../util.js";
import { tempBanSch  } from "../schemas/tempBanSch.js";
import { moderationSch  } from "../schemas/moderationSch.js";

let started = false;

const startBanTimer = async (client, guild) => {
  if (started) return;
  const tb = await tempBanSch.find({ GuildId: guild.id });
  if (tb.length === 0) return;

  started = true;
  loop(client, guild);
};

function loop(client, guild) {
  setTimeout(async () => {
    started = false;
    startBanTimer(client, guild);
    const tb = tempBanSch.find({
      GuildId: guild.id,
      endTime: { $lte: Date.now() + 3600000 },
    });
    if (!tb) return;
    for (const obj of tb) {
      if (obj.endTime - Date.now() <= 3540000) startTimeout(client, guild, obj);
    }
  }, 3600000);
}

function startTimeout(client, guild, obj) {
  let time = obj.endTime - Date.now();
  if (time < 1) time = 1;
  if (time > 3400000)
    setTimeout(() => startTimeout(client, guild, obj), 3400000);
  else
    setTimeout(async () => {
      try {
        const { GuildId, memberId, reason } = obj;
        if (reason === "ban") {
          await guild.members.unban(memberId);
        } else if (reason === "mute") {
          let dataDB = await moderationSch.findOne({
            GuildId: guildId,
          });
          await guild.members.fetch(memberId).roles.remove(dataDB.MuteRoleId);
        }
        await tempBanSch.deleteOne({
          GuildId: GuildId,
          memberId: memberId,
        });
      } catch (e) {}
    }, time);
}
export { startBanTimer, startTimeout };
