const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
} = require("discord.js");
const { formatDate, Logger } = require("../util.js");
const userCaptha = require("../schemas/userCapchaSch.js");
const verification = require("../schemas/verificationSch.js");
const generateCaptcha = require("../utils/getCaptcha.js");

module.exports = {
  customId: "verifyBtn",
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    const { message, channel, guildId, guild, member } = interaction;
    await interaction.deferReply();

    const data = await verification.findOne({ GuildId: guildId });
    if (!data)
      return interaction.editReply({
        content: "❗ verification is disable in this server",
        flags: 64,
      });
    if (member.roles.cache.has(data.role))
      return interaction.editReply({
        content: "❗ you already verified",
        flags: 64,
      });
    const userData = await userCaptha.findOne({
      GuildId: guildId,
      memberId: member.id,
    });

    const exmCaptcha = generateCaptcha(600, 200, 6);
    const captchaImg = exmCaptcha.buffer;
    const attachment = new AttachmentBuilder(captchaImg, {
      name: "captcha.png",
    });

    const embed = new EmbedBuilder()
      .setColor("#d11a58")
      .setTitle("captcha")
      .setDescription(`type \`/verify <captcha code>\` with the code to verify`)
      .setImage("attachment://captcha.png");
    const button = new ActionRowBuilder().setComponents(
      new ButtonBuilder()
        .setCustomId("submitCaptchaBtn")
        .setLabel("submit")
        .setStyle(ButtonStyle.Success),
    );
    if (userData) {
      userData.capcha = exmCaptcha.text;
      await userData.save();
    } else {
      await userCaptha.create({
        GuildId: guildId,
        memberId: member.id,
        capcha: exmCaptcha.text,
        ke: 0,
      });
    }

    // await interaction.editReply({
    //   embeds: [embed],
    //   components: [button],
    //   flags: 64,
    //   files: [attachment],
    // });
    await interaction.editReply({
      embeds: [embed],
      components: [button],
      files: [attachment],
      ephemeral: true,
    });
  },
};
