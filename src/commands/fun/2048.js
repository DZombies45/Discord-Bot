const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { TwoZeroFourEight } = require("discord-gamecord");
const { getRandomColor } = require("../../util.js");
const { gameChannel } = require("../../config.json");
const { commandCannelDeny } = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("2045")
    .setDescription("[game] 2048")
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
    const Game = new TwoZeroFourEight({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: "2048",
        color: getRandomColor(),
      },
      emojis: {
        up: "⬆️",
        down: "⬇️",
        left: "⬅️",
        right: "➡️",
      },
      timeoutTime: 60000,
      buttonStyle: "PRIMARY",
      playerOnlyMessage: "Only {player} can use these buttons.",
    });

    Game.startGame();
    Game.on("gameOver", (result) => {
      return;
    });
  },
};
