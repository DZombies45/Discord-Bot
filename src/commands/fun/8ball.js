const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { gameChannel } = require("../../config.json");
const { commandCannelDeny } = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription(`Classic 8ball game`)
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription(`The question to ask the 8 ball`)
        .setRequired(true),
    ),
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
    const { options } = interaction;

    const question = options.getString("question");
    const choice = [
      "🎱| It is certian.",
      "🎱| It is decidedly so.",
      "🎱| Without a doubt.",
      "🎱| Yes definitely.",
      "🎱| You may rely on it.",
      "🎱| As I see it, yes.",
      "🎱| Most likely.",
      "🎱| Outlook good.",
      "🎱| Yes.",
      "🎱| Signs point to yes.",
      "🎱| Reply hazy, try again.",
      "🎱| Ask again later.",
      "🎱| Better not tell you now.",
      "🎱| Cannot predict now.",
      "🎱| Concentrate and ask again.",
      "🎱| Don't count on it.",
      "🎱| My reply is no.",
      "🎱| My sources say no.",
      "🎱| Outlook not so good.",
      "🎱| Very doubtful.",
    ];
    const ball = Math.floor(Math.random() * choice.length);

    const embed = new EmbedBuilder()
      .setColor("Blurple")
      .setTitle(`🎱 | ${interaction.user.username}'s 8ball game`)
      .addFields({
        name: "Question",
        value: `${question}`,
        inline: true,
      });

    const embed2 = new EmbedBuilder()
      .setColor("Blurple")
      .setTitle(`🎱 | ${interaction.user.username}'s 8ball game`)
      .addFields({ name: "Question", value: `${question}`, inline: true })
      .addFields({
        name: "Answer",
        value: `${choice[ball]}`,
        inline: true,
      });

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("button")
        .setLabel(`🎱 Roll the ball!`)
        .setStyle(ButtonStyle.Primary),
    );

    const msg = await interaction.reply({
      embeds: [embed],
      components: [button],
    });

    const collector = msg.createMessageComponentCollector();

    collector.on("collect", async (i) => {
      if (i.customId == "button") {
        i.update({ embeds: [embed2], components: [] });
      }
    });
  },
};
