import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import path from "path";
import { fileURLToPath } from "url";
import { getAllFiles } from "../../utils/getAllFiles.js";
import { Logger } from "../../util.js"; // tetap kamu punya ini
// import { buttonPaginator } from "../../utils/buttonPaginator.js"; // kamu tidak pakai, bisa hapus

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const time = 60 * 1000;

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all commands from this bot")
    .toJSON(),

  deleted: false,
  devOnly: false,
  modOnly: false,
  userPermissions: [],
  botPermissions: [],

  run: async (client, interaction) => {
    const allCommands = {};

    const commandFolders = getAllFiles(path.join(__dirname, ".."), true);

    for (const commandFolder of commandFolders) {
      const commandFiles = getAllFiles(commandFolder);
      let cmds = [];

      for (const commandFile of commandFiles) {
        const { default: cmdObject } = await import(commandFile);

        if (cmdObject.deleted) continue;

        cmds.push(
          `> - /${cmdObject.data.name}\n\`\`\`${cmdObject.data.description || "no description provided"}\`\`\``,
        );
      }

      allCommands[path.basename(commandFolder)] = cmds.join("\n");
    }

    const embed = new EmbedBuilder()
      .setTitle("**HELP**")
      .setTimestamp()
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
        text: `${client.user.username} - All Commands`,
      })
      .setDescription(
        "Select a category from the dropdown menu to view commands",
      )
      .setColor("#cfd453");

    const dropdownOptions = Object.keys(allCommands).map((folder) => ({
      label: folder,
      value: folder,
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("category-select")
      .setPlaceholder("Select a category")
      .addOptions(dropdownOptions);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const msg = await interaction.reply({
      embeds: [embed],
      components: [row],
    });

    const filter = (i) =>
      i.isStringSelectMenu() && i.customId === "category-select";

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time,
    });

    let selectedCategory = Object.keys(allCommands)[0];

    function getEmbed() {
      return new EmbedBuilder()
        .setTitle(`${selectedCategory} Commands`)
        .setDescription(allCommands[selectedCategory] || "No commands found.")
        .setThumbnail(client.user.displayAvatarURL());
    }

    collector.on("collect", async (i) => {
      selectedCategory = i.values[0];
      await i.update({ embeds: [getEmbed()] });
      collector.resetTimer();
    });

    collector.on("end", async () => {
      await msg.edit({
        embeds: [getEmbed()],
        components: [],
      });
    });
  },
};
