import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";
import { Utils } from "../mc.js";
import Config from "../config.json" with { type: "json" };
import mcChangelogSch from "../schemas/mcChangelogSch.js";
import { sendLog } from "../../log.js";

const articleSections = {
  BedrockPreview: 360001185332,
  BedrockRelease: 360001186971,
  JavaSnapshot: 360002267532,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectPlatform(lines) {
  const fullText = lines.join(" ").toLowerCase();
  if (
    fullText.includes("java") ||
    fullText.includes("snapshot") ||
    fullText.includes("pre-release") ||
    fullText.includes("release candidate") ||
    /\b\d{2}w\d{2}[a-z]\b/i.test(fullText)
  )
    return "java";
  if (
    fullText.includes("bedrock") ||
    fullText.includes("preview") ||
    fullText.includes("beta")
  )
    return "bedrock";
  return null; // ambiguous — will show modal
}

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
  } else if (/beta/i.test(text) || /preview/i.test(text)) {
    detectedType = "beta";
    detectedSubVersion = text.match(/beta\s*(\d+)/i)?.[1] ?? null;
  }

  const snapshotVersionMatch = text.match(/\b(\d{2}w\d{2}[a-z])\b/i);
  const numericVersionMatch = text.match(/(\d+(?:\.\d+)+)/i);
  const version = snapshotVersionMatch?.[1] ?? numericVersionMatch?.[1] ?? null;
  if (!version) return null;

  let formattedType = detectedType;
  if (detectedSubVersion) formattedType = `${detectedType}${detectedSubVersion}`;

  return {
    original: text.trim(),
    version,
    type: detectedType,
    subVersion: detectedSubVersion,
    formatted: `${version}-${formattedType}`,
  };
}

function buildArticle(messageArr, platform, parsedVersion, latestId) {
  const now = new Date().toISOString();
  const isJava = platform === "java";
  const isSnapshot =
    parsedVersion.type !== "stable" && parsedVersion.type !== "hotfix";

  const articleType = isJava
    ? isSnapshot
      ? "java-snapshot-articles"
      : "java-stable-articles"
    : isSnapshot
      ? "preview-articles"
      : "stable-articles";

  return {
    version: parsedVersion.formatted,
    thumbnail: undefined,
    type: articleType,
    article: {
      id: (latestId ?? 99999999) + 1,
      url:
        messageArr
          .find(
            (line) =>
              line.includes("https://www.minecraft.net") ||
              line.includes("https://feedback.minecraft.net"),
          )
          ?.replace(/^-#\s*/, "")
          .trim() ?? "",
      title: messageArr[0].replace(/^#+\s*/, "").trim(),
      created_at: now,
      updated_at: now,
      edited_at: now,
    },
  };
}

// ─── Create post (bedrock) ────────────────────────────────────────────────────

const createBedrockPost = (client, article, name, tag, articleSection, isHotfix, retryCount = 0) => {
  const embed = Utils.createEmbed(article, article.thumbnail, articleSection);
  const forumChannel = client.channels.cache.get(Config.bedrockChannel);
  const threadName =
    name +
    " - " +
    (articleSection === articleSections.BedrockPreview
      ? "Preview"
      : isHotfix
        ? "Hotfix"
        : "Stable");

  forumChannel.threads
    .create({
      name: threadName,
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
                url: article.article.url || "https://feedback.minecraft.net/",
                emoji: { id: "1090311574423609416", name: "changelog" },
              },
              {
                type: 2,
                style: 5,
                label: "Feedback",
                url: "https://feedback.minecraft.net/",
                emoji: { id: "1090311572024463380", name: "feedback" },
              },
            ],
          },
        ],
      },
    })
    .then((post) => {
      post.messages.cache
        .get(post.lastMessageId)
        ?.react(
          articleSection === articleSections.BedrockPreview
            ? "🍌"
            : isHotfix
              ? "🌶"
              : "🍊",
        );
      post.messages.cache
        .get(post.lastMessageId)
        ?.pin()
        .catch(() => post.send({ content: "> Failed to pin the message :<" }));

      Utils.ping(
        client.channels.cache.get(Config.bedrockNews),
        "bedrock",
        threadName,
        post,
      );
    })
    .catch((e) => {
      if (retryCount >= 5) {
        Utils.Logger.error("[CTM] Giving up on bedrock post after 5 retries:", e);
        sendLog(
          "❌ [CTM] Failed to create bedrock forum post after 5 retries",
          `Version: ${article.version}\nURL: ${article.article?.url}\n\n${e}`,
        );
        return;
      }
      setTimeout(
        () => createBedrockPost(client, article, name, tag, articleSection, isHotfix, retryCount + 1),
        5000,
      );
    });
};

// ─── Create post (java) ───────────────────────────────────────────────────────

const createJavaPost = (client, article, name, tag, articleSection, releaseLabel, retryCount = 0) => {
  const embed = Utils.createJavaEmbed(article, article.thumbnail, articleSection);
  const forumChannel = client.channels.cache.get(Config.javaChannel);
  const threadName =
    name +
    " - " +
    (articleSection === articleSections.JavaSnapshot
      ? releaseLabel || "Snapshot"
      : "Stable");

  forumChannel.threads
    .create({
      name: threadName,
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
                url: article.article.url || "https://feedback.minecraft.net/",
                emoji: { id: "1090311574423609416", name: "changelog" },
              },
              {
                type: 2,
                style: 5,
                label: "Feedback",
                url: "https://feedback.minecraft.net/",
                emoji: { id: "1090311572024463380", name: "feedback" },
              },
            ],
          },
        ],
      },
    })
    .then((post) => {
      post.messages.cache
        .get(post.lastMessageId)
        ?.react(articleSection === articleSections.JavaSnapshot ? "🍌" : "🍊");
      post.messages.cache
        .get(post.lastMessageId)
        ?.pin()
        .catch(() => post.send({ content: "> Failed to pin the message :<" }));

      Utils.ping(
        client.channels.cache.get(Config.javaNews),
        "java",
        threadName,
        post,
      );
    })
    .catch((e) => {
      if (retryCount >= 5) {
        Utils.Logger.error("[CTM] Giving up on java post after 5 retries:", e);
        sendLog(
          "❌ [CTM] Failed to create Java forum post after 5 retries",
          `Version: ${article.version}\nURL: ${article.article?.url}\n\n${e}`,
        );
        return;
      }
      setTimeout(
        () => createJavaPost(client, article, name, tag, articleSection, releaseLabel, retryCount + 1),
        5000,
      );
    });
};

// ─── Core post logic (called after platform is known) ────────────────────────

async function doPost(client, interaction, messageArr, platform) {
  const firstLine = messageArr[0];
  const parsed = parseVersionInfo(firstLine);

  if (!parsed) {
    await interaction.editReply({
      content: "❌ Tidak bisa mendeteksi versi dari baris pertama message. Pastikan baris pertama mengandung versi (contoh: `# Minecraft 1.21.4`).",
    });
    return;
  }

  const isJava = platform === "java";
  const isSnapshot = parsed.type !== "stable";

  // Grab latest ID from DB so our fake ID doesn't collide
  const latestDoc = await mcChangelogSch
    .findOne({ type: isJava ? (isSnapshot ? "java-snapshot-articles" : "java-stable-articles") : (isSnapshot ? "preview-articles" : "stable-articles") })
    .sort({ "article.id": -1 });

  const article = buildArticle(messageArr, platform, parsed, latestDoc?.article?.id);

  const name = Utils.getVersion(firstLine.replace(/^#+\s*/, "").trim());

  if (isJava) {
    const articleSection = isSnapshot
      ? articleSections.JavaSnapshot
      : articleSections.BedrockRelease;
    const tag = isSnapshot ? Config.javaTags.Snapshot : Config.javaTags.Stable;
    const releaseLabel = firstLine.match(/(Release Candidate|Pre-Release)\s*\d*/gi)?.[0] || null;

    await mcChangelogSch.create(article);
    createJavaPost(client, article, name, tag, articleSection, releaseLabel);
  } else {
    const isHotfix =
      messageArr.join(" ").includes("A new update has been released to address some issues") ||
      messageArr.join(" ").includes("A new update has been released for");
    const articleSection = isSnapshot
      ? articleSections.BedrockPreview
      : articleSections.BedrockRelease;
    const tag = isSnapshot ? Config.tags.Preview : Config.tags.Stable;

    await mcChangelogSch.create(article);
    createBedrockPost(client, article, name, tag, articleSection, isHotfix);
  }

  await interaction.editReply({
    content: `✅ Forum post sedang dibuat untuk **${article.article.title}** (${platform === "java" ? "Java" : "Bedrock"} · ${parsed.type})`,
  });
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default {
  data: new ContextMenuCommandBuilder()
    .setName("Post MC Changelog")
    .setType(ApplicationCommandType.Message),
  deleted: false,
  reload: false,
  devOnly: true,
  modOnly: false,
  userPermissions: [],
  botPermissions: [],

  run: async (client, interaction) => {
    const { targetMessage } = interaction;
    const content = targetMessage.content?.trim();

    if (!content) {
      return interaction.reply({
        content: "❌ Message kosong atau tidak punya text content.",
        flags: 64,
      });
    }

    const messageArr = content
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const platform = detectPlatform(messageArr);

    // Ambiguous: tanya manual via modal
    if (!platform) {
      const modal = new ModalBuilder()
        .setCustomId(`mcChangelogCTM:${targetMessage.id}`)
        .setTitle("Post MC Changelog")
        .setComponents(
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setCustomId("platform")
              .setLabel("Platform (java / bedrock)")
              .setPlaceholder("java atau bedrock")
              .setMinLength(4)
              .setMaxLength(7)
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
          ),
        );
      return interaction.showModal(modal);
    }

    // Platform terdeteksi — langsung proses
    await interaction.deferReply({ flags: 64 });
    await doPost(client, interaction, messageArr, platform);
  },
};

// ─── Modal submit handler ─────────────────────────────────────────────────────
// Daftarkan ini di event interactionCreate / modal handler kamu.
// customId format: mcChangelogCTM:<messageId>

export async function handleMcChangelogModal(client, interaction) {
  if (!interaction.isModalSubmit()) return;
  if (!interaction.customId.startsWith("mcChangelogCTM:")) return;

  const messageId = interaction.customId.split(":")[1];
  const platformRaw = interaction.fields.getTextInputValue("platform").toLowerCase().trim();

  if (platformRaw !== "java" && platformRaw !== "bedrock") {
    return interaction.reply({
      content: '❌ Platform harus `java` atau `bedrock`.',
      flags: 64,
    });
  }

  await interaction.deferReply({ flags: 64 });

  // Fetch message dari channel yang sama
  const message = await interaction.channel.messages
    .fetch(messageId)
    .catch(() => null);

  if (!message) {
    return interaction.editReply({ content: "❌ Message tidak ditemukan." });
  }

  const messageArr = message.content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  await doPost(client, interaction, messageArr, platformRaw);
}
