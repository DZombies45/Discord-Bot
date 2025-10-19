const { PermissionFlagsBits } = require("discord.js");
const { Logger } = require("../util.js");
const articleSections = {
  BedrockPreview: 360001185332,
  BedrockRelease: 360001186971,
  JavaSnapshot: 360002267532,
};
const mcChangelogSch = require("../schemas/mcChangelogSch.js");

module.exports = {
  commandName: "changelog",
  userPermissions: [],
  run: async (client, interaction) => {
    const focusedOption = interaction?.options?.getFocused(true) ?? {
      name: "version",
      value: "",
    };
    const subCmd = interaction.options.getSubcommand();

    if (focusedOption.name !== "version")
      return interaction
        .respond([])
        .catch((err) =>
          Logger.error(`from autocomplete/changelog.js :\n${err.stack}`),
        );
    let versi;
    switch (subCmd) {
      case "bedrock-stable":
        versi = await mcChangelogSch.find(
          { type: "stable-articles" },
          { version: 1, "article.created_at": 1 },
        );
        break;
      case "bedrock-beta":
        versi = await mcChangelogSch.find(
          { type: "preview-articles" },
          { version: 1, "article.created_at": 1 },
        );
        break;
      case "java-stable":
        versi = await mcChangelogSch.find(
          { type: "java-stable-articles" },
          { version: 1, "article.created_at": 1 },
        );
        break;
      case "java-snapshot":
        versi = await mcChangelogSch.find(
          { type: "java-snapshot-articles" },
          { version: 1, "article.created_at": 1 },
        );
        break;

      default:
        versi = [];
    }
    const value = focusedOption.value.toLowerCase();
    versi.sort((b, c) => {
      return (
        Date.parse(c.article.created_at) - Date.parse(b.article.created_at)
      );
    });
    const fokus = versi.filter(
      (v) =>
        v.version.toLowerCase().includes(value) ||
        v.version.toLowerCase().startsWith(value),
    );
    const result = fokus.map((x) => {
      return {
        name: x.version,
        value: x.version,
      };
    });
    interaction
      .respond(result.slice(0, 25))
      .catch((err) =>
        Logger.error(`from autocomplete/changelog.js:\n${err.stack}`),
      );
  },
};
