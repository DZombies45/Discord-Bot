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
        } else {
          const data = parseVersionInfo(messageArr[0]);
          const msg = messageArr.join("\n");
          const article = {
            version: Utils.getMCVersion(messageArr[0]),
            thumbnail: Utils.extractImage(msg),
            article: {
              id:
                data.type === "stable"
                  ? latestBedrockStable.id + 1
                  : latestJavaSnapshot.id + 1,
              url: messageArr[1],
              title: messageArr[0].replace("#", "").trim(),
              created_at: Date.now(),
              updated_at: Date.now(),
              edited_at: Date.now(),
            },
          };

          article.type =
            data.type === "stable"
              ? "java-stable-articles"
              : "java-snapshot-articles";
          const name = Utils.getVersion(messageArr[0]);
          const version = article.version;
          const thumbnail = article.thumbnail;
          // Logger.debug(article);
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
  // Regex yang lebih komprehensif untuk menangani berbagai format
  const versionRegex =
    /\b(?:beta|snapshot|rc)?\s*(\d+(?:\.\d+)*(?:\.\d+[a-z]?)?)\s*(beta|snapshot|rc)?(?:\s*(\d+))?\b/gi;

  const results = [];
  let match;

  while ((match = versionRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const version = match[1]; // Versi numerik
    let type = match[2] || "stable"; // Tipe atau 'stable'
    const subVersion = match[3]; // Angka tambahan (1, 2, 3, dll)

    // Cek tipe yang muncul sebelum versi
    if (!match[2]) {
      if (fullMatch.toLowerCase().includes("beta")) {
        type = "beta";
      } else if (fullMatch.toLowerCase().includes("snapshot")) {
        type = "snapshot";
      } else if (fullMatch.toLowerCase().includes("rc")) {
        type = "rc";
      }
    }

    // Clean up type
    type = type.toLowerCase().trim();

    // Format version dengan subVersion jika ada
    let formattedVersion = version;
    let formattedType = type;

    if (subVersion) {
      if (type === "rc") {
        formattedType = `rc${subVersion}`;
      } else if (type === "snapshot") {
        formattedType = `snapshot${subVersion}`;
      } else if (type === "beta") {
        formattedType = `beta${subVersion}`;
      }
    }

    results.push({
      original: fullMatch.trim(),
      version: version,
      type: type,
      subVersion: subVersion || null,
      formatted: `${formattedVersion}-${formattedType}`,
    });
  }

  return results;
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
