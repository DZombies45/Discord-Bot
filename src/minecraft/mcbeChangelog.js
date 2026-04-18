import { Logger } from "../util.js";
import htmlParser from "node-html-parser";
import Config from "../config.json" with { type: "json" };
import { Utils } from "../mc.js";
const articleSections = {
  BedrockPreview: 360001185332,
  BedrockRelease: 360001186971,
  JavaSnapshot: 360002267532,
};
import mcChangelogSch from "../schemas/mcChangelogSch.js";
import { sendLog } from "../../log.js";

export default async (client, messageArr) => {
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

        const latestBedrockStable = data.articles.find(
          (a) =>
            a.section_id == articleSections.BedrockRelease &&
            !a.title.includes("Java Edition"),
        );
        const bedrockReleases = await mcChangelogSch.findOne({
          type: "stable-articles",
          "article.id": latestBedrockStable?.id || 10000000,
        });

        if (latestBedrockPreview && !bedrockPreviews) {
          const article = Utils.formatArticle(latestBedrockPreview);
          const name = Utils.getVersion(latestBedrockPreview.name);
          const version = Utils.getMCVersion(latestBedrockPreview.name);
          const thumbnail = Utils.extractImage(latestBedrockPreview.body);

          // Utils.Logger.release(
          //   latestBedrockPreview.updated_at,
          //   latestBedrockPreview.name,
          // );
          article.type = "preview-articles";
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
        } else if (latestBedrockStable && !bedrockReleases) {
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

          // Utils.Logger.release(
          //   latestBedrockStable.updated_at,
          //   latestBedrockStable.name,
          // );
          article.type = "stable-articles";
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

          await mcChangelogSch.create(article);
          await new Promise((res) => setTimeout(() => res(), 1500));
        } else {
          const data = parseVersionInfo(messageArr[0])[0];
          const now = new Date().toISOString();

          const articleType =
            data.type === "stable" ? "stable-articles" : "preview-articles";

          const article = {
            version: data.formatted,
            thumbnail: undefined,
            article: {
              id:
                data.type === "stable"
                  ? (latestBedrockStable?.id ?? 99999999) + 1
                  : (latestBedrockPreview?.id ?? 99999999) + 1,
              url:
                messageArr
                  .find(
                    (line) =>
                      line.includes("https://www.minecraft.net") ||
                      line.includes("https://feedback.minecraft.net"),
                  )
                  ?.replace(/^-#\s*/, "")
                  .trim() ?? "",
              title: messageArr[0].replace("#", "").trim(),
              created_at: now,
              updated_at: now,
              edited_at: now,
            },
          };

          const name = Utils.getVersion(messageArr[0]);
          const version = article.version;
          const thumbnail = article.thumbnail;

          const rawMsg = messageArr[0] ?? "";
          const isHotfix =
            rawMsg.includes(
              "A new update has been released to address some issues that were introduced",
            ) ||
            rawMsg.includes("A new update has been released for") ||
            (rawMsg.includes("A new update has been released for") &&
              rawMsg.includes("only to address a top crash"));

          article.type = articleType;
          // Logger.debug(article);
          if (!article.version) return;
          createPost(
            client,
            article,
            name,
            version,
            thumbnail,
            data.type === "stable" ? Config.tags.Stable : Config.tags.Preview,
            data.type === "stable"
              ? articleSections.BedrockRelease
              : articleSections.BedrockPreview,
            isHotfix,
          );

          await mcChangelogSch.create(article);
          await new Promise((res) => setTimeout(() => res(), 1500));
        }
      } catch (e) {
        Utils.Logger.error(e);
      }
    })
    .catch(() => {});
};

function parseVersionInfo(text) {
  let detectedType = "stable";
  let detectedSubVersion = null;

  const isJavaSnapshotFormat = /\b\d{2}w\d{2}[a-z]\b/i.test(text);

  if (/pre-release/i.test(text)) {
    detectedType = "pre-release";
    detectedSubVersion = text.match(/pre-release\s*(\d+)/i)?.[1] ?? null;
  } else if (/release candidate/i.test(text)) {
    detectedType = "rc";
    detectedSubVersion = text.match(/release candidate\s*(\d+)/i)?.[1] ?? null;
  } else if (/snapshot/i.test(text)) {
    detectedType = "snapshot";
    detectedSubVersion = isJavaSnapshotFormat
      ? null
      : (text.match(/snapshot\s+(\d+)/i)?.[1] ?? null);
  } else if (/beta/i.test(text)) {
    detectedType = "beta";
    detectedSubVersion = text.match(/beta\s*(\d+)/i)?.[1] ?? null;
  }

  const snapshotVersionMatch = text.match(/\b(\d{2}w\d{2}[a-z])\b/i);
  const numericVersionMatch = text.match(/(\d+(?:\.\d+)+)/i);

  const version = snapshotVersionMatch?.[1] ?? numericVersionMatch?.[1] ?? null;
  if (!version) return [];

  let formattedType = detectedType;
  if (detectedSubVersion) {
    formattedType = `${detectedType}${detectedSubVersion}`;
  }

  return [
    {
      original: text.trim(),
      version: version,
      type: detectedType,
      subVersion: detectedSubVersion,
      formatted: `${version}-${formattedType}`,
    },
  ];
}

const createPost = (
  client,
  article,
  name,
  version,
  thumbnail,
  tag,
  articleSection,
  isHotfix = false,
  retryCount = 0,
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
      if (retryCount >= 5) {
        Utils.Logger.error(
          "[Create Post] Giving up on forum post for",
          "v" + article.version + " after 5 retries.",
          "error: " + e,
        );
        sendLog(
          "❌ Failed to create bedrock forum post after 5 retries",
          `Version: ${article.version}\nType: ${article.type}\nURL: ${article.article?.url}\n\n${e}`,
        );
        return;
      }
      Utils.Logger.log(
        "[Create Post] Failed to create the forum post for",
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
            retryCount + 1,
          ),
        5000,
      );
    });
};
