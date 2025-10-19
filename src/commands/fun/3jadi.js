import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { Connect4 } from "discord-gamecord";
import { getRandomColor } from "../../util.js";
import { gameChannel } from "../../config.json.js";
import { commandCannelDeny } from "../../messageConfig.json.js";

export default {
  data: new SlashCommandBuilder()
    .setName("tictactoe")
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
    const Game = new TicTacToe({
      message: interaction,
      isSlashGame: true,
      opponent: interaction.options.getUser("user"),
      embed: {
        title: "Tic Tac Toe",
        color: getRandomColor(),
        statusTitle: "Status",
        overTitle: "Game Over",
      },
      emojis: {
        xButton: "❌",
        oButton: "🔵",
        blankButton: "☐",
      },
      mentionUser: true,
      timeoutTime: 60000,
      xButtonStyle: "DANGER",
      oButtonStyle: "PRIMARY",
      turnMessage: "{emoji} | Its turn of player **{player}**.",
      winMessage: "{emoji} | **{player}** won the TicTacToe Game.",
      tieMessage: "The Game tied! No one won the Game!",
      timeoutMessage: "The Game went unfinished! No one won the Game!",
      playerOnlyMessage: "Only {player} and {opponent} can use these buttons.",
    });

    Game.startGame();
    Game.on("gameOver", (result) => {
      console.log(result); // =>  { result... }
    });

    Game.startGame();
    Game.on("gameOver", (result) => {
      return;
    });
  },
};
