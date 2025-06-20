const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { welcome } = require("../../config.json");
const { welcomeMessage } = require("../../messageConfig.json");
const WelcomeLeave = require(`../../utils/welcomeBye`);

module.exports = async (client, member) => {
  const channel = member.guild.channels.cache.get(welcome.ch);
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
      "https://cdn.discordapp.com/attachments/1046721681445638224/1241817497754271785/Hyperion_mount.png?ex=68564eeb&is=6854fd6b&hm=e326318e7f152d18fa0b4ec373df29cf78762504c3237c14c6ea7bb2770c1f57&",
    )
    .setTitle(member.username)
    .setDescription(msg)
    .setBorder("#C21534")
    .setAvatarBorder("#703B98")
    .setOverlayOpacity(0.3)
    .build();

  await channel.send({ files: [{ attachment: img, name: "on_field.png" }] });
};
