const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ActionRow,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} = require("discord.js");
const buttonPaginator = require("../../utils/buttonPaginator.js");
const path = require("path");
const getAllFiles = require("../../utils/getAllFiles.js");
const { Logger } = require("../../util.js");
const time = 60 * 1000;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("show all command form this bot")
        .toJSON(),
    deleted: false,
    devOnly: false,
    modOnly: false,
    userPermissions: [],
    botPermissions: [],
    run: async (client, interaction) => {
        const allCommans = {};

        const commandFolders = getAllFiles(path.join(__dirname, ".."), true);
        for (const commandFolder of commandFolders) {
            const commandFiles = getAllFiles(commandFolder);
            const cmds = [];
            for (const commandFile of commandFiles) {
                const cmdObject = require(commandFile);
                if (cmdObject.deleted) continue;
                cmds.push(cmdObject);
            }
            allCommands[commandFolder] = cmds;
        }

        const embed = new EmbedBuilder()
            .setTitle("**HELP**")
            .setTimestamp()
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setFooter({
                iconURL: `${client.user.displayAvatarURL({
                    dynamic: true
                })}`,
                text: `${client.user.username} - All Commands`
            })
            .setDescription(
                "Select a category from the dropdown menu to view commands"
            )
            .setColor("#cfd453");

        const dropdownOptions = Object.keys(allCommands).map(folder => ({
            label: folder,
            value: folder
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("category-select")
            .setPlaceholder("Select a category")
            .addOptions(
                ...dropdownOptions.map(option => ({
                    label: option.label,
                    value: option.value
                }))
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });

        const filter = i =>
            i.isSelectMenu() && i.customId === "category-select";
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time
        });
        let selectedCategory = 0;

        function getEmbed() {
            const categoryCommands = allCommands[selectedCategory];

            return new EmbedBuilder()
                .setTitle(`${selectedCategory} Commands`)
                .setDescription("List of available commands in this category:")
                .setThumbnail(`${client.user.displayAvatarURL()}`)
                .addFields(
                    categoryCommands.map(command => ({
                        name: `- **/${command.name}**`,
                        value: command.description
                    }))
                );
        }

        collector.on("collect", async i => {
            selectedCategory = i.values[0];

            await i.update({ embeds: [getEmbed()] });
            collector.resetTimer();
        });
        collector.on("end", async i => {
            await i.update({
                embeds: [getEmbed()],
                components: []
            });
        });
    }
};
