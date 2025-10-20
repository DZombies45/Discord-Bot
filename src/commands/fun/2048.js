import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { TwoZeroFourEight } from "discord-gamecord";
import { getRandomColor } from "../../util.js";
import jsonConfig from "../../config.json" with { type: "json" };const { gameChannel } = jsonConfig;
import jsonMessageConfig from "../../messageConfig.json" with { type: "json" };const { commandCannelDeny } = jsonMessageConfig;

export default {
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
