const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    time,
    discordSort,
    EmbedBuilder
} = require("discord.js");
const { profileImage } = require("discord-arts");
const packageJson = require("../../../package.json");

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
        await interaction.deferReply({ fetchReply: true });
        const embed = new EmbedBuilder().setColor("#acf7f2");

        switch (subCmd) {
            case "user":
                const target = options.getUser("target") || interaction.user;
                const member = await guild.members.fetch(target.id);
                const image = await profileImage(target.id, {
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
                const uptime = new Date(Date.now() - client.uptime);
                embed.setAuthor({
                    name: client.user.tag,
                    iconUrl: client.user.displayAvatarURL({ dynamic: true })
                });
                embed.addFields(
                    {
                        name: "**Ping**",
                        value: `${Math.round(client.ws.ping)}ms`,
                        inline: true
                    },
                    {
                        name: "**Uptime**",
                        value: `${time(uptime, "R")}`,
                        inline: true
                    },
                    {
                        name: "**Memory Usage**",
                        value: `${(
                            process.memoryUsage().heapUsed /
                            1024 /
                            1024
                        ).toFixed(2)} MB`,
                        inline: true
                    },
                    {
                        name: "**Ram Usage**",
                        value: `${(
                            process.cpuUsage().system /
                            1024 /
                            1024
                        ).toFixed(2)}%`,
                        inline: true
                    },
                    {
                        name: "**NodeJS V**",
                        value: `${process.version}`,
                        inline: true
                    },
                    {
                        name: "**DiscordJS V**",
                        value: `${packageJson.dependencies[
                            "discord.js"
                        ].substring(1)}`,
                        inline: true
                    }
                );
                embed.setThumbnail(
                    client.user.displayAvatarURL({ dynamic: true })
                );
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
