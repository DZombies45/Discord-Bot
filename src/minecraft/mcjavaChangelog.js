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
        const latestJavaSnapshot = data.articles.find(
          (a) => a.section_id == articleSections.JavaSnapshot,
        );
        const bedrockPreviews = await mcChangelogSch.findOne({
          type: "java-snapshot-articles",
          "article.id": latestJavaSnapshot?.id || 10000000,
        });

        const latestBedrockStable = data.articles.find(
          (a) =>
            a.section_id == articleSections.BedrockRelease &&
            a.title.includes("Java Edition"),
        );
        const bedrockReleases = await mcChangelogSch.findOne({
          type: "java-stable-articles",
          "article.id": latestBedrockStable?.id || 10000000,
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
          // Logger.debug(article);
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
        } else if (latestBedrockStable && !bedrockReleases) {
          const article = Utils.formatArticle(latestBedrockStable);
          const name = Utils.getVersion(latestBedrockStable.name);
          const version = Utils.getMCVersion(latestBedrockStable.name);
          const thumbnail = Utils.extractImage(latestBedrockStable.body);

          Logger.release(
            latestBedrockStable.updated_at,
            latestBedrockStable.name,
          );
          article.type = "java-stable-articles";
          // Logger.debug(article);
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
        } else {
          const data = parseVersionInfo(messageArr[0])[0];
          const now = new Date().toISOString();
          const article = {
            version: data.formatted,
            thumbnail: undefined,
            article: {
              id:
                data.type === "stable"
                  ? (latestBedrockStable?.id ?? 99999999) + 1
                  : (latestJavaSnapshot?.id ?? 99999999) + 1,
              url:
                messageArr
                  .find((line) => line.includes("https://www.minecraft.net"))
                  ?.replace("-#", "")
                  .trim() ?? "",
              title: messageArr[0].replace("#", "").trim(),
              created_at: now,
              updated_at: now,
              edited_at: now,
            },
          };

          article.type =
            data.type === "stable"
              ? "java-stable-articles"
              : "java-snapshot-articles";
          const name = Utils.getVersion(messageArr[0].replace("#", "").trim());
          const version = article.version;
          const thumbnail = article.thumbnail;
          // Logger.debug(JSON.stringify(article));
          if (!article.version) return;

          createPost(
            client,
            article,
            name,
            version,
            thumbnail,
            data.type === "stable"
              ? Config.javaTags.Stable
              : Config.javaTags.Snapshot,
            data.type === "stable"
              ? articleSections.BedrockRelease
              : articleSections.JavaSnapshot,
            messageArr[0]?.match(
              /(Release Candidate|Pre-Release) \d*/gi,
            )?.[0] || false,
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
  isHotfix,
  retryCount = 0,
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
      if (retryCount >= 5) {
        Utils.Logger.error(
          "[Create Post] Giving up on forum post for",
          "v" + article.version + " after 5 retries.",
          "error: " + e,
        );
        sendLog(
          "❌ Failed to create Java forum post after 5 retries",
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
