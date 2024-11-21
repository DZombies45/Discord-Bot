const { EmbedBuilder } = require("discord.js");
const { developerId, testServerId } = require("../../config.json");
const mConfig = require("../../messageConfig.json");
const getButtons = require("../../utils/getButtons.js");
const { Logger } = require("../../util.js");

module.exports = async (client, interaction) => {
    if (!interaction.isButton()) return;
    const buttons = getButtons();

    try {
        const buttonObject = buttons.find(
            btn => btn.customId === interaction.customId
        );
        if (!buttonObject) return;

        if (buttonObject.devOnly) {
            if (!developerId.includes(interaction.member.id)) {
                const rEmbed = new EmbedBuilder()
                    .setColor(`${mConfig.embedColorError}`)
                    .setDescription(`${mConfig.commandDevOnly}`);
                interaction.reply({ embeds: [rEmbed], ephemeral: true });
                return;
            }
        }

        if (buttonObject.testMode) {
            if (interaction.guild.id !== testServerId) {
                const rEmbed = new EmbedBuilder()
                    .setColor(`${mConfig.embedColorError}`)
                    .setDescription(`${mConfig.commandTestMode}`);
                interaction.reply({ embeds: [rEmbed], ephemeral: true });
                return;
            }
        }

        if (buttonObject.userPermissions?.length) {
            for (const permission of buttonObject.userPermissions) {
                if (interaction.member.permissions.has(permission)) {
                    continue;
                }
                const rEmbed = new EmbedBuilder()
                    .setColor(`${mConfig.embedColorError}`)
                    .setDescription(`${mConfig.userNoPermissions}`);
                interaction.reply({ embeds: [rEmbed], ephemeral: true });
                return;
            }
        }

        if (buttonObject.botPermissions?.length) {
            for (const permission of buttonObject.botPermissions) {
                const bot = interaction.guild.members.me;
                if (bot.permissions.has(permission)) {
                    continue;
                }
                const rEmbed = new EmbedBuilder()
                    .setColor(`${mConfig.embedColorError}`)
                    .setDescription(`${mConfig.botNoPermissions}`);
                interaction.reply({ embeds: [rEmbed], ephemeral: true });
                return;
            }
        }

        if (interaction.message.interaction) {
            if (
                interaction.message.interaction.user.id !== interaction.user.id
            ) {
                const rEmbed = new EmbedBuilder()
                    .setColor(`${mConfig.embedColorError}`)
                    .setDescription(`${mConfig.cannottUseButton}`);
                interaction.reply({ embeds: [rEmbed], ephemeral: true });
                return;
            }
        }

        await buttonObject.run(client, interaction);
    } catch (err) {
        Logger.error(`from buttonValidator.js :\n${err.stack}`);
    }
};
