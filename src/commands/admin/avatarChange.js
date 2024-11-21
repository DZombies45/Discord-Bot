const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Logger } = require("../../util.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("[admin] change bot avatar")
        .addAttachmentOption(opt =>
            opt
                .setName("image")
                .setDescription("uploaded image to use on avatar")
                .setRequired(true)
        )
        .toJSON(),
    deleted: false,
    devOnly: true,
    userPermissions: [],
    botPermissions: [],
    run: async (client, interaction) => {
        const { options } = interaction;
        const avatar = options.getAttachment("avatar");

        async function sendMsg(msg) {
            await interaction.reply({
                content: `${msg}`,
                ephemeral: true
            });
        }

        Logger.log(`avatar type = ${avatar.contentType}`);
        if (
            image.contentType !== "image/gif" &&
            image.contentType !== "image/png"
        )
            await sendMsg(`file not supported`);

        let error = false;
        await client.user.setAvatar(avatar.url).catch(async e => {
            error = true;
            Logger.debug(e.stack);
        });
        if (error) return sendMsg("an error has occured");
        sendMsg(`avatar uploaded, applying avatar...`);
    }
};
