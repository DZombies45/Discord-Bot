const {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    EmbedBuilder
} = require("discord.js");
const translate = require("@iamtraction/google-translate");
const parseBahasa = require("../utils/getBahasa.js");

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("Translate")
        .setType(ApplicationCommandType.Message),
    deleted: false,
    userPermissions: [],
    botPermissions: [],
    run: async (client, interaction) => {
        const { targetMessage, user, channel } = interaction;
        const message = targetMessage.content;
        await interaction.deferReply({
            ephemeral: true
        });
        await interaction.editReply({
            content: "please type target language in 10s",
            ephemeral: true
        });

        const filter = m => m.author.id === user.id;

        const lang = await channel
            .awaitMessages({
                filter,
                max: 1,
                time: 10000,
                errors: ["time"]
            })
            .then(selLang => {
                if (selLang.first().content.toLowerCase() === "cancel") {
                    return;
                }
                selLang.first().delete();
                return selLang;
            })
            .catch(() => {
                return;
            });
        const langTo = parseBahasa(lang);

        if (langTo.length === 0)
            return interaction.editReply({
                content: "no lang code provided",
                ephemeral: true
            });

        const tertranslate = await translate(message, { to: langTo[0].value });

        const embed = new EmbedBuilder()
            .setColor("#afd50a")
            .setTimestamp()
            .setFooter({
                iconURL: `${client.user.displayAvatarURL({
                    dynamic: true
                })}`,
                text: `${client.user.username} - translate`
            })
            .addFields({
                name: `Original - ${tertranslate.from.language.iso}`,
                value: `${message}`,
                inline: false
            })
            .addFields({
                name: `Translated - ${langTo}`,
                value: `${tertranslate.text}`,
                inline: false
            });
        await interaction.editReply({
            content: "",
            embeds: [embed],
            ephemeral: true
        });
    }
};
