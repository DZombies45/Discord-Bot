const { EmbedBuilder } = require("discord.js");

module.exports = async (client, message) => {
  if (message.mentions.users.size === 0) return;
  if (!message.guild || message.author.bot) return;
  if (
    (await message.mentions.members.find(
      (member) => member.user.id === client.user.id,
    )) == undefined
  )
    return;

  const embed = new EmbedBuilder()
    .setTitle("Bot Pinged")
    .setDescription(
      `hello... ${client.user.username} here, how can I help you?\n\n\`some usefull command\`\n- **/inbox open** to see your inbox from people pinging you\n\nto see all my command, type **/help**`,
    )
    .setColor(0x3498db)
    .setThumbnail(client.user.displayAvatarURL())
    .setTimestamp();

  message.channel.send({ embeds: [embed] });
};
