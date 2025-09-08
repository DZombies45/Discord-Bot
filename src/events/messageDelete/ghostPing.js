const { EmbedBuilder } = require("discord.js");
const { recentMentions, Logger } = require("../../util.js");
const { ghostPingLogChannel } = require("../../config.json");

module.exports = async (client, message) => {
  return;
  if (!recentMentions.has(message.id)) return;
  const ghostPing = recentMentions.get(message.id);

  const logChannel = client.channels.cache.get(ghostPingLogChannel);

  try {
    const user = await client.users.fetch(ghostPing.author);
    const member = await logChannel.guild.members.fetch(user.id);

    let dmEmbed = new EmbedBuilder()
      .setTitle("Timeout Notification")
      .setColor(0x3498db)
      .setDescription("You have been temporarily timed out for ghost pinging.")
      .addFields(
        { name: "Reason", value: "Ghost Pinging", inline: true },
        { name: "Duration", value: "1 Minute", inline: true },
        { name: "Message Content", value: ghostPing.content },
        {
          name: "Original Message Timestamp",
          value: `<t:${Math.floor(ghostPing.timestamp / 1000)}:R>`,
          inline: true,
        },
      )
      .setThumbnail(user.displayAvatarURL())
      .setTimestamp()
      .setFooter({
        text: "This is an automated message. Please refrain from ghost pinging.",
        iconURL:
          "https://www.freeiconspng.com/thumbs/less-than-sign-icon/less-than-sign-icon-21.png",
      });

    await user.send({ embeds: [dmEmbed] });
    dmEmbed
      .setDescription(
        `<@${user.id}> have been temporarily timed out for ghost pinging`,
      )
      .setFooter({
        text: "This is an automated message.",
        iconURL:
          "https://www.freeiconspng.com/thumbs/less-than-sign-icon/less-than-sign-icon-21.png",
      });
    await logChannel.send({ embeds: [dmEmbed] });
    //await member.timeout(60000, "Ghost pinging");
  } catch (err) {
    Logger.error(`Error applying timeout or sending DM: \n${err.stack}`);
  }
};
