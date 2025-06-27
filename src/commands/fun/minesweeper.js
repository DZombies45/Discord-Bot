const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Minesweeper } = require("discord-gamecord");
const { getRandomColor } = require("../../util.js");
const { gameChannel } = require("../../config.json");
const { commandCannelDeny } = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("minesweeper")
    .setDescription("[game] Minesweeper")
    .addIntegerOption((option) =>
      option
        .setName("mine")
        .setDescription("amount of mine")
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(false),
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
    const bomb = interaction?.options?.getInteger("amount") || 5;
    const Game = new Minesweeper({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: "Minesweeper",
        color: getRandomColor(),
        description: "Click on the buttons to reveal the blocks except mines.",
      },
      emojis: { flag: "🚩", mine: "💣" },
      mines: bomb,
      timeoutTime: 60000,
      winMessage: "You won the Game! You successfully avoided all the mines.",
      loseMessage: "You lost the Game! Beaware of the mines next time.",
      playerOnlyMessage: "Only {player} can use these buttons.",
    });

    Game.startGame();
    Game.on("gameOver", (result) => {
      return;
    });
  },
};
