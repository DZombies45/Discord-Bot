const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");
const mConfig = require("../../messageConfig.json");
const { Logger } = require("../../util.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("getmsg")
        .setDescription("[admin] get a message in a channel")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("amount of message to return")
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        ),
    deleted: true,
    userPermissions: [PermissionFlagsBits.ManageMessages],
    botPermissions: [PermissionFlagsBits.ManageMessages],
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        let amount = options.getInteger("amount");

        const multi = a => (a === 1 ? "message" : "messages");

        if (!amount || amount < 1 || amount > 100) {
            interaction.reply({
                content: "need amount to be between 1 and 100 message",
                ephemeral: true
            });
        }

        try {
            const channelMessage = await channel.messages.fetch();
            if (channelMessage.size <= 0) {
                interaction.reply({
                    content: "no message on this channel",
                    ephemeral: true
                });
            }

            if (amount > channelMessage.size) amount = channelMessage.size;

            const clearEmbed = new EmbedBuilder().setColor(
                mConfig.embedColorSuccess
            );
            await interaction.deferReply({ ephemeral: true });

            let msgToDelete = [];

            msgToDelete = channelMessage.first(amount);
            clearEmbed.setDescription(
                `Successfully log ${msgToDelete.length} ${multi(
                    msgToDelete.length
                )} on ${channel}`
            );

            interaction.editReply({ embeds: [clearEmbed], ephemeral: true });
        } catch (e) {
            Logger.error(`from cmd > clear.js :\n${e.stack}`);
            await interaction.editReply({
                content: "an error occured while clearing message",
                ephemeral: true
            });
        }
    }
};