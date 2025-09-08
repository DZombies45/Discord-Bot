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
const htmlParser = require("node-html-parser");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mc_changelog")
    .setDescription("[admin] run minecraft changelog command")
    .addSubcommand((sub) =>
      sub
        .setName("initiate")
        .setDescription(
          "[mod] initiate changelog data, only do this when starting new",
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("post_bedrock")
        .setDescription("[mod] Post bedrock changelog!")
        .addStringOption((option) =>
          option
            .setName("title")
            .setDescription("Title for the post")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("update_url")
            .setDescription("Url to the changelog")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("release")
            .setDescription("Release Version type")
            .setRequired(true)
            .setChoices(
              { name: "Stable", value: "Stable" },
              { name: "Hotfix", value: "Hotfix" },
              { name: "Preview", value: "Preview" },
            ),
        )
        .addStringOption((option) =>
          option
            .setName("thumbnail")
            .setDescription("Image url")
            .setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("post_java")
        .setDescription("[mod] Post java changelog!")
        .addStringOption((option) =>
          option
            .setName("title")
            .setDescription("Title for the post")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("update_url")
            .setDescription("Url to the changelog")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("release")
            .setDescription("Release Version type")
            .setRequired(true)
            .setChoices(
              { name: "Stable", value: "Stable" },
              { name: "Snapshot", value: "Snapshot" },
              {
                name: "Release Candidate",
                value: "Release Candidate",
              },
              { name: "Pre-Release", value: "Pre-Release" },
            ),
        )
        .addStringOption((option) =>
          option
            .setName("thumbnail")
            .setDescription("Image url")
            .setRequired(false),
        ),
    )
    .toJSON(),
  deleted: false,
  devOnly: true,
  modOnly: false,
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    const { options, guildId, guild } = interaction;
    const subCmd = options.getSubcommand();

    const embed = new EmbedBuilder().setFooter({
      iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
      text: `${client.user.username} - minecraft changelog`,
    });

    switch (subCmd) {
      case "initiate":
        makeChangelog(interaction);
        break;
      case "post_bedrock":
        postChangelog(client, interaction, true);
        break;
      case "post_java":
        postChangelog(client, interaction, false);
        break;

      default:
        interaction.reply({
          content: "unkown command",
          flags: 64,
        });
    }
  },
};

let stableArticles = [];
let previewArticles = [];
let javaStableArticles = [];
let javaSnapshotArticles = [];

const makeChangelog = async (interaction) => {
  await interaction.deferReply({ flags: 64 });
  console.log("making changelog");
  await interaction.editReply({
    content: "changelog >> searching...",
  });
  await fetch(
    "https://feedback.minecraft.net/api/v2/help_center/en-us/articles.json?per_page=100",
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  )
    .then((res) => res.json())
    .then(async (dataw) => {
      await interaction.editReply({
        content: "changelog >> formatting...",
      });
      for (let i = 1; i <= dataw.page_count; i++) {
        await fetch(
          "https://feedback.minecraft.net/api/v2/help_center/en-us/articles.json?per_page=100&page=" +
            i,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        )
          .then((res) => res.json())
          .then(async (data) => {
            const stable = data.articles
              .filter(
                (a) =>
                  a.section_id == articleSections.BedrockRelease &&
                  !a.title.includes("Java Edition"),
              )
              .map(Utils.formatArticle);
            const stableJava = data.articles
              .filter(
                (a) =>
                  a.section_id == articleSections.BedrockRelease &&
                  a.title.includes("Java Edition"),
              )
              .map(Utils.formatArticle);
            const preview = data.articles
              .filter((a) => a.section_id == articleSections.BedrockPreview)
              .map(Utils.formatArticle);
            const javaSnapshot = data.articles
              .filter((a) => a.section_id == articleSections.JavaSnapshot)
              .map(Utils.formatArticle);

            stableArticles = [...stableArticles, ...stable];
            javaStableArticles = [...javaStableArticles, ...stableJava];
            previewArticles = [...previewArticles, ...preview];
            javaSnapshotArticles = [...javaSnapshotArticles, ...javaSnapshot];
          });
      }
      await interaction.editReply({
        content: "changelog >> updating...",
      });
      //delete all data
      await mcChangelogSch.deleteMany({});
      console.log("saving");
      //save data
      await stableArticles.forEach(async (ar) => {
        ar.type = "stable-articles";
        await mcChangelogSch.create(ar);
      });
      await javaStableArticles.forEach(async (ar) => {
        ar.type = "java-stable-articles";
        await mcChangelogSch.create(ar);
      });
      await previewArticles.forEach(async (ar) => {
        ar.type = "preview-articles";
        await mcChangelogSch.create(ar);
      });
      await javaSnapshotArticles.forEach(async (ar) => {
        ar.type = "java-snapshot-articles";
        await mcChangelogSch.create(ar);
      });
    });
  console.log("changelog created");
  await interaction.editReply({
    content: "changelog initiated",
  });
};

const postChangelog = async (client, interaction, bedrock) => {
  await interaction.deferReply({ flags: 64 });
  try {
    const thumbnail = interaction.options.getString("thumbnail") || null;
    const title = interaction.options.getString("title");
    const version = Utils.getMCVersion(title);
    const name = Utils.getVersion(title);
    const versionType = interaction.options.getString("release");
    Utils.Logger.debug(
      interaction.user.tag +
        " (" +
        interaction.user.id +
        ") upload the changelog for v" +
        version,
    );

    let article = {
      type: "unkown",
      version: version,
      thumbnail: thumbnail,
      article: {
        id: 10000000,
        url: interaction.options.getString("update_url"),
        title: title,
        created_at: Date.now(),
        updated_at: Date.now(),
        edited_at: Date.now(),
      },
    };

    if (bedrock) {
      if (versionType === "Stable") {
        article.type = "stable-articles";
      } else {
        article.type = "preview-articles";
      }
      if (
        await mcChangelogSch.findOne({
          version: article.version,
          article: { type: article.type },
        })
      ) {
        throw new Error("**version already exsist**");
      }
      await mcChangelogSch.create(article);
      createPostBedrock(
        client,
        article,
        name,
        version,
        thumbnail,
        versionType === "Stable" ? Config.tags.Stable : Config.tags.Preview,
        versionType === "Stable"
          ? articleSections.BedrockRelease
          : articleSections.BedrockPreview,
        versionType,
      );
    } else {
      if (versionType === "Stable") {
        article.type = "java-stable-articles";
      } else {
        article.type = "java-snapshot-articles";
      }
      if (
        await mcChangelogSch.findOne({
          version: article.version,
          article: { type: article.type },
        })
      ) {
        throw new Error("**version already exsist**");
      }
      await mcChangelogSch.create(article);
      createPostJava(
        client,
        article,
        name,
        version,
        thumbnail,
        versionType === "Stable"
          ? Config.javaTags.Stable
          : Config.javaTags.Preview,
        versionType === "Stable"
          ? articleSections.BedrockRelease
          : articleSections.JavaSnapshot,
        versionType,
      );
    }

    await interaction.editReply({
      embeds: [
        {
          title: article.article.title,
          url: article.article.url,
          color: versionType !== "Stable" ? 0xffcc00 : 0x46ff27,
          description: `>>> **Changelog created on**: <t:${
            new Date(article.article.created_at).getTime() / 1000
          }:f> (<t:${
            new Date(article.article.created_at).getTime() / 1000
          }:R>)`,
          author: {
            name: versionType + "Changelogs",
            icon_url:
              "https://cdn.discordapp.com/attachments/1071081145149689857/1071089941985112064/Mojang.png",
          },
          thumbnail: {
            url:
              versionType !== "Stable"
                ? "https://cdn.discordapp.com/attachments/1071081145149689857/1093331067710226432/mcpreview.png"
                : "https://cdn.discordapp.com/attachments/1071081145149689857/1093331067425005578/mc.png",
          },
          image: {
            url: article.thumbnail,
          },
        },
      ],
    });
  } catch (e) {
    await interaction.editReply({
      embeds: [
        {
          title: "Failed to create changelog",
          color: "#c00b0b",
          author: {
            name: "Minecraft Changelogs bot",
            icon_url:
              "https://cdn.discordapp.com/attachments/1071081145149689857/1071089941985112064/Mojang.png",
          },
          description: e.startsWith("**") ? e : "",
        },
      ],
    });
  }
};

// post bedrock changelog
const createPostBedrock = (
  client,
  article,
  name,
  version,
  thumbnail,
  tag,
  articleSection,
  versionType,
) => {
  const embed = Utils.createEmbed(article, thumbnail, articleSection);
  const forumChannel = client.channels.cache.get(Config.bedrockChannel);
  forumChannel.threads
    .create({
      name: name + " - " + versionType,
      appliedTags: [tag],
      message: {
        embeds: [embed],
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
              {
                type: 2,
                style: 5,
                label: "Feedback",
                url: "https://feedback.minecraft.net/",
                emoji: {
                  id: "1090311572024463380",
                  name: "feedback",
                },
              },
            ],
          },
        ],
      },
    })
    .then((post) => {
      post.messages.cache
        .get(post.lastMessageId)
        .react(
          versionType === "Stable"
            ? "🍌"
            : versionType === "Hotfix"
              ? "🌶"
              : "🍊",
        );

      post.messages.cache
        .get(post.lastMessageId)
        .pin()
        .then(() =>
          Utils.Logger.success(
            "Successfully pinned the message for",
            article.version,
          ),
        )
        .catch(() => {
          Utils.Logger.error("Failed to pin the message for", article.version);
          post.send({ content: "> Failed to pin the message :<" });
        });

      Utils.ping(
        client.channels.cache.get(Config.bedrockNews),
        "bedrock",
        name + " - " + versionType,
        post,
      );
    })
    .catch((e) => {
      console.log(e);
      Utils.Logger.log(
        "Failed to create the forum post for",
        "v" + article.version + ", retrying...",
      );
      setTimeout(
        () =>
          createPost(
            client,
            article,
            name,
            version,
            thumbnail,
            tag,
            articleSection,
            versionType,
          ),
        5000,
      );
    });
};
// post java changelog
const createPostJava = (
  client,
  article,
  name,
  version,
  thumbnail,
  tag,
  articleSection,
  versionType,
) => {
  const embed = Utils.createJavaEmbed(article, thumbnail, articleSection);
  const forumChannel = client.channels.cache.get(Config.javaChannel);
  forumChannel.threads
    .create({
      name: name + " - " + versionType,
      appliedTags: [tag],
      message: {
        embeds: [embed],
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
              {
                type: 2,
                style: 5,
                label: "Feedback",
                url: "https://feedback.minecraft.net/",
                emoji: {
                  id: "1090311572024463380",
                  name: "feedback",
                },
              },
            ],
          },
        ],
      },
    })
    .then((post) => {
      post.messages.cache
        .get(post.lastMessageId)
        .react(articleSection == articleSections.JavaSnapshot ? "🍌" : "🍊");

      post.messages.cache
        .get(post.lastMessageId)
        .pin()
        .then(() =>
          Utils.Logger.success(
            "Successfully pinned the message for",
            article.version,
          ),
        )
        .catch(() => {
          Utils.Logger.error("Failed to pin the message for", article.version);
          post.send({ content: "> Failed to pin the message :<" });
        });

      Utils.ping(
        client.channels.cache.get(Config.javaNews),
        "java",
        name + " - " + versionType,
        post,
      );
    })
    .catch((e) => {
      console.log(e);
      Utils.Logger.log(
        "Failed to create the forum post for",
        "v" + article.version + ", retrying...",
      );
      setTimeout(
        () =>
          createPost(
            client,
            article,
            name,
            version,
            thumbnail,
            tag,
            articleSection,
            versionType,
          ),
        5000,
      );
    });
};
