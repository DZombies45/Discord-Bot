const htmlParser = require("node-html-parser");
const fs = require("fs");
const changelogSch = require("./schemas/mcChangelogSch.js");
const articleSections = {
  BedrockPreview: 360001185332,
  BedrockRelease: 360001186971,
  JavaSnapshot: 360002267532,
};

const formatDate = (d = Date.now()) => {
  const date = new Date(d);
  const [month, day, year] = date.toLocaleDateString().split("/");
  const time = date.toLocaleTimeString();
  return `${year}-${month}-${day} ${time}`;
};

const { startDate } = require("../index.js");

const Logger = {
  _log: (name, date, color, ...data) => {
    console.log(
      "\x1B[0m[" +
        formatDate(date) +
        "] \x1B[" +
        color +
        "m\x1B[1m[" +
        name.toUpperCase() +
        "] \x1B[0m-",
      ...data,
    );
  },
  log: (...data) => Logger._log("info", Date.now(), 33, ...data),
  debug: (...data) => Logger._log("debug", Date.now(), 33, ...data),
  warn: (...data) => Logger._log("warning", Date.now(), 33, ...data),
  success: (...data) => Logger._log("success", Date.now(), 32, ...data),
  release: (releaseDate, ...data) =>
    Logger._log("release", releaseDate, 32, ...data),
  error: (...data) => Logger._log("errror", Date.now(), 31, ...data),
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
          "https://cdn.discordapp.com/attachments/1071081145149689857/1071089941985112064/Mojang.png",
      },
      thumbnail: {
        url:
          articleSection == articleSections.BedrockPreview
            ? "https://cdn.discordapp.com/attachments/1046721681445638224/1207903467985838100/Bedrock_Preview.png?ex=65e156c4&is=65cee1c4&hm=ee26deb34947aac40187676b768425000dc4513a847ae9e7dd70ac63af476121&"
            : "https://cdn.discordapp.com/attachments/1046721681445638224/1207903467654479904/Bedrock_Icon_Change.png?ex=65e156c4&is=65cee1c4&hm=279acda4fe0b7e9c400acc2a1cef6ad4c3ac485cc3bde7c71aa587c713d8af54&",
      },
      image: { url: image },
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
          "https://cdn.discordapp.com/attachments/1071081145149689857/1071089941985112064/Mojang.png",
      },
      thumbnail: {
        url:
          articleSection == articleSections.JavaSnapshot
            ? "https://cdn.discordapp.com/attachments/1046721681445638224/1207903468673826876/Java_Snapshot_Change.png?ex=65e156c4&is=65cee1c4&hm=d4c6d72126bdade024ff4c11ff6ee66df485ffca3ef0a78904c07f11177c0bde&"
            : "https://cdn.discordapp.com/attachments/1046721681445638224/1207903468367388772/Java_Edition_Icon.png?ex=65e156c4&is=65cee1c4&hm=a88895560d82955edcb2fe750e22d14debaf893ac5af3f09458ba894c87b5ca8&",
      },
      image: { url: image },
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

module.exports = Utils;
