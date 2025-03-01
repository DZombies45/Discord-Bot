const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { formatDate, Logger } = require("../util.js");
const verifySchema = require("../schemas/verificationSch.js");
const userCodeSch = require("../schemas/userCapchaSch.js");

module.exports = {
    customId: "submitCaptchaMdl",
    userPermissions: [],
    botPermissions: [PermissionFlagsBits.ManageRoles],
    run: async (client, interaction) => {
        const { message, channel, guildId, guild, user, fields } = interaction;

        try {
            const code = fields.getTextInputValue("captcha_code");

            const targetMember = await guild.members
                .fetch({
                    query: user.id,
                    limit: 1
                })
                .first();
            if (!targetMember)
                return inteaction.reply({
                    content: "❗ an error occurred, try again latter",
                    ephemeral: true
                });

            await interaction.deferReply({ ephemeral: true });

            const data = await verification.findOne({ GuildId: guildId });
            if (!data)
                return inteaction.editReply({
                    content: "❗ verification is disable in this server",
                    ephemeral: true
                });
            if (targetMember.roles.cache.has(data.role))
                return inteaction.editReply({
                    content: "❗ you already verified",
                    ephemeral: true
                });
            if (channelId !== data.channelId)
                return inteaction.editReply({
                    content: `❗ can't use this command here, use it <#${data.channelId}>`,
                    ephemeral: true
                });

            const userData = await userCodeSch.findOne({
                GuildId: guildId,
                memberId: user.id
            });
            if (!userData)
                return inteaction.editReply({
                    content: `❗ press \`verify\` here first <#${data.channelId}> to generate your code`,
                    ephemeral: true
                });
            if (userData.capcha !== code) {
                inteaction.editReply({
                    content: `❗ code don't match, try again or press verify again, you has ${
                        data.limitKe - userData.ke
                    } try left`,
                    ephemeral: true
                });
            }
            const role = await guild.roles.cache.get(data.role);

            const embed = new EmbedBuilder()
                .setAuthor({
                    iconURL: `${targetMember.user.displayAvatarURL({
                        dynamic: true
                    })}`,
                    name: `${targetMember.user.username}`
                })
                .setColor("00fa30")
                .setDescription(`**successfully gettimg ${role}**`);
            await targetMember.roles.add(role).catch(err => {
                Logger.log(
                    `some error at adding role ${roleId} to ${targetMember.user.username}`
                );
                return interaction.editReply({
                    embeds: "error, try again latter",
                    components: []
                });
            });
            await userData.remove().catch(err => {
                Logger.log(
                    `some error at removing user captcha ${targetMember.user.username}, id ${targetMember.user.id}`
                );
            });
            return interaction.editReply({ embeds: [embed], components: [] });
        } catch (e) {
            Logger.error(`from addRoleBtn.js :\n${e.stack}`);
        }
    }
};
