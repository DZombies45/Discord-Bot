const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Connect4 } = require("discord-gamecord");
const { getRandomColor } = require("../../util.js");
const { gameChannel } = require("../../config.json");
const { commandCannelDeny } = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("connect4")
    .setDescription("[game] Connect4")
    .addUserOption((opt) =>
      opt
        .setName("user")
        .setDescription("target user to be openent")
        .setRequired(true),
    )
    .toJSON(),
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
    const Game = new Connect4({
      message: interaction,
      isSlashGame: true,
      opponent: interaction.options.getUser("user"),
      embed: {
        title: "Connect4 Game",
        statusTitle: "Status",
        color: getRandomColor(),
      },
      emojis: {
        board: "⚫",
        player1: "🔴",
        player2: "🟡",
      },
      mentionUser: true,
      timeoutTime: 60000,
      buttonStyle: "PRIMARY",
      turnMessage: "{emoji} | Its turn of player **{player}**.",
      winMessage: "{emoji} | **{player}** won the Connect4 Game.",
      tieMessage: "The Game tied! No one won the Game!",
      timeoutMessage: "The Game went unfinished! No one won the Game!",
      playerOnlyMessage: "Only {player} and {opponent} can use these buttons.",
    });

    Game.startGame();
    Game.on("gameOver", (result) => {
      return;
    });
  },
};
