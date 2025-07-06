const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const inboxPing = require("../../schemas/inboxSch.js");
const { chunkSubstr } = require("../../util.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inbox")
    .setDescription("open/clear mentioned inbox")
    .addSubcommand((sub) =>
      sub.setName("open").setDescription("open inbox message that mention you"),
    )
    .addSubcommand((sub) =>
      sub
        .setName("clear")
        .setDescription("clear a certain or all inbox")
        .addStringOption((opt) =>
          opt
            .setName("id")
            .setDescription("id from your inbox")
            .setRequired(true),
        ),
    )
    .toJSON(),
  deleted: false,
  devOnly: false,
  modOnly: false,
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    const { options, guildId, guild, user } = interaction;
    const subCmd = options.getSubcommand();
    if (!["open", "clear"].includes(subCmd)) return;
    let data = await inboxPing.find({ User: user.id });

    async function sendMsg(msg) {
      let embed = new EmbedBuilder().setColor("#3671e7").setDescription(msg);
      return await interaction.reply({
        embeds: [embed],
        flags: 64,
      });
    }

    switch (subCmd) {
      case "open":
        if (data.length === 0)
          return await sendMsg("no message mention found in inbox");
        let string = "📬**Inbox**";
        await data.forEach(async (value) => {
          string += `\n\n[Message](https://discord.com/channels/${value.GuildId}/${value.ChannelId}/${value.ID}): ${value.Message}\nID: **${value.ID}**`;
        });
        if (string.length <= 4000) return await sendMsg(string);
        const chunkStr = chunkSubstr(string, 4000);
        for (const chunk of chunkStr) {
          await sendMsg(chunk);
        }
        break;
      case "clear":
        const id = options.getString("id");
        if (data.length === 0)
          sendMsg("inbox is already empty, no need to clear it");

        if (["ALL", "all"].includes(id)) {
          await inboxPing.deleteMany({ User: user.id });
          return await sendMsg(`cleared ${data.length} inbox`);
        } else {
          let checkData = await inboxPing.findOne({
            User: user.id,
            ID: id,
          });
          if (!checkData)
            return await sendMsg("no inbox with that id is found");
          await inboxPing.deleteOne({ User: user.id, ID: id });
          await sendMsg(`inbox with ID:\`${id}\` has beed removed`);
        }

        break;
      default:
        interaction.reply({
          content: "unkown command",
          flags: 64,
        });
    }
  },
};
