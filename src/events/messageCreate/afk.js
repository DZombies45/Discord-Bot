import afkSchema from "../../schemas/afkSch.js";

export default async (client, message) => {
  if (!message.guild || message.author.bot) return;

  // Check if author was AFK
  const data = await afkSchema.findOne({
    userId: message.author.id,
    guildId: message.guild.id,
  });
  if (data) {
    await afkSchema.deleteOne({
      userId: message.author.id,
      guildId: message.guild.id,
    });
    message.reply(
      `Welcome back <@${message.author.id}>! I've removed your AFK status ✅`,
    );
  }

  // Check mentions
  if (message.mentions.users.size) {
    message.mentions.users.forEach(async (user) => {
      const afkData = await afkSchema.findOne({
        userId: user.id,
        guildId: message.guild.id,
      });
      if (afkData) {
        message.reply(`${user.username} is AFK 💤 - ${afkData.reason}`);
      }
    });
  }
};
