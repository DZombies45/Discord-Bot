const { EmbedBuilder } = require("discord.js");
const {
    developerId,
    testServerId,
    moderatorRoleId
} = require("../../config.json");
const mConfig = require("../../messageConfig.json");
const getLocalContextMenus = require("../../utils/getLocalContextMenus.js");
const { Logger } = require("../../util.js");

module.exports = async (client, interaction) => {
    if (!interaction.isContextMenuCommand()) return;
    const localContextMenus = getLocalContextMenus();

    try {
        const contextMenuObject = localContextMenus.find(
            cmd => cmd.data.name === interaction.commandName
        );
        if (!contextMenuObject) return;

        if (contextMenuObject.devOnly) {
            if (!developerId.includes(interaction.member.id)) {
                const rEmbed = new EmbedBuilder()
                    .setColor(`${mConfig.embedColorError}`)
                    .setDescription(`${mConfig.commandDevOnly}`);
                interaction.reply({ embeds: [rEmbed], ephemeral: true });
                return;
            }
        }

        if (contextMenuObject.modOnly) {
            if (
                !moderatorRoleId.some(roleId =>
                    interaction.member.roles.cache.has(roleId)
                )
            ) {
                const rEmbed = new EmbedBuilder()
                    .setColor(`${mConfig.embedColorError}`)
                    .setDescription(`${mConfig.commandModOnly}`);
                interaction.reply({ embeds: [rEmbed], ephemeral: true });
                return;
            }
        }

        if (contextMenuObject.testMode) {
            if (interaction.guild.id !== testServerId) {
                const rEmbed = new EmbedBuilder()
                    .setColor(`${mConfig.embedColorError}`)
                    .setDescription(`${mConfig.commandTestMode}`);
                interaction.reply({ embeds: [rEmbed], ephemeral: true });
                return;
            }
        }

        if (contextMenuObject.userPermissions?.length) {
            for (const permission of contextMenuObject.userPermissions) {
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

        if (contextMenuObject.botPermissions?.length) {
            for (const permission of contextMenuObject.botPermissions) {
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

        await contextMenuObject.run(client, interaction);
    } catch (err) {
        Logger.error(`from contextMenuCmdValidator.js :\n${err.stack}`);
    }
};
