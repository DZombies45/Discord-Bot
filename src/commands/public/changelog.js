import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Utils } from "../../mc.js";
import Config from "../../config.json" with { type: "json" };
const articleSections = {
  BedrockPreview: 360001185332,
  BedrockRelease: 360001186971,
  JavaSnapshot: 360002267532,
};
import mcChangelogSch from "../../schemas/mcChangelogSch.js";

export default {
  data: new SlashCommandBuilder()
    .setName("changelog")
    .setDescription("get minecraft version changelog url")
    .addSubcommand((sub) =>
      sub
        .setName("bedrock-stable")
        .setDescription("get minecraft bedrock stable/release changelog")
        .addStringOption((option) =>
          option
            .setName("version")
            .setDescription("version you want to get")
            .setRequired(true)
            .setAutocomplete(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("bedrock-beta")
        .setDescription("get minecraft bedrock beta/preview changelog")
        .addStringOption((option) =>
          option
            .setName("version")
            .setDescription("version you want to get")
            .setRequired(true)
            .setAutocomplete(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("java-stable")
        .setDescription("get minecraft java stable/release changelog")
        .addStringOption((option) =>
          option
            .setName("version")
            .setDescription("version you want to get")
            .setRequired(true)
            .setAutocomplete(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("java-snapshot")
        .setDescription("get minecraft java snapshot changelog")
        .addStringOption((option) =>
          option
            .setName("version")
            .setDescription("version you want to get")
            .setRequired(true)
            .setAutocomplete(true),
        ),
    )
    .toJSON(),
  deleted: false,
  devOnly: false,
  modOnly: false,
  userPermissions: [],
  botPermissions: [],
  run: (client, interaction) => {
    const { options, guildId, guild } = interaction;

    if (["bedrock-beta", "bedrock-stable"].includes(options.getSubcommand()))
      return bedrockChangelog(client, interaction);
    if (["java-snapshot", "java-stable"].includes(options.getSubcommand()))
      return javaChangelog(client, interaction);
    interaction.reply("unknown command");
    setTimeout(function () {
      interaction.message.delete();
    }, 2000);
  },
};

async function bedrockChangelog(client, interaction) {
  try {
    const version = interaction.options.getString("version");
    const isBeta = interaction.options.getSubcommand() == "bedrock-beta";
    Utils.Logger.debug(
      interaction.user.tag +
        " (" +
        interaction.user.id +
        ") requested the changelog for v" +
        version,
    );

    const _m = await interaction.deferReply({});

    const article = await mcChangelogSch.findOne({
      type: isBeta ? "preview-articles" : "stable-articles",
      version: version,
    });
    if (!article) {
      interaction.editReply({
        content:
          "> Failed to find the changelog for version: **" + version + "**.",
      });
      setTimeout(function () {
        _m.delete();
      }, 5000);
      return;
    }

    const message = await interaction.editReply({
      embeds: [
        {
          title: article.article.title,
          url: article.article.url,
          color: isBeta ? 0xffcc00 : 0x46ff27,
          description: `>>> **Changelog created on**: <t:${
            new Date(article.article.created_at).getTime() / 1000
          }:f> (<t:${
            new Date(article.article.created_at).getTime() / 1000
          }:R>)`,
          author: {
            name: isBeta ? "Beta and Preview Changelogs" : "Release Changelogs",
            url: isBeta
              ? "https://feedback.minecraft.net/hc/en-us/sections/360001185332-Beta-and-Preview-Information-and-Changelogs"
              : "https://feedback.minecraft.net/hc/en-us/sections/360001186971-Release-Changelogs",
            icon_url:
              "https://cdn.jsdelivr.net/gh/DZombies45/img-assets@main/mc/mc.png",
          },
          thumbnail: {
            url: isBeta
              ? "https://cdn.jsdelivr.net/gh/DZombies45/img-assets@main/mc/Bedrock_Preview.png"
              : "https://cdn.jsdelivr.net/gh/DZombies45/img-assets@main/mc/Bedrock_Icon_Change.png",
          },
          image: {
            url: article.thumbnail,
          },
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5,
              label: "Changelog",
              url: article.article.url,
              emoji: {
                id: "1090311574423609416",
                name: "changelog",
              },
            },
          ],
        },
      ],
    });

    await message.react("🚫");
    const collector = message.createReactionCollector({
      filter: (reaction, user) =>
        reaction.emoji.name == "🚫" && user.id == interaction.user.id,
      time: 10 * 1000,
    });

    collector.on("collect", () => message.delete());
    collector.on("end", (collected, reason) => {
      const reaction = message.reactions.resolve("🚫");
      reaction.users.remove(client.user.id).catch(() => {});
    });
  } catch {
    async (err) => {
      const _m = await interaction.reply("thare is an error");
      setTimeout(function () {
        _m.delete();
      }, 5000);
      Utils.Logger.error(err);
    };
  }
}

async function javaChangelog(client, interaction) {
  try {
    const version = interaction.options.getString("version");
    const isBeta = interaction.options.getSubcommand() == "java-snapshot";
    Utils.Logger.debug(
      interaction.user.tag +
        " (" +
        interaction.user.id +
        ") requested the changelog for v" +
        version,
    );

    const _m = await interaction.deferReply({});

    const article = await mcChangelogSch.findOne({
      type: isBeta ? "java-snapshot-articles" : "java-stable-articles",
      version: version,
    });
    if (!article) {
      interaction.editReply({
        content:
          "> Failed to find the changelog for version: **" + version + "**.",
      });
      setTimeout(function () {
        _m.delete();
      }, 5000);
      return;
    }

    const message = await interaction.editReply({
      embeds: [
        {
          title: article.article.title,
          url: article.article.url,
          color: isBeta ? 0xffcc00 : 0x46ff27,
          description: `>>> **Changelog created on**: <t:${
            new Date(article.article.created_at).getTime() / 1000
          }:f> (<t:${
            new Date(article.article.created_at).getTime() / 1000
          }:R>)`,
          author: {
            name: isBeta
              ? "Snapshot and Pre-Release Changelogs"
              : "Release Changelogs",
            url: isBeta
              ? "https://feedback.minecraft.net/hc/en-us/sections/360002267532-Snapshot-Information-and-Changelogs"
              : "https://feedback.minecraft.net/hc/en-us/sections/360001186971-Release-Changelogs",
            icon_url:
              "https://cdn.jsdelivr.net/gh/DZombies45/img-assets@main/mc/mc.png",
          },
          thumbnail: {
            url: isBeta
              ? "https://cdn.jsdelivr.net/gh/DZombies45/img-assets@main/mc/Java_Snapshot_Change.png"
              : "https://cdn.jsdelivr.net/gh/DZombies45/img-assets@main/mc/Java_Edition_Icon.png",
          },
          image: {
            url: article.thumbnail,
          },
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5,
              label: "Changelog",
              url: article.article.url,
              emoji: {
                id: "1090311574423609416",
                name: "changelog",
              },
            },
          ],
        },
      ],
    });

    await message.react("🚫");
    const collector = message.createReactionCollector({
      filter: (reaction, user) =>
        reaction.emoji.name == "🚫" && user.id == interaction.user.id,
      time: 10 * 1000,
    });

    collector.on("collect", () => message.delete());
    collector.on("end", (collected, reason) => {
      const reaction = message.reactions.resolve("🚫");
      reaction.users.remove(client.user.id).catch(() => {});
    });
  } catch {
    async (err) => {
      const _m = await interaction.reply("thare is an error");
      setTimeout(function () {
        _m.delete();
      }, 5000);
      Utils.Logger.error(err.stack);
    };
  }
}
