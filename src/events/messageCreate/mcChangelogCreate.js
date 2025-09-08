const { EmbedBuilder } = require("discord.js");
const bedrockCreate = require("../../minecraft/mcbeChangelog.js");
const javaCreate = require("../../minecraft/mcjavaChangelog.js");
const Utils = require("../../mc.js");
const Config = require("../../config.json");
const articleSections = {
  BedrockPreview: 360001185332,
  BedrockRelease: 360001186971,
  JavaSnapshot: 360002267532,
};
const mcChangelogSch = require("../../schemas/mcChangelogSch.js");
const htmlParser = require("node-html-parser");

module.exports = async (client, message) => {
  //if (!message.guild || message.author.id !== "1176044408139939850") return;
  if (message.author.id === client.user.id) return;
  if (!message.guild) return;
  if (
    message.channelId !== Config.bedrockNews &&
    message.channelId !== Config.javaNews
  )
    return;
  const contentArr = message.content.split("\n");
  const title = contentArr[0].replace(/#/g, "").trim();
  const link = contentArr[1].startsWith("https")
    ? contentArr[1]
    : "https://feedback.minecraft.net/temp";

  const version = new RegExp("\\b\\d+\\.\\d+\\.\\d+\\b", "gm").exec(
    contentArr[0],
  );

  switch (message.channelId) {
    case Config.bedrockNews:
      bedrockCreate(client);
      break;
    case Config.javaNews:
      javaCreate(client);
      break;

    default:
      Utils.Logger.error(message.channelId + " not match any");
  }

  //message.channel.send({ embeds: [embed] });
};

const postChangelog = async (client, title, thumbnail, url, bedrock) => {
  try {
    const versionType = title.split(" ");
    const version = versionType[1];
    const name = versionType[1];
    const date = new Date(Date.now());
    Utils.Logger.debug(versionType, version, name, date);

    let convertId = (string) => {
      var number = "";
      var length = string.length;
      for (var i = 0; i < length; i++)
        if (string[i].match(/(\d+)/)) number += string[i];
        else number += string.charCodeAt(i);
      return parseInt(number);
    };

    let article = {
      type: "unkown",
      version: version,
      thumbnail: thumbnail || null,
      article: {
        id: convertId(version),
        url: url,
        title: title,
        created_at: date,
        updated_at: date,
        edited_at: date,
      },
    };

    if (bedrock) {
      if (versionType[0] === "Bedrock") {
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
        versionType[0] === "Bedrock" ? Config.tags.Stable : Config.tags.Preview,
        versionType[0] === "Bedrock"
          ? articleSections.BedrockRelease
          : articleSections.BedrockPreview,
        versionType[0] === "Bedrock" ? "Stable" : "Preview",
      );
    } else {
      if (
        versionType.some((value) => ["Java", "Hotfix", "Drop"].includes(value))
      ) {
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
      Utils.Logger.debug(article);
      await mcChangelogSch.create(article);
      createPostJava(
        client,
        article,
        name,
        version,
        thumbnail,
        versionType[0] === "Java" && versionType.length === 2
          ? Config.javaTags.Stable
          : Config.javaTags.Snapshot,
        versionType[0] === "Java" && versionType.length === 2
          ? articleSections.BedrockRelease
          : articleSections.JavaSnapshot,
        versionType.length > 2
          ? versionType.slice(2).join(" ")
          : versionType[0] === "Java"
            ? "Stable"
            : "Snapshot",
      );
    }
  } catch (e) {
    Utils.Logger.error(e);
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
          versionType[0] === "Stable"
            ? "🍌"
            : versionType[0] === "Hotfix"
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
          createPostBedrock(
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
          createPostJava(
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
