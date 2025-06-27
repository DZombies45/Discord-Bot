const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { formatDate, Logger } = require("../util.js");
const userCaptha = require("../schemas/userCapchaSch.js");
const verification = reuire("../schemas/verificationSch.js");
const generateCaptcha = require("../utils/getCaptcha.js");

module.exports = {
  customId: "verifyBtn",
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    const { message, channel, guildId, guild, user } = interaction;
    await interaction.deferReply();

    const data = await verification.findOne({ GuildId: guildId });
    if (!data)
      return interaction.editReply({
        content: "❗ verification is disable in this server",
        flags: 64,
      });
    if (user.roles.cache.has(data.role))
      return interaction.editReply({
        content: "❗ you already verified",
        flags: 64,
      });
    const userData = userCaptha.findOne({
      GuildId: guildId,
      memberId: user.id,
    });

    const exmCaptcha = new generateCaptcha(600, 200, 6);

    const captchaImg = exmCaptcha.buffer;

    const embed = new EmbedBuilder()
      .setColor("#d11a58")
      .setTitle("captcha")
      .setDescription(`type \`/verify <captcha code>\` with the code to verify`)
      .setImage(captchaImg);
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
        memberId: user.id,
        capcha: exmCaptcha.text,
        ke: 0,
      });
    }

    await interaction.editReplay({
      embeds: [embed],
      components: [button],
      flags: 64,
    });
  },
};
