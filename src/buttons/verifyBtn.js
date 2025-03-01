const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const { formatDate, Logger } = require("../util.js");
const userCaptha = require("../schemas/userCapchaSch.js");
const verification = reuire("../schemas/verificationSch.js");
const canfy_main = require("../../canvafy-main/index.js");

module.exports = {
    customId: "verifyBtn",
    userPermissions: [],
    botPermissions: [],
    run: async (client, interaction) => {
        const { message, channel, guildId, guild, user } = interaction;
        await interaction.deferReply();

        const data = await verification.findOne({ GuildId: guildId });
        if (!data)
            return inteaction.editReply({
                content: "❗ verification is disable in this server",
                ephemeral: true
            });
        if (user.roles.cache.has(data.role))
            return inteaction.editReply({
                content: "❗ you already verified",
                ephemeral: true
            });
        const userData = userCaptha.findOne({
            GuildId: guildId,
            memberId: user.id
        });

        const exmCaptcha = new canfy_main.NewCaptcha(600, 200, 6);
        exmCaptcha.addDecoy({ total: 20, size: 40 });
        exmCaptcha.drawCaptcha({ size: 40 });
        exmCaptcha.addDecoy();
        exmCaptcha.drawTrace();
        exmCaptcha.async = true;

        const captchaImg = await exmCaptcha.png;

        const embed = new EmbedBuilder()
            .setColor("#d11a58")
            .setTitle("captcha")
            .setDescription(
                `type \`/verify <captcha code>\` with the code to verify`
            );
        const button = new ActionRowBuilder().setComponents(
            new ButtonBuilder()
                .setCustomId("submitCaptchaBtn")
                .setLabel("submit")
                .setImage(captchaImg)
                .setStyle(ButtonStyle.Success)
        );
        if (userData) {
            userData.capcha = exmCaptcha.text;
            await userData.save();
        } else {
            await userCaptha.create({
                GuildId: guildId,
                memberId: user.id,
                capcha: exmCaptcha.text,
                ke: 0
            });
        }

        await interaction.editReplay({
            embeds: [embed],
            components: [button],
            ephemeral: true
        });
    }
};
