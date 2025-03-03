const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");
const { Logger } = require("../../util.js");
const QRCode = require("qrcode");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("qrc")
    .setDescription("create qr code")
    .addStringOption(opt =>
      opt
        .setName("text")
        .setDescription("the text or link to convert")
        .setRequired(true)
    )
    .toJSON(),
  deleted: false,
  devOnly: false,
  modOnly: false,
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    if (!process.env.QRAPI) {
      const embed = new EmbedBuilder()
        .setColor("#bf2c04")
        .setDescription("there is an error, try again later");
      await interaction.editReply({ embeds: [embed] });
      Logger.error(`from ${__filename} :\nno qr api found`);
      return;
    }
    const { options, guildId, guild, member } = interaction;
    const text = encodeURIComponent(options.getString("text"));

    try {
      const qrBuffer = await QRCode.toBuffer(text);
      const attachment = new MessageAttachment(qrBuffer, "qrcode.png");
      const embed = new EmbedBuilder().setColor("#42d74d");
      interaction.editReply({ embeds: [embed], files: [attachment] });
    } catch (e) {
      const embed = new EmbedBuilder()
        .setColor("#bf2c04")
        .setDescription("thare is an error, try again later");
      interaction.editReply({ embeds: [embed] });
      Logger.error(`from ${__filename} :\n${e.stack}`);
    }
  }
};
