const { SlashCommandBuilder } = require("discord.js");
const { FindEmoji } = require("discord-gamecord");
const { gameChannel } = require("../../config.json");
const { commandCannelDeny } = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`find-emoji`)
    .setDescription(`Play a game of find the emoji`),
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
    const Game = new FindEmoji({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: "Find Emoji",
        color: "#5865F2",
        description: "Remember the emojis from the board below.",
        findDescription: "Find the {emoji} emoji before the time runs out.",
      },
      timeoutTime: 60000,
      hideEmojiTime: 5000,
      buttonStyle: "PRIMARY",
      emojis: ["🍉", "🍇", "🍊", "🍋", "🥭", "🍎", "🍏", "🥝"],
      winMessage: "You won! You selected the correct emoji. {emoji}",
      loseMessage: "You lost! You selected the wrong emoji. {emoji}",
      timeoutMessage: "You lost! You ran out of time. The emoji is {emoji}",
      playerOnlyMessage: "Only {player} can use these buttons.",
    });

    Game.startGame();
    Game.on("gameOver", (result) => {
      return;
    });
  },
};
