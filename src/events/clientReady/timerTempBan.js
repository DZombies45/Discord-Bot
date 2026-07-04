import { Logger } from "../../util.js";
import mongoose from "mongoose";
import tempBanSch from "../../schemas/tempBanSch.js";
import moderationSch from "../../schemas/moderationSch.js";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);

// Kumpulan timeout aktif per _id, supaya kita bisa cancel & re-schedule
// tanpa duplikasi kalau interval scan menemukan record yang sama lagi.
const scheduled = new Map();

async function executeExpiry(client, data) {
  try {
    const { _id, GuildId, memberId, reason } = data;

    const guild =
      client.guilds.cache.get(GuildId) || (await client.guilds.fetch(GuildId));
    if (!guild) {
      await tempBanSch.deleteOne({ _id }).catch(() => null);
      return;
    }

    if (reason === "ban") {
      await guild.bans.remove(memberId).catch(() => null);
    } else if (reason === "mute") {
      const modData = await moderationSch.findOne({ GuildId });
      if (modData?.MuteRoleId) {
        const member = await guild.members.fetch(memberId).catch(() => null);
        await member?.roles.remove(modData.MuteRoleId).catch(() => null);
      }
    }

    await tempBanSch.deleteOne({ _id }).catch(() => null);
  } catch (e) {
    Logger.error(`from ${__filename} (executeExpiry) :\n${e.stack}`);
  } finally {
    scheduled.delete(String(data._id));
  }
}

function scheduleExpiry(client, data) {
  const id = String(data._id);
  if (scheduled.has(id)) return; // sudah dijadwalkan, jangan duplikasi

  let delay = data.endTime - Date.now();
  if (delay < 0) delay = 0;

  const timeout = setTimeout(() => executeExpiry(client, data), delay);
  scheduled.set(id, timeout);
}

export default async (client) => {
  async function checkTempBan() {
    // Skip cycle ini kalau koneksi DB belum siap (reconnect setelah
    // putus jaringan hosting). Mencegah query gantung / error mentah.
    if (mongoose.connection.readyState !== 1) {
      Logger.log(
        `[timerTempBan] Melewati cycle ini, koneksi DB belum siap (readyState: ${mongoose.connection.readyState})`,
      );
      return;
    }

    try {
      const banData = await tempBanSch.find();
      for (const data of banData) {
        scheduleExpiry(client, data);
      }
    } catch (e) {
      Logger.error(`from ${__filename} (checkTempBan) :\n${e.stack}`);
    }
  }

  checkTempBan();
  // Poll tiap 5 menit. Menggantikan tempBanSch.watch() (Change Stream) yang
  // sebelumnya dipakai — Change Stream butuh koneksi long-lived yang stabil,
  // dan itu rentan putus diam-diam di jaringan shared hosting. Polling lebih
  // tahan banting: worst case delay 5 menit untuk tempban baru, tapi tidak
  // akan pernah "diam-diam berhenti bekerja" tanpa jejak error.
  setInterval(checkTempBan, 5 * 60 * 1000);
};
