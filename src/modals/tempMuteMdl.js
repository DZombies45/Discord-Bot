const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { formatDate, parseDuration, Logger } = require("../util.js");
const moderationSch = require("../schemas/moderationSch.js");
const tempBanSch = require("../schemas/tempBanSch.js");
const { startBanTimer, startTimeout } = require("../utils/banTimmer.js");

module.exports = {
    customId: "tempMuteMdl",
    userPermissions: [PermissionFlagsBits.BanMembers],
    botPermissions: [PermissionFlagsBits.BanMembers],
    run: async (client, interaction) => {
        const { message, channel, guildId, guild, user, fields } = interaction;
        try {
            const embedAuthor = message.embeds[0].author;
            const targetMember = await guild.members
                .fetch({
                    query: embedAuthor.name,
                    limit: 1
                })
                .first();
            const banTime = fields
                .getTextInputValue("tempMuteTime")
                .replace(/(\d+)([sY])/g, "");
            const banReason =
                fields.getTextInputValue("tempMuteReason") ||
                "no reason profided";
            const banDuration = parseDuration(banTime);
            const banEndTimeFull = Date.now() + banDuration;
            const banEndTime = Math.floor(banEndTimeFull / 1000);
            const embed = new EmbedBuilder()
                .setAuthor({
                    iconURL: `${targetMember.user.displayAvatarURL({
                        dynamic: true
                    })}`,
                    name: `${targetMember.user.username}`
                })
                .setColor("#fa6767e2")
                .setDescription(
                    `**${targetMember} successfully muted for ${banTime} and will end at <t:${banEndTime}:F>**`
                );

            await interaction.deferReply({ ephemeral: true });

            let dataDB = await moderationSch.findOne({
                GuildId: guildId
            });
            const { LogChannelId, MuteRoleId } = dataDB;
            const logChannel = guild.channels.cache.get(LogChannelId);

            await targetMember.roles
                .add(
                    MuteRoleId,
                    `you has been temporarly muted for ${formatDate(
                        banDuration
                    )}\nreason: ${banReason}`
                )
                .catch(err => {
                    Logger.log(
                        `some error at temp muting ${targetMember.user.username}`
                    );
                    return interaction.editReply({
                        embeds: "error, try again latter",
                        components: []
                    });
                });

            const obj = {
                GuildId: guildId,
                memberId: targetMember.user.id,
                reason: "mute",
                endTime: banEndTimeFull
            };
            await tempBanSch.create(obj);

            const embedLog = new EmbedBuilder()
                .setColor("#fcb4fc")
                .setTitle("User Temp Muted")
                .setAuthor({
                    name: `${targetMember.user.username}`
                })
                .setDescription(
                    `successfully temp muted ${targetMember.user.username} for ${banTime}.`
                )
                .addFields(
                    {
                        name: "temp mute by: ",
                        value: `<@${user.id}>`,
                        inline: false
                    },
                    {
                        name: "mute start date: ",
                        value: `${formatDate()}`,
                        inline: true
                    },
                    {
                        name: "mute duration: ",
                        value: `${banTime}`,
                        inline: true
                    },
                    {
                        name: "mute end date: ",
                        value: `${formatDate(banEndTimeFull)}`,
                        inline: true
                    }
                )
                .setFooter({
                    iconURL: `${client.user.displayAvatarURL({
                        dynamic: true
                    })}`,
                    text: `${client.user.username} - temp mute user`
                });
            logChannel.send({ embeds: [embedLog] });
            interaction.editReply({ embeds: [embed], components: [] });
            if (obj.endTime - Date.now() < 3600000)
                startTimeout(client, guild, obj);
        } catch (e) {
            Logger.error(`from tempMuteMdl.js :\n${e.stack}`);
        }
    }
};