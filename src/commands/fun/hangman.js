const { SlashCommandBuilder } = require("discord.js");
const { Hangman } = require("discord-gamecord");
const { gameChannel } = require("../../config.json");
const { commandCannelDeny } = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`hangman`)
    .setDescription(`Play a game of hangman`),
  deleted: false,
  devOnly: false,
  modOnly: false,
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    if (!gameChannel.includes(interaction.channelId))
      return interaction.reply({
        content: commandCannelDeny,
        flags: 64,
      });
    const Game = new Hangman({
      message: interaction,
      embed: {
        title: "Hangman",
        color: "#5865F2",
      },
      hangman: {
        hat: "🎩",
        head: "😨",
        shirt: "👕",
        pants: "🩳",
        boots: "👞👞",
      },
      timeoutTime: 60000,
      timeWords: "all",
      winMessage: "You won! The word was **{word}**",
      loseMessage: "You lost! The word was **{word}**",
      playerOnlyMessage: "Only {player} can use these buttons",
    });

    Game.startGame();
    Game.on("gameOver", (result) => {
      return;
    });
  },
};
