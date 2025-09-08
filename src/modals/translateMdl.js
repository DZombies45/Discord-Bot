const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { Logger } = require("../util.js");
const translate = require("@iamtraction/google-translate");
const parseBahasa = require("../utils/getBahasa.js");

module.exports = {
  customId: "translateMdl",
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    const { channel, guildId, guild, user, fields } = interaction;
    try {
      const lang = fields.getTextInputValue("language_id") || "en";
      const msgid = fields.getTextInputValue("message_id") || "";
      const message = await channel.messages.fetch(msgid).content;
      if (!message || message === "")
        return interaction.reply({
          content: "no message provided",
          flags: 64,
        });
      await interaction.deferReply({ flags: 64 });
      const langTo = parseBahasa(lang);

      if (langTo.length === 0)
        return interaction.editReply({
          content: "no lang code provided",
          flags: 64,
        });

      const tertranslate = await translate(message, {
        to: langTo[0]?.value || "en",
      });

      const embed = new EmbedBuilder()
        .setColor("#afd50a")
        .setTimestamp()
        .setFooter({
          iconURL: `${client.user.displayAvatarURL({
            dynamic: true,
          })}`,
          text: `${client.user.username} - translate`,
        })
        .addFields({
          name: `Original - ${tertranslate.from.language.iso}`,
          value: `${message}`,
          inline: false,
        })
        .addFields({
          name: `Translated - ${langTo}`,
          value: `${tertranslate.text}`,
          inline: false,
        });
      await interaction.editReply({
        content: "",
        embeds: [embed],
      });
    } catch (e) {
      Logger.error(`from translateMdl.js :\n${e.stack}`);
    }
  },
};
