const { SlashCommandBuilder } = require("discord.js");
const { Snake } = require("discord-gamecord");

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`snake`)
        .setDescription(`Play a game of snake`),
    deleted: false,
    devOnly: false,
    modOnly: false,
    userPermissions: [],
    botPermissions: [],
    run: async (client, interaction) => {
        const Game = new Snake({
            message: interaction,
            isSlashGame: true,
            embed: {
                title: "Snake Game",
                overTitle: "Game Over",
                color: "#5865F2"
            },
            emojis: {
                board: "⬛",
                food: "🍎",
                up: "⬆️",
                down: "⬇️",
                left: "⬅️",
                right: "➡️"
            },
            stopButton: "Stop",
            timeoutTime: 60000,
            snake: { head: "🟢", body: "🟩", tail: "🟢", over: "💀" },
            foods: ["🍎", "🍆", "🍊", "🥕", "🥝", "🌽"],
            playerOnlyMessage: "Only {player} can use these buttons."
        });

        Game.startGame();
        Game.on("gameOver", result => {
            return;
        });
    }
};
