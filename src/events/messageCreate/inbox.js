const { PermissionFlagsBits } = require("discord.js");
const inboxSchema = require("../../schemas/inboxSch.js");
const { trimText } = require("../../util.js");

module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;

  let members = await message.guild.members.fetch();
  members = members.filter((m) => m.user.bot === false);

  async function create(member) {
    if (member.id === message.author.id) return;
    if (member.bot) return;
    const memberPermissions = message.channel.permissionsFor(member);
    if (
      !memberPermissions ||
      !memberPermissions.has(PermissionFlagsBits.ViewChannel)
    )
      return;

    await inboxSchema.create({
      User: member.id,
      Message: trimText(message.content, 100),
      Guild: message.guild.id,
      ID: message.id,
      ChannelId: message.channel.id,
    });
  }

  if (message.mentions.members.size > 0) {
    await message.mentions.members.forEach(async (member) => {
      await create(member.user);
    });
  } else if (
    message.content.includes("@here") ||
    message.content.includes("@everyone")
  ) {
    await members.forEach(async (member) => await create(member.user));
  } else if (message.mentions.roles.size > 0) {
    await message.mentions.roles.filter(async (role) => {
      await members.forEach(async (member) => {
        if (member.roles.cache.has(role.id)) await create(member.user);
      });
    });
  }
};
