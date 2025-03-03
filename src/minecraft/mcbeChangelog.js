const { Logger } = require("../util.js");
const htmlParser = require("node-html-parser");
const Config = require("../config.json");
const Utils = require("../mc.js");
const articleSections = {
  BedrockPreview: 360001185332,
  BedrockRelease: 360001186971,
  JavaSnapshot: 360002267532,
};
const mcChangelogSch = require("../schemas/mcChangelogSch.js");

module.exports = async (client) => {
  fetch(
    "https://feedback.minecraft.net/api/v2/help_center/en-us/articles.json",
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  )
    .then((res) => res.json())
    .then(async (data) => {
      try {
        const latestBedrockPreview = data.articles.find(
          (a) => a.section_id == articleSections.BedrockPreview,
        );
        const bedrockPreviews = await mcChangelogSch.findOne({
          type: "preview-articles",
          "article.id": latestBedrockPreview?.id || 10000000,
        });

        if (latestBedrockPreview && !bedrockPreviews) {
          const article = Utils.formatArticle(latestBedrockPreview);
          const name = Utils.getVersion(latestBedrockPreview.name);
          const version = Utils.getMCVersion(latestBedrockPreview.name);
          const thumbnail = Utils.extractImage(latestBedrockPreview.body);

          Utils.Logger.release(
            latestBedrockPreview.updated_at,
            latestBedrockPreview.name,
          );
          article.type = "preview-articles";
          Logger.debug(article);
          if (!article.version) return;
          createPost(
            client,
            article,
            name,
            version,
            thumbnail,
            Config.tags.Preview,
            articleSections.BedrockPreview,
          );

          await mcChangelogSch.create(article);
          await new Promise((res) => setTimeout(() => res(), 1500));
        }

        const latestBedrockStable = data.articles.find(
          (a) =>
            a.section_id == articleSections.BedrockRelease &&
            !a.title.includes("Java Edition"),
        );
        const bedrockReleases = await mcChangelogSch.findOne({
          type: "stable-articles",
          "article.id": latestBedrockStable?.id || 10000000,
        });

        if (latestBedrockStable && !bedrockReleases) {
          const article = Utils.formatArticle(latestBedrockStable);
          const name = Utils.getVersion(latestBedrockStable.name);
          const version = Utils.getMCVersion(latestBedrockStable.name);
          const thumbnail = Utils.extractImage(latestBedrockStable.body);
          const isHotfix =
            latestBedrockStable.body.includes(
              "A new update has been released to address some issues that were introduced",
            ) ||
            latestBedrockStable.body.includes(
              "A new update has been released for",
            ) ||
            (latestBedrockStable.body.includes(
              "A new update has been released for",
            ) &&
              latestBedrockStable.body.includes("only to address a top crash"));

          Utils.Logger.release(
            latestBedrockStable.updated_at,
            latestBedrockStable.name,
          );
          article.type = "stable-articles";
          Logger.debug(article);
          if (!article.version) return;
          createPost(
            client,
            article,
            name,
            version,
            thumbnail,
            Config.tags.Stable,
            articleSections.BedrockRelease,
            isHotfix,
          );

          article.type = "stable-articles";
          await mcChangelogSch.create(article);
          await new Promise((res) => setTimeout(() => res(), 1500));
        }
      } catch (e) {
        Utils.Logger.error(e);
      }
    })
    .catch(() => {});
};

const createPost = (
  client,
  article,
  name,
  version,
  thumbnail,
  tag,
  articleSection,
  isHotfix = false,
) => {
  const embed = Utils.createEmbed(article, thumbnail, articleSection);
  const forumChannel = client.channels.cache.get(Config.bedrockChannel);
  forumChannel.threads
    .create({
      name:
        name +
        " - " +
        (articleSection == articleSections.BedrockPreview
          ? "Preview"
          : isHotfix
            ? "Hotfix"
            : "Stable"),
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
          articleSection == articleSections.BedrockPreview
            ? "🍌"
            : isHotfix
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
        name +
          " - " +
          (articleSection == articleSections.BedrockPreview
            ? "Preview"
            : isHotfix
              ? "Hotfix"
              : "Stable"),
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
            isHotfix,
          ),
        5000,
      );
    });
};
