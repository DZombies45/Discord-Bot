import { SlashCommandBuilder } from "discord.js";
import { Slots } from "discord-gamecord";
import jsonConfig from "../../config.json" with { type: "json" };const { gameChannel } = jsonConfig;
import jsonMessageConfig from "../../messageConfig.json" with { type: "json" };const { commandCannelDeny } = jsonMessageConfig;

export default {
  data: new SlashCommandBuilder()
    .setName(`slots`)
    .setDescription(`Play some slots`),
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
    const Game = new Slots({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: "Slot Machine",
        color: "#5865F2",
      },
      slots: ["🍆", "🍊", "🍋", "🍌"],
    });

    Game.startGame();
    Game.on("gameOver", (result) => {
      return;
    });
  },
};
