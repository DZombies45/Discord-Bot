const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");
const { Logger } = require("../../util.js");

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
                .setDescription("thare is an error, try again later");
            await interaction.editReply({ embeds: [embed] });
            Logger.error(`from ${__filename} :\nno qr api found`);
            return;
        }
        const { options, guildId, guild, member } = interaction;
        const text = encodeURIComponent(options.getString("text"));
        const url = `https://codzz-qr-cods.p.rapidapi.com/getQrcode?type=url&value=${text}`;
        const opts = {
            method: "GET",
            headers: {
                "x-rapidapi-key": `${process.env.QRAPI}`,
                "x-rapidapi-host": "codzz-qr-cods.p.rapidapi.com"
            }
        };
        try {
            await interaction.deferReply();
            const response = await fetch(url, opts);
            const data = await response.json();
            const embed = new EmbedBuilder()
                .setColor("#42d74d")
                .setImage(data.url);
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
