const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const moderationSchema = require("../schemas/moderationSch.js");
const mConfig = require("../messageConfig.json");
const { formatDate, Logger } = require("../util.js");

module.exports = {
    customId: "nickBtn",
    userPermissions: [PermissionFlagsBits.ManageUsernames],
    botPermissions: [PermissionFlagsBits.ManageUsernames],
    run: async (client, interaction) => {
        const { message, channel, guildId, guild, user } = interaction;

        const embedAuthor = message.embeds[0].author;
        const targetMember = await guild.members
            .fetch({
                query: embedAuthor.name,
                limit: 1
            })
            .first();

        const tag = 1 + Math.random() * 10000;

        const embed = new EmbedBuilder()
            .setFooter({
                iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
                text: `${client.user.username} - nickname user`
            })
            .setColor("FFFFFF")
            .setAuthor({
                iconURL: `${targetMember.user.displayAvatarURL({
                    dynamic: true
                })}`,
                name: `${targetMember.user.username}`
            })
            .setDescription(
                `What is the reason to change ${targetMember.user.username}'s' name?\n\nyou have 15 seconds to reply the awnser or the moderation will be cancelled.\n\nto continue without a reason, reply with \`\`\`-\`\`\`\nto cancel moderation, reply with \`\`\`cancel\`\`\``
            );
        message.edit({ embeds: [embed], components: [] });

        const filter = m => m.author.id === user.id;

        const reasonCollector = await channel
            .awaitMessages({
                filter,
                max: 1,
                time: 15000,
                errors: ["time"]
            })
            .then(reason => {
                if (reason.first().content.toLowerCase() === "cancel") {
                    reason.first().delete();
                    embed
                        .setColor(mConfig.embedColorError)
                        .setDescription("moderation cancelled");
                    message.edit({ embeds: [embed] });
                    setTimeout(function () {
                        message.delete();
                    }, 2000);
                    return;
                }
                return reason;
            })
            .catch(() => {
                embed
                    .setColor(mConfig.embedColorError)
                    .setDescription("moderation cancelled");
                message.edit({ embeds: [embed] });
                setTimeout(function () {
                    message.delete();
                }, 2000);
                return;
            });

        const reasonObj = reasonCollector?.first();
        if (!reasonObj) return;
        let reason = reasonObj.content;
        if (reasonObj.content === "-") reason = "no reason specified";
        reasonObj.delete();

        let dataDB = await moderationSchema.findOne({
            GuildId: guildId
        });
        if (dataDB) return;
        const { LogChannelId } = dataDB;
        const logChannel = guild.channels.cache.get(LogChannelId);

        await targetMember.setNickname(`user-${tag}`);

        const embedLog = new EmbedBuilder()
            .setColor("#aa0f1d")
            .setTitle("User Name Moderated")
            .setAuthor({
                iconURL: `${targetMember.user.displayAvatarURL({
                    dynamic: true
                })}`,
                name: `${targetMember.user.username}`
            })
            .setDescription(
                `successfully rename ${targetMember.user.username}.`
            )
            .addFields(
                { name: "changed by: ", value: `<@${user.id}>`, inline: true },
                { name: "change to: ", value: `user-${tag}`, inline: true },
                { name: "reason: ", value: `${reason}`, inline: true },
                { name: "date: ", value: `${formatDate()}`, inline: true }
            )
            .setFooter({
                iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
                text: `${client.user.username} - moderate user`
            });
        logChannel.send({ embeds: [embedLog] });

        embed
            .setColor(mConfig.embedColorSuccess)
            .setDescription(
                `successfully rename ${targetMember.user.username}`
            );
        message.edit({ embeds: [embed] });
        setTimeout(function () {
            message.delete();
        }, 2000);
    }
};