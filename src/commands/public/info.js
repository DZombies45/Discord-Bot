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
    version
} = require("discord.js");
const { profileImage } = require("discord-arts");
const { connection } = require("mongoose");
const os = require("os");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("get info about some stuff")
        .addSubcommand(sub =>
            sub.setName("server").setDescription("get info about this server")
        )
        .addSubcommand(sub =>
            sub.setName("bot").setDescription("get info about this bot")
        )
        .addSubcommand(sub =>
            sub
                .setName("user")
                .setDescription("get info about a user")
                .addUserOption(option =>
                    option
                        .setName("target")
                        .setDescription("target user for profile")
                )
        )
        .toJSON(),
    deleted: false,
    devOnly: false,
    modOnly: false,
    userPermissions: [],
    botPermissions: [],
    run: async (client, interaction) => {
        const { options, guildId, guild } = interaction;
        const subCmd = options.getSubcommand();
        await interaction.deferReply({ ephemeral: true, fetchReply: true });
        const embed = new EmbedBuilder().setColor("#acf7f2");
        let image = null;

        switch (subCmd) {
            case "user":
                const target = options.getUser("target") || interaction.user;
                const member = await guild.members.fetch(target.id);
                image = await profileImage(target.id, {
                    badgesFrame: true,
                    moreBackgroundBlur: true,
                    backgroundBrightness: 100
                });
                embed.setAuthor({
                    name: target.tag,
                    iconUrl: target.displayAvatarURL({ dynamic: true })
                });
                embed.addFields(
                    { name: "**ID**", value: `${target.id}`, inline: true },
                    {
                        name: "**Nickname**",
                        value: `${member.nickname || "-"}`,
                        inline: true
                    },
                    {
                        name: "**Username**",
                        value: `${member.username || "-"}`,
                        inline: true
                    },
                    {
                        name: "**Status**",
                        value: `${getStatus(member)}`,
                        inline: true
                    },
                    {
                        name: "**Joined Server**",
                        value: `${time(member.joinedAt, "R")}`,
                        inline: true
                    },
                    {
                        name: "**Joined Discord**",
                        value: `${time(target.createdAt, "R")}`,
                        inline: true
                    },
                    {
                        name: "**Highest Tag**",
                        value: `${
                            discordSort(member.roles.cache).last().toString() ||
                            "no role"
                        }`,
                        inline: true
                    }
                );
                embed.setThumbnail(target.displayAvatarURL({ dynamic: true }));
                await interaction.editReply({
                    ephemeral: true,
                    files: [{ attachment: image, name: "user info.png" }]
                });
                break;

            case "server":
                embed.setAuthor({
                    name: guild.name,
                    iconUrl: guild.iconURL({ dynamic: true })
                });
                embed.addFields(
                    {
                        name: "**Owner**",
                        value: `<@${guild.ownerId}>`,
                        inline: true
                    },
                    {
                        name: "**Members**",
                        value: `${guild.memberCount}`,
                        inline: true
                    },
                    {
                        name: "**roles**",
                        value: `${guild.roles.cache.size}`,
                        inline: true
                    },
                    {
                        name: "**Channels**",
                        value: `${guild.channels.cache.size}`,
                        inline: true
                    },
                    {
                        name: "**Created At**",
                        value: `${time(guild.createdAt, "R")}`,
                        inline: true
                    }
                );
                embed.setThumbnail(guild.iconURL({ dynamic: true }));
                break;

            case "bot":
                await client.user.fetch();
                await client.application.fetch();
                image = await profileImage(client.user.id, {
                    badgesFrame: true,
                    moreBackgroundBlur: true,
                    backgroundBrightness: 100
                });

                const status = [
                    "Disconnected",
                    "Connected",
                    "Connecting",
                    "Disconnecting"
                ];

                const getChannelTypeSize = type =>
                    client.channels.cache.filter(channel =>
                        type.includes(channel.type)
                    ).size;

                embed
                    .setAuthor({
                        name: client.user.tag,
                        iconUrl: client.user.displayAvatarURL({
                            dynamic: true
                        })
                    })
                    .setThumbnail(
                        client.user.displayAvatarURL({ dynamic: true })
                    )
                    .addFields(
                        {
                            name: "⛔ Client",
                            value: client.user.tag,
                            inline: true
                        },
                        {
                            name: "⛔ Created",
                            value: `<t:${parseInt(
                                client.user.createdTimestamp / 1000
                            )}:R>`,
                            inline: true
                        },
                        {
                            name: "⛔ Verified",
                            value:
                                client.user.flags & UserFlags.VerifiedBot
                                    ? "Yes"
                                    : "No",
                            inline: true
                        },
                        {
                            name: "📌 Owner",
                            value: `${client.application.owner.tag || "None"}`,
                            inline: true
                        },
                        {
                            name: "📔 Database",
                            value: status[connection.readyState],
                            inline: true
                        },
                        {
                            name: "💻 System",
                            value: os
                                .type()
                                .replace("Windows_NT", "Windows")
                                .replace("Darwin", "macOS"),
                            inline: true
                        },
                        {
                            name: "🖥 CPU Model",
                            value: `${os.cpus()[0].model}`,
                            inline: true
                        },
                        {
                            name: "⛔ CPU Usage",
                            value: `${(
                                process.memoryUsage().heapUsed /
                                1024 /
                                1024
                            ).toFixed(2)}%`,
                            inline: true
                        },
                        {
                            name: "📤 Up Since",
                            value: `<t:${parseInt(
                                client.readyTimestamp / 1000
                            )}:R>`,
                            inline: true
                        },
                        {
                            name: "💾 Node.js",
                            value: process.version,
                            inline: true
                        },
                        {
                            name: "💝  Discord.js",
                            value: version,
                            inline: true
                        },
                        {
                            name: " 📡Ping",
                            value: `${client.ws.ping}ms`,
                            inline: true
                        },
                        {
                            name: "⚒️ Commands",
                            value: `${client.commands.size}`,
                            inline: true
                        },
                        {
                            name: "💵 Servers",
                            value: `${client.guilds.cache.size}`,
                            inline: true
                        },
                        {
                            name: "⚖️ Users",
                            value: `${client.guilds.cache.reduce(
                                (acc, guild) => acc + guild.memberCount,
                                0
                            )}`,
                            inline: true
                        },
                        {
                            name: "💞 Text Channels",
                            value: `${getChannelTypeSize([
                                ChannelType.GuildText,
                                ChannelType.GuildNews
                            ])}`,
                            inline: true
                        },
                        {
                            name: " 🔉Voice Channels",
                            value: `${getChannelTypeSize([
                                ChannelType.GuildVoice,
                                ChannelType.GuildStageVoice
                            ])}`,
                            inline: true
                        },
                        {
                            name: "💘 Threads",
                            value: `${getChannelTypeSize([
                                ChannelType.GuildPublicThread,
                                ChannelType.GuildPrivateThread,
                                ChannelType.GuildNewsThread
                            ])}`,
                            inline: true
                        }
                    );
                await interaction.editReply({
                    ephemeral: true,
                    files: [{ attachment: image, name: "bot info.png" }]
                });
                break;
        }

        await interaction.editReply({
            embeds: [embed],
            ephemeral: false
        });
    }
};
function getStatus(member) {
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
