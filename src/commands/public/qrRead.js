const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");
const { Logger } = require("../../util.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("qrr")
        .setDescription("read qr code")
        .addStringOption(opt =>
            opt.setName("url").setDescription("url to the qr code to read")
        )
        .addAttachmentOption(opt =>
            opt.setName("qr-code").setDescription("uploaded qr image to read")
        )
        .toJSON(),
    deleted: false,
    devOnly: false,
    modOnly: false,
    userPermissions: [],
    botPermissions: [],
    run: async (client, interaction) => {
        const { options, guildId, guild, member } = interaction;
        const optUrl = options.getString("url") || undefined;
        const optImg = options.getAttachment("qr-code") || undefined;
        if (!optImg && !optUrl)
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#bf2c04")
                        .setDescription("need an option to work read")
                ],
                ephemeral: true
            });
        if (
            optImg &&
            optImg.contentType !== "image/gif" &&
            optImg.contentType !== "image/png"
        )
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#bf2c04")
                        .setDescription("qr can only read png or gif")
                ],
                ephemeral: true
            });

        const text = encodeURIComponent(optUrl || optImg.url);
        const url = `http://api.qrserver.com/v1/read-qr-code/?fileurl=${text}`;
        const opts = {
            method: "GET"
        };
        try {
            await interaction.deferReply();
            const response = await fetch(url, opts);
            const data = (await response.json())[0].symbol[0];
            const embed = new EmbedBuilder()
                .setColor("#42d74d")
                .setDescription(`qr read: \`${data.data}\``);
            interaction.editReply({ embeds: [embed] });
        } catch (e) {
            const embed = new EmbedBuilder()
                .setColor("#bf2c04")
                .setDescription("thare is an error, try again later");
            interaction.editReply({ embeds: [embed] });
            Logger.error(`from ${__filename} :\n${e.stack}`);
        }
    }
};
