const { SlashCommandBuilder } = require("discord.js");
const { MatchPairs } = require("discord-gamecord");

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`match-pair`)
        .setDescription(`A memory game`),
    deleted: false,
    devOnly: false,
    modOnly: false,
    userPermissions: [],
    botPermissions: [],
    run: async (client, interaction) => {
        const Game = new MatchPairs({
            message: interaction,
            isSlashGame: true,
            embed: {
                title: "Match Pairs",
                color: "#5865F2",
                description:
                    "**Click on the buttons to match emojis with their pairs.**"
            },
            timeoutTime: 60000,
            emojis: [
                "🍉",
                "🍇",
                "🍊",
                "🥭",
                "🍎",
                "🍏",
                "🥝",
                "🥥",
                "🍓",
                "🫐",
                "🍍",
                "🥕",
                "🥔"
            ],
            winMessage:
                "**You won the Game! You turned a total of `{tilesTurned}` tiles.**",
            loseMessage:
                "**You lost the Game! You turned a total of `{tilesTurned}` tiles.**",
            playerOnlyMessage: "Only {player} can use these buttons."
        });

        Game.startGame();
        Game.on("gameOver", result => {
            return;
        });
    }
};
