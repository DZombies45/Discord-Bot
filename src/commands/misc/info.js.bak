const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  time,
  discordSort,
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
  ChannelType,
  UserFlags,
  version,
} = require("discord.js");
const { Profile } = require("discord-arts");
const { connection } = require("mongoose");
const os = require("os");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("get info about some stuff")
    .addSubcommand((sub) =>
      sub.setName("server").setDescription("get info about this server"),
    )
    .addSubcommand((sub) =>
      sub.setName("bot").setDescription("get info about this bot"),
    )
    .addSubcommand((sub) =>
      sub
        .setName("user")
        .setDescription("get info about a user")
        .addUserOption((option) =>
          option.setName("target").setDescription("target user for profile"),
        ),
    )
    .toJSON(),
  deleted: false,
  devOnly: false,
  modOnly: false,
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {

  const embed = new EmbedBuilder().setColor("#acf7f2");
  const subCmd = interaction.options.getSubcommand();

  await interaction.deferReply();

  let replyPayload;

  try {
    switch (subCmd) {
      case "user":
        replyPayload = await handleUser(interaction, embed);
        break;
      case "server":
        replyPayload = await handleServer(interaction, embed);
        break;
      case "bot":
        replyPayload = await handleBot(interaction, embed, client);
        break;
    }

    await interaction.editReply(replyPayload);
  } catch (err) {
    console.error("❌ Gagal proses command:", err);

    if (!interaction.replied) {
      await interaction.reply({
        content: "Terjadi error saat memproses perintah.",
        ephemeral: true,
      });
    }
  }
  
  },
};
function getStatus(member) {
  console.log(member.presence)
  switch (member.presence ? member.presence.status : "offline") {
    case "online":
      return "🟢 Online";
    case "idle":
      return "🟡 Idle";
    case "dnd":
      return "🔴 Do Not Disturb";
    case "offline":
      return "⚫ Offline";
    default:
      return "⚫ unknown";
  }
}

// fungsi util untuk build payload reply
function createReply(embed, image) {
  const payload = {
    embeds: [embed],
  };

  if (image) {
    payload["files"] = [{ attachment: image, name: "info.png" }];
  }

  return payload;
}

// fungsi handler per subcommand
async function handleUser(interaction, embed) {
  const target = interaction.options.getUser("target") || interaction.user;
  const member = await interaction.guild.members.fetch(target.id);

  const image = await Profile(target.id, {
    badgesFrame: true,
    moreBackgroundBlur: true,
    backgroundBrightness: 100,
  });

  embed.setAuthor({
    name: target.tag,
    iconURL: target.displayAvatarURL({ dynamic: true }),
  });
  embed.addFields(
    { name: "**ID**", value: `${target.id}`, inline: true },
    {
      name: "**Nickname**",
      value: `${member.nickname || "-"}`,
      inline: true,
    },
    {
      name: "**Username**",
      value: `${member.username || "-"}`,
      inline: true,
    },
    {
      name: "**Status**",
      value: `${getStatus(member)}`,
      inline: true,
    },
    {
      name: "**Joined Server**",
      value: `${time(member.joinedAt, "R")}`,
      inline: true,
    },
    {
      name: "**Joined Discord**",
      value: `${time(target.createdAt, "R")}`,
      inline: true,
    },
    {
      name: "**Highest Tag**",
      value:
        discordSort(member.roles.cache).last().toString() || "no role",
      inline: true,
    }
  );
  embed.setThumbnail(target.displayAvatarURL({ dynamic: true }));

  return createReply(embed, image);
}

async function handleServer(interaction, embed) {
  const { guild } = interaction;

  embed.setAuthor({
    name: guild.name,
    iconURL: guild.iconURL({ dynamic: true }),
  });
  embed.addFields(
    {
      name: "**Owner**",
      value: `<@${guild.ownerId}>`,
      inline: true,
    },
    {
      name: "**Members**",
      value: `${guild.memberCount}`,
      inline: true,
    },
    {
      name: "**Roles**",
      value: `${guild.roles.cache.size}`,
      inline: true,
    },
    {
      name: "**Channels**",
      value: `${guild.channels.cache.size}`,
      inline: true,
    },
    {
      name: "**Created At**",
      value: `${time(guild.createdAt, "R")}`,
      inline: true,
    }
  );
  embed.setThumbnail(guild.iconURL({ dynamic: true }));

  return createReply(embed); // no image
}

async function handleBot(interaction, embed, client) {
  await client.user.fetch();
  await client.application.fetch();
  const command = await client.application.commands.fetch();

  const image = await Profile(client.user.id, {
    badgesFrame: true,
    moreBackgroundBlur: true,
    backgroundBrightness: 100,
  });

  const status = [
    "🔴 Disconnected",
    "🟢 Connected",
    "🟡 Connecting",
    "🟠 Disconnecting",
  ];

  const getChannelTypeSize = (type) =>
    client.channels.cache.filter((c) => type.includes(c.type)).size;

  embed.setAuthor({
    name: client.user.tag,
    iconURL: client.user.displayAvatarURL({ dynamic: true }),
  });
  embed.setThumbnail(client.user.displayAvatarURL({ dynamic: true }));
  embed.addFields(
    { name: "⛔ Client", value: client.user.tag, inline: true },
    {
      name: "⛔ Created",
      value: `${time(parseInt(client.user.createdTimestamp / 1000), "R")}`,
      inline: true,
    },
    {
      name: "📌 Owner",
      value: `${client.application?.owner || "None"}`,
      inline: true,
    },
    {
      name: "📔 Database",
      value: status[connection.readyState],
      inline: true,
    },
    {
      name: "💻 System",
      value: os
        .type()
        .replace("Windows_NT", "Windows")
        .replace("Darwin", "macOS"),
      inline: true,
    },
    {
      name: "🖥 CPU Model",
      value: `${os.cpus()[0]?.model || "unknown"}`,
      inline: true,
    },
    {
      name: "⛔ CPU Usage",
      value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}%`,
      inline: true,
    },
    {
      name: "📤 Up Since",
      value: `${time(parseInt(client.readyTimestamp / 1000), "R")}`,
      inline: true,
    },
    {
      name: "💾 Node.js",
      value: process.version,
      inline: true,
    },
    {
      name: "💝  Discord.js",
      value: version,
      inline: true,
    },
    {
      name: " 📡Ping",
      value: `${client.ws.ping}ms`,
      inline: true,
    },
    {
      name: "⚒️ Commands",
      value: `${command.size}`,
      inline: true,
    },
    {
      name: "💵 Servers",
      value: `${client.guilds.cache.size}`,
      inline: true,
    },
    {
      name: "⚖️ Users",
      value: `${client.guilds.cache.reduce(
        (acc, g) => acc + g.memberCount,
        0
      )}`,
      inline: true,
    },
    {
      name: "💞 Text Channels",
      value: `${getChannelTypeSize([
        ChannelType.GuildText,
        ChannelType.GuildNews,
      ])}`,
      inline: true,
    },
    {
      name: " 🔉Voice Channels",
      value: `${getChannelTypeSize([
        ChannelType.GuildVoice,
        ChannelType.GuildStageVoice,
      ])}`,
      inline: true,
    },
    {
      name: "💘 Threads",
      value: `${getChannelTypeSize([
        ChannelType.GuildPublicThread,
        ChannelType.GuildPrivateThread,
        ChannelType.GuildNewsThread,
      ])}`,
      inline: true,
    }
  );

  return createReply(embed, image);
}