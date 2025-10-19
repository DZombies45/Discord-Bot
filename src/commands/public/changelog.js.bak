const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const Utils = require("../../mc.js");
const Config = require("../../config.json");
const articleSections = {
  BedrockPreview: 360001185332,
  BedrockRelease: 360001186971,
  JavaSnapshot: 360002267532,
};
const mcChangelogSch = require("../../schemas/mcChangelogSch.js");

module.exports = {
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

    const _m = await interaction.deferReply({ });

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
              "https://cdn.discordapp.com/attachments/1071081145149689857/1071089941985112064/Mojang.png",
          },
          thumbnail: {
            url: isBeta
              ? "https://cdn.discordapp.com/attachments/1046721681445638224/1207903467985838100/Bedrock_Preview.png?ex=65e156c4&is=65cee1c4&hm=ee26deb34947aac40187676b768425000dc4513a847ae9e7dd70ac63af476121&"
              : "https://cdn.discordapp.com/attachments/1046721681445638224/1207903467654479904/Bedrock_Icon_Change.png?ex=65e156c4&is=65cee1c4&hm=279acda4fe0b7e9c400acc2a1cef6ad4c3ac485cc3bde7c71aa587c713d8af54&",
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

    const _m = await interaction.deferReply({  });

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
              "https://cdn.discordapp.com/attachments/1071081145149689857/1071089941985112064/Mojang.png",
          },
          thumbnail: {
            url: isBeta
              ? "https://cdn.discordapp.com/attachments/1046721681445638224/1207903468673826876/Java_Snapshot_Change.png?ex=65e156c4&is=65cee1c4&hm=d4c6d72126bdade024ff4c11ff6ee66df485ffca3ef0a78904c07f11177c0bde&"
              : "https://cdn.discordapp.com/attachments/1046721681445638224/1207903468367388772/Java_Edition_Icon.png?ex=65e156c4&is=65cee1c4&hm=a88895560d82955edcb2fe750e22d14debaf893ac5af3f09458ba894c87b5ca8&",
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
