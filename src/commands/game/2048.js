const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { TwoZeroFourEight } = require("discord-gamecord");
const { getRandomColor } = require("../../util.js");

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
        const Game = new TwoZeroFourEight({
            message: message,
            isSlashGame: false,
            embed: {
                title: "2048",
                color: getRandomColor()
            },
            emojis: {
                up: "⬆️",
                down: "⬇️",
                left: "⬅️",
                right: "➡️"
            },
            timeoutTime: 60000,
            buttonStyle: "PRIMARY",
            playerOnlyMessage: "Only {player} can use these buttons."
        });

        Game.startGame();
        Game.on("gameOver", result => {
            return;
        });
    }
};