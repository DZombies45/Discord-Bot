const {
    SlashCommandBuilder,
    Routes,
    resolveImage,
    EmbedBuilder
} = require("discord.js");
const {
    embedColorSuccess,
    embedColorError
} = require("../../messageConfig.json");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("changebanner")
        .setDescription("[admin] change bog banner")
        .addAttachmentOption(opt =>
            opt
                .setName("image")
                .setDescription("uploaded image to use on banner")
                .setRequired(true)
        )
        .toJSON(),
    deleted: false,
    devOnly: true,
    modOnly: false,
    userPermissions: [],
    botPermissions: [],
    run: async (client, interaction) => {
        const { options, guildId, guild, member } = interaction;
        const image = options.getAttachment("image");
        if (!image) return interaction.reply("no picture added");

        async function say(text, colour = "#9c04bf") {
            const embed = new EmbedBuilder()
                .setColor(colour)
                .setDescription(text);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (
            image.contentType !== "image/gif" &&
            image.contentType !== "image/png"
        )
            return say(
                `image need to be gif or png, your is ${image.contentType}`,
                embedColorError
            );

        let error = false;
        await client.rest
            .patch(Routes.user(), {
                body: { banner: await resolveImage(image.url) }
            })
            .catch(async err => {
                error = true;
                say(`an error ocured: \`${err}\``, embedColorError);
            });
        if (error) return;
        say("successfully change banner", embedColorSuccess);
    }
};
