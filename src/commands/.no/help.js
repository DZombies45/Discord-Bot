const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ActionRow,
} = require("discord.js");
const buttonPaginator = require("../../utils/buttonPaginator.js");
const path = require("path");
const getAllFiles = require("../../utils/getAllFiles.js");
const { Logger } = require("../../util.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help2")
    .setDescription("show all command form this bot")
    .toJSON(),
  deleted: true,
  devOnly: false,
  modOnly: false,
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    try {
      const commandFolders = getAllFiles(path.join(__dirname, ".."), true);
      const helpEmbeds = [];

      for (const commandKategori of commandFolders) {
        const cmdKategori = getAllFiles(commandKategori);
        const categoryEmbeds = new EmbedBuilder()
          .setTitle(commandKategori.split("/").pop())
          .setTimestamp()
          .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
          .setFooter({
            iconURL: `${client.user.displayAvatarURL({
              dynamic: true,
            })}`,
            text: `${client.user.username} - All Commands`,
          })
          .setColor("#cfd453");
        const subCommands = [];
        let count = 0;

        for (const commandFile of cmdKategori) {
          const cmdObject = require(commandFile);
          if (cmdObject.deleted) continue;

          const description = `${
            cmdObject.data.description || "no description provided"
          }`;

          if (
            ["SUB_COMMAND", "SUB_COMMAND_GROUP"].includes(cmdObject.data.type)
          )
            subCommands.push(cmdObject);
          else
            categoryEmbeds.addFields({
              name: `/${cmdObject.data.name}`,
              value: `${description}`,
            });
          count++;
        }

        if (subCommands.length > 0) {
          categoryEmbeds.addFields({
            name: "Sub Command",
            value: subCommands.map((sub) => `/${sub.data.name}`).join("\n\n"),
          });
        }
        if (count > 0) helpEmbeds.push(categoryEmbeds);
      }
      await buttonPaginator(interaction, helpEmbeds);
    } catch (e) {
      Logger.error(`from commands/help.js :\n${e.stack}`);
    }
  },
};
