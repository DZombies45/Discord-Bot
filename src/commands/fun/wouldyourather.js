import { SlashCommandBuilder } from "discord.js";
import { WouldYouRather } from "discord-gamecord";
import { gameChannel } from "../../config.json.js";
import { commandCannelDeny } from "../../messageConfig.json.js";

export default {
  data: new SlashCommandBuilder()
    .setName(`would-you-rather`)
    .setDescription(`Play a game of would you rather`),
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
    const Game = new WouldYouRather({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: "Would You Rather",
        color: "#5865F2",
      },
      buttons: {
        option1: "Option 1",
        option2: "Option 2",
      },
      timeoutTime: 60000,
      errMessage: "Unable to fetch question data! Please try again.",
      playerOnlyMessage: "Only {player} can use these buttons.",
    });

    Game.startGame();
  },
};
