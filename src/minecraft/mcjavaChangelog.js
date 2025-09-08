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
        const latestJavaSnapshot = data.articles.find(
          (a) => a.section_id == articleSections.JavaSnapshot,
        );
        const bedrockPreviews = await mcChangelogSch.findOne({
          type: "java-snapshot-articles",
          "article.id": latestJavaSnapshot?.id || 10000000,
        });

        if (latestJavaSnapshot && !bedrockPreviews) {
          const article = Utils.formatArticle(latestJavaSnapshot);
          const name = Utils.getVersion(latestJavaSnapshot.name);
          const version = Utils.getMCVersion(latestJavaSnapshot.name);
          const thumbnail = Utils.extractImage(latestJavaSnapshot.body);

          Logger.release(
            latestJavaSnapshot.updated_at,
            latestJavaSnapshot.name,
          );
          article.type = "java-snapshot-articles";
          Logger.debug(article);
          if (!article.version) return;
          createPost(
            client,
            article,
            name,
            version,
            thumbnail,
            Config.javaTags.Snapshot,
            articleSections.JavaSnapshot,
            latestJavaSnapshot?.name?.match(
              /(Release Candidate|Pre-Release) \d*/gi,
            )?.[0] || false,
          );

          await mcChangelogSch.create(article);
          await new Promise((res) => setTimeout(() => res(), 1500));
        }

        const latestBedrockStable = data.articles.find(
          (a) =>
            a.section_id == articleSections.BedrockRelease &&
            a.title.includes("Java Edition"),
        );
        const bedrockReleases = await mcChangelogSch.findOne({
          type: "java-stable-articles",
          "article.id": latestBedrockStable?.id || 10000000,
        });

        if (latestBedrockStable && !bedrockReleases) {
          const article = Utils.formatArticle(latestBedrockStable);
          const name = Utils.getVersion(latestBedrockStable.name);
          const version = Utils.getMCVersion(latestBedrockStable.name);
          const thumbnail = Utils.extractImage(latestBedrockStable.body);

          Logger.release(
            latestBedrockStable.updated_at,
            latestBedrockStable.name,
          );
          article.type = "java-stable-articles";
          Logger.debug(article);
          if (!article.version) return;
          createPost(
            client,
            article,
            name,
            version,
            thumbnail,
            Config.javaTags.Stable,
            articleSections.BedrockRelease,
            "",
          );

          await mcChangelogSch.create(article);
          await new Promise((res) => setTimeout(() => res(), 1500));
        }
      } catch (e) {
        Utils.Logger.error(e.stack);
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
  isHotfix,
) => {
  const embed = Utils.createJavaEmbed(article, thumbnail, articleSection);
  const forumChannel = client.channels.cache.get(Config.javaChannel);
  forumChannel.threads
    .create({
      name:
        name +
        " - " +
        (articleSection == articleSections.JavaSnapshot
          ? isHotfix
            ? isHotfix
            : "Snapshot"
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
        name +
          " - " +
          (articleSection == articleSections.JavaSnapshot
            ? isHotfix
              ? isHotfix
              : "Snapshot"
            : "Stable"),
        post,
      );
    })
    .catch((e) => {
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
