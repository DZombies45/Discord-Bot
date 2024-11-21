const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");
const { Logger } = require("../../util.js");
const canfy = require("../../../canvafy-main/index.js");
const mConfig = require("../../messageConfig.json");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("create profile of a user just like /info user")
        .addUserOption(option =>
            option.setName("target").setDescription("target user for profile")
        )
        .toJSON(),
    deleted: false,
    devOnly: false,
    modOnly: false,
    userPermissions: [],
    botPermissions: [],
    run: async (client, interaction) => {
        const { options, guildId, guild, user } = interaction;
        const target = options.getUser("target") || user;
        try {
            const id = target.id;
            if (!id) return await interaction.send("unknown user id");
            const img = await new canfy.Profile().setUser(`${id}`).build();
            const embed = new EmbedBuilder()
                .setColor(mConfig.embedColorSuccess)
                .setDescription(`${img}`);
            interaction.send({ embeds: [embed] });
        } catch (e) {
            Logger.error(`from ${__filename} :\n${e.stack}`);
        }
    }
};
