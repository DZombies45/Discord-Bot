const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { Logger } = require("../../util.js");
const warna = { error: "#f13131", aman: "#31f158", notaman: "#b221f1" };

module.exports = {
  data: new SlashCommandBuilder()
    .setName("check")
    .setDescription("check virus on a url")
    .addStringOption((opt) =>
      opt
        .setName("url")
        .setDescription("the url you want to check")
        .setRequired(true),
    )
    .toJSON(),
  deleted: false,
  devOnly: false,
  modOnly: false,
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    if (!process.env.VIRUSAPI) {
      const embed = new EmbedBuilder()
        .setColor("#bf2c04")
        .setDescription("thare is an error, try again later");
      await interaction.editReply({ embeds: [embed] });
      Logger.error(`from ${__filename} :\nno qr api found`);
      return;
    }
    const { options, guildId, guild, user } = interaction;
    const opt = options.getString("url");
    await interaction.deferReply({ flags: 64 });

    async function sendMsg(msg, color) {
      const embed = new EmbedBuilder().setColor(color).setDescription(msg);
      await interaction.editReply({ embeds: [embed] });
    }

    async function checkUrl(url) {
      try {
        const check = encodeURIComponent(url);
        const respons = await fetch(
          `https://www.virustotal.com/vtapi/v2/url/report?apikey=${process.env.VIRUSAPI}&resource=${check}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );
        const data = await respons.json();

        if (!data.response_code)
          return [
            "⚠ that is either not a valid url or it does not exist in the dataset",
            warna.error,
          ];

        const scanDate = new Date(data.scan_date);
        const formatedScanDate = `<t:${Math.floor(
          scanDate.getTime() / 1000,
        )}:F>`;
        let results = data.positives
          ? "> ⚑ **this website contains viruses! use the link below to check it**"
          : "> ⛨ this website is safe to use!";

        const dataObj = {
          url: `> Cheked URL: \`${url}\``,
          scanDate: `> Scan Date: ${formatedScanDate}`,
          positive: `> Positives: ${data.positives}/${data.total}`,
          results: results,
          full: `> Click [here](${data.permalink}) to see full report`,
        };
        return [
          `**Your Virus Scan Report:**\n\n${Object.values(dataObj).join(
            "\n",
          )}\n\n*note: the scan date is not the time you run this command-- its the time it recently scan the website*`,
          data.positives ? warna.notaman : warna.aman,
        ];
      } catch (e) {
        return [
          "⚠ an error has occured while checking this url, try again later",
          warna.error,
        ];
      }
    }
    const web = await checkUrl(opt);
    await sendMsg(web[0], web[1]);
  },
};
