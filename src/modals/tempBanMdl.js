const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { formatDate, parseDuration, Logger } = require("../util.js");
const moderationSch = require("../schemas/moderationSch.js");
const tempBanSch = require("../schemas/tempBanSch.js");
const { startBanTimer, startTimeout } = require("../utils/banTimmer.js");

module.exports = {
    customId: "tempBanMdl",
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
                .getTextInputValue("tempBanTime")
                .replace(/(\d+)([s])/g, "");
            const banReason =
                fields.getTextInputValue("tempBanReason") ||
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
                    `**${targetMember} successfully banned for ${banTime} and will end at <t:${banEndTime}:F>**`
                );

            await interaction.deferReply({ ephemeral: true });

            await targetMember
                .ban({
                    reason: `you has been temporarly banned for ${formatDate(
                        banDuration
                    )}\nreason: ${banReason}`
                })
                .catch(err => {
                    Logger.log(
                        `some error at temp banning ${targetMember.user.username}`
                    );
                    return interaction.editReply({
                        embeds: "error, try again latter",
                        components: []
                    });
                });
            const obj = {
                GuildId: guildId,
                memberId: targetMember.user.id,
                reason: "ban",
                endTime: banEndTimeFull
            };
            await tempBanSch.create(obj);
            let dataDB = await moderationSch.findOne({
                GuildId: guildId
            });
            const { LogChannelId } = dataDB;
            const logChannel = guild.channels.cache.get(LogChannelId);

            const embedLog = new EmbedBuilder()
                .setColor("#fcb4fc")
                .setTitle("User Temp Banned")
                .setAuthor({
                    name: `${targetMember.user.username}`
                })
                .setDescription(
                    `successfully temp ban ${targetMember.user.username} for ${banTime}.`
                )
                .addFields(
                    {
                        name: "temp ban by: ",
                        value: `<@${user.id}>`,
                        inline: false
                    },
                    {
                        name: "ban start date: ",
                        value: `${formatDate()}`,
                        inline: true
                    },
                    {
                        name: "ban duration: ",
                        value: `${banTime}`,
                        inline: true
                    },
                    {
                        name: "ban end date: ",
                        value: `${formatDate(banEndTimeFull)}`,
                        inline: true
                    }
                )
                .setFooter({
                    iconURL: `${client.user.displayAvatarURL({
                        dynamic: true
                    })}`,
                    text: `${client.user.username} - temp ban user`
                });
            logChannel.send({ embeds: [embedLog] });
            interaction.editReply({ embeds: [embed], components: [] });
            if (obj.endTime - Date.now() < 3600000)
                startTimeout(client, guild, obj);
        } catch (e) {
            Logger.error(`from tempBanMdl.js :\n${e.stack}`);
        }
    }
};