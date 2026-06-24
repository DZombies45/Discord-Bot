import htmlParser from "node-html-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import changelogSch from "./schemas/mcChangelogSch.js";
const articleSections = {
  BedrockPreview: 360001185332,
  BedrockRelease: 360001186971,
  JavaSnapshot: 360002267532,
};

import { Logger } from "./util.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const formatDate = (d = Date.now()) => {
  const date = new Date(d);
  const [month, day, year] = date.toLocaleDateString().split("/");
  const time = date.toLocaleTimeString();
  return `${year}-${month}-${day} ${time}`;
};

const Utils = {
  Logger,
  exist: async (data) => {
    const hasil = changelogSch.findOne({ version: data.versiom });
    return hasil !== null;
  },
  getSavedDatas: async (data, articleSection) => {
    const article =
      articleSection == articleSections.BedrockPreview
        ? "preview-articles"
        : "stable-articles";
    return await changelogSch.find({ type: article });
  },
  getSavedData: async (data, articleSection) => {
    if (!fs.existsSync(__dirname + "/data")) {
      fs.mkdirSync(__dirname + "/data");
    }

    const article =
      articleSection == articleSections.BedrockPreview
        ? "preview-articles"
        : "stable-articles";

    if (!fs.existsSync(`${__dirname}/data/${article}.json`)) {
      fs.writeFile(
        `${__dirname}/data/${article}.json`,
        JSON.stringify(data, null, 4),
        () => {},
      );

      return data;
    } else {
      return JSON.parse(fs.readFileSync(`${__dirname}/data/${article}.json`));
    }
  },
  getSavedDataJava: async (data, articleSection) => {
    if (!fs.existsSync(__dirname + "/data")) {
      fs.mkdirSync(__dirname + "/data");
    }

    const article =
      articleSection == articleSections.JavaSnapshot
        ? "java-snapshot-articles"
        : "java-stable-articles";

    if (!fs.existsSync(`${__dirname}/data/${article}.json`)) {
      fs.writeFile(
        `${__dirname}/data/${article}.json`,
        JSON.stringify(data, null, 4),
        () => {},
      );

      return data;
    } else {
      return JSON.parse(fs.readFileSync(`${__dirname}/data/${article}.json`));
    }
  },
  getVersion: (v) => {
    return v
      .replace("Minecraft Beta & Preview - ", "")
      .replace("Minecraft - ", "")
      .replace(" (Bedrock)", "")
      .replace("Minecraft: Java Edition - ", "")
      .replace("Minecraft Java Edition - ", "")
      .replace(/(Release Candidate|Pre-Release) \d*/gi, "");
  },
  getMCVersion: (v) => {
    return v
      .replace(
        /(Minecraft|Beta & Preview|Snapshot|Release Candidate|Pre-Release|bedrock|java|edition|\:|\-|\(|\))/gi,
        "",
      )
      .trim()
      .replace("  ", "-");

    //         try {
    //             return new RegExp("\\b\\d+\\.\\d+\\.\\d+\\b", "gm").exec(v);
    //         } catch {
    //             return Utils.getVersion(v);
    //         }
  },
  extractImage: (body) => {
    const parsed = htmlParser.parse(body);
    const imageSrc = parsed.getElementsByTagName("img")[0]?.getAttribute("src");
    const image = imageSrc?.startsWith(
      "https://feedback.minecraft.net/hc/article_attachments/",
    )
      ? imageSrc
      : null;

    return image;
  },
  formatArticle: (a) => {
    return {
      version: Utils.getMCVersion(a.name),
      thumbnail: Utils.extractImage(a.body),
      article: {
        id: a.id,
        url: "https://feedback.minecraft.net/hc/en-us/articles/" + a.id,
        title: a.title,
        created_at: a.created_at,
        updated_at: a.updated_at,
        edited_at: a.edited_at,
      },
    };
  },
  createEmbed: (article, image, articleSection) => {
    return {
      title: article.article.title,
      url: article.article.url,
      color:
        articleSection == articleSections.BedrockPreview ? 0xffcc00 : 0x46ff27,
      description:
        ">>> " +
        (articleSection == articleSections.BedrockPreview
          ? "It's that day of the week!\nA new Minecraft: Bedrock Edition Preview is out now!"
          : "A new stable release of Minecraft: Bedrock Edition is out now!"),
      author: {
        name:
          articleSection == articleSections.BedrockPreview
            ? "Beta and Preview Changelogs"
            : "Release Changelogs",
        url:
          articleSection == articleSections.BedrockPreview
            ? "https://feedback.minecraft.net/hc/en-us/sections/360001185332-Beta-and-Preview-Information-and-Changelogs"
            : "https://feedback.minecraft.net/hc/en-us/sections/360001186971-Release-Changelogs",
        icon_url:
          "https://cdn.jsdelivr.net/gh/DZombies45/img-assets@main/mc/mc.png",
      },
      thumbnail: {
        url:
          articleSection == articleSections.BedrockPrevie
            ? "https://cdn.jsdelivr.net/gh/DZombies45/img-assets@main/mc/Bedrock_Preview.png"
            : "https://cdn.jsdelivr.net/gh/DZombies45/img-assets@main/mc/Bedrock_Icon_Change.png",
        w,
      },
      image: image ? { url: image } : undefined,
      footer: { text: "Posted on" },
      timestamp: article.article.updated_at,
    };
  },
  createJavaEmbed: (article, image, articleSection) => {
    return {
      title: article.article.title,
      url: article.article.url,
      color:
        articleSection == articleSections.JavaSnapshot ? 0xffcc00 : 0x46ff27,
      description:
        ">>> " +
        (articleSection == articleSections.JavaSnapshot
          ? "It's that day of the week!\nA new Minecraft Java Snapshot is out now!"
          : "A new stable release of Minecraft Java is out now!"),
      author: {
        name:
          articleSection == articleSections.JavaSnapshot
            ? "Snapshot Changelogs"
            : "Release Changelogs",
        url:
          articleSection == articleSections.JavaSnapshot
            ? "https://feedback.minecraft.net/hc/en-us/sections/360002267532-Snapshot-Information-and-Changelogs"
            : "https://feedback.minecraft.net/hc/en-us/sections/360001186971-Release-Changelogs",
        icon_url:
          "https://cdn.jsdelivr.net/gh/DZombies45/img-assets@main/mc/mc.png",
      },
      thumbnail: {
        url:
          articleSection == articleSections.JavaSnapsho
            ? "https://cdn.jsdelivr.net/gh/DZombies45/img-assets@main/mc/Java_Snapshot_Change.png"
            : "https://cdn.jsdelivr.net/gh/DZombies45/img-assets@main/mc/Java_Edition_Icon.png",
        t,
      },
      image: image ? { url: image } : undefined,
      footer: { text: "Posted on" },
      timestamp: article.article.updated_at,
    };
  },
  ping: (channel, javaOrBedrock, title, post) => {
    const pings = JSON.parse(fs.readFileSync(__dirname + "/pings.json"));
    channel
      .send({
        content:
          `## ${title} \n` +
          pings[javaOrBedrock].map((p) => `<@&${p}>`).join(" ") +
          " - " +
          `${post}`,
      })
      .then((msg) => {
        Logger.log("Successfully pinged everyone!");

        // msg.delete()
        //                     .then(() =>
        //                         Logger.success("Successfully deleted the ping message!")
        //                     )
        //                     .catch(() =>
        //                         Logger.error("Failed to delete the ping message :<")
        //                     );
      })
      .catch(() => Logger.error("Failed to send the ping message :<"));
  },
};

export { Utils };
