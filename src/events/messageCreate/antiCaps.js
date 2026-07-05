import { Logger } from "../../util.js";

/**
 * @param {import("discord.js").Client} client
 * @param {import("discord.js").Message} message
 */
export default async (client, message) => {
  try {
    // code
    if (!message.guild || message.author.bot) return;
    let msg = message.content;
    if (msg?.length <= 5) return;
    if (
      msg.trim().match(/[A-Z]/g).length /
        msg.trim().replaceAll(" ", "").length <
      0.8
    )
      return;
    //do something
    const a = await message
      .reply("❗ **message contains too many uppercase letters** ❗")
      .catch(() => {});
    await message.delete().catch(() => {});
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await a.delete().catch(() => {});
  } catch (err) {
    Logger.error(err);
  }
};
