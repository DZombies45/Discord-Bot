const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { welcome } = require("../../config.json");
const { welcomeMessage } = require("../../messageConfig.json");
const WelcomeLeave = require("../../utils/welcomeBye.js");

module.exports = async (client, member) => {
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
        "https://cdn.discordapp.com/attachments/1046721681445638224/1241817497238241473/hyperion_bridge.png?ex=68564eeb&is=6854fd6b&hm=d9420c671bb265175ee1b0a07dc7514f8611d284f972e19cdf6414e570a2881d&",
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
