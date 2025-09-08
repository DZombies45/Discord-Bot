const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { profileImage } = require("discord-arts");
const { goodbye } = require("../../config.json");
const { goodbyeMessage } = require("../../messageConfig.json");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("test2")
    .setDescription("ini just test command")
    .toJSON(),
  deleted: true,
  devOnly: false,
  modOnly: false,
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    const { options, guildId, guild, member } = interaction;
    const channel = member.guild.channels.cache.get(goodbye.ch);
    if (!channel) return;
    console.log("check");
    const msg = goodbyeMessage[
      Math.floor(Math.random() * goodbyeMessage.length)
    ].replace(/<user>/g, member.user.username);

    const img = await profileImage(member.user.id, {
      borderColor: goodbye.color,
      customTag: msg,
      customDate: new Date().toLocaleDateString(),
      removeAvatarFrame: true,
      customBackground: "../../hyperion_maunt.png",
    });
    console.log("send");
    await channel.send({ files: [{ attachment: img }] });
    console.log("finis");
    //return interaction.reply("test command di jalankan");
  },
};
