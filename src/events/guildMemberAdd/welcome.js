import { EmbedBuilder, AuditLogEvent } from "discord.js";
import jsonConfig from "../../config.json" with { type: "json" };
const { welcome } = jsonConfig;
import jsonMessageConfig from "../../messageConfig.json" with { type: "json" };
const { welcomeMessage } = jsonMessageConfig;
import WelcomeLeave from "../../utils/welcomeBye.js";

export default async (client, member) => {
  try {
    const channel = await member.guild.channels.cache.get(welcome.ch);
    if (!channel) return;

    const msg = welcomeMessage[
      Math.floor(Math.random() * welcomeMessage.length)
    ].replace(/<user>/g, member.user.username);

    const img = await new WelcomeLeave()
      .setAvatar(
        member.user.displayAvatarURL({ forceStatic: true, extension: "png" }),
      )
      .setBackground(
        "image",
        "https://cdn.jsdelivr.net/gh/DZombies45/img-assets@main/hi3/hyperion_bridge.png",
      )
      .setTitle(member.displayName)
      .setDescription(msg, "#37A433")
      .setBorder("#37A433")
      .setAvatarBorder("#703B98")
      .setOverlayOpacity(0.5)
      .build();

    await channel.send({ files: [{ attachment: img, name: "on_bridge.png" }] });
  } catch (error) {
    console.error(error);
  }
};
