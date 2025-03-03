const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("emojify")
    .setDescription("Send a message in emojis")
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("The text to convert")
        .setRequired(true)
        .setMaxLength(2000)
        .setMinLength(1),
    ),

  deleted: false,
  devOnly: false,
  modOnly: false,
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    const { options } = interaction;
    const text = options.getString("text");

    //This just logs the text incase someone says something naughty😼
    console.log(text);

    var emojiText = text
      .toLowerCase()
      .split("")
      .map((letter) => {
        if (letter == " ") return "   ";
        else return `:regional_indicator_${letter}:`;
      })
      .join("");

    if (emojiText.length >= 2000)
      emojiText = "I cant emojify this text-- it is too long!";

    await interaction.reply({ content: emojiText });
  },
};
