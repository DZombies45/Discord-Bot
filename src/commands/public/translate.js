const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const translate = require("@iamtraction/google-translate");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("translate")
    .setDescription("translate new message or message id to other language")
    .addStringOption((option) =>
      option
        .setName("lang")
        .setDescription("language to translate to")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addStringOption((option) =>
      option
        .setName("msg")
        .setDescription("what you want to translate")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("msg_id")
        .setDescription("message id you want to translate")
        .setRequired(false),
    )
    .toJSON(),
  deleted: false,
  devOnly: false,
  modOnly: false,
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    const { options, channel } = interaction;
    let message = "";
    const msgid = options.getString("msg_id") || undefined;
    const langTo = options.getString("lang") || "en";

    if (msgid) message = await channel.messages.fetch(msgid).content;
    else message = options.getString("msg");

    if (!message || message === "")
      return interaction.reply({
        content: "no message provided",
        flags: 64,
      });

    await interaction.deferReply({ flags: 64 });

    const tertranslate = await translate(message, { to: langTo });

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
      embeds: [embed],
      flags: 64,
    });
  },
};
