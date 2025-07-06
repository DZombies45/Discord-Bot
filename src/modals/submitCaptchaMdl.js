const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");

const { Logger } = require("../util.js");
const verifySchema = require("../schemas/verificationSch.js");
const userCodeSch = require("../schemas/userCapchaSch.js");

module.exports = {
  customId: "submitCaptchaMdl",
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    const { guild, guildId, user, fields, channel } = interaction;

    console.log(interaction);

    try {
      const code = fields.getTextInputValue("captcha_code");

      // Fetch guild member
      const targetMember = await guild.members.fetch(user.id).catch(() => null);
      if (!targetMember) {
        return interaction.reply({
          content: "❗ An error occurred. Please try again later.",
          ephemeral: true,
        });
      }

      await interaction.deferReply({ ephemeral: true });

      // Fetch server verification config
      const data = await verifySchema.findOne({ GuildId: guildId });
      if (!data) {
        return interaction.editReply({
          content: "❗ Verification is not enabled in this server.",
        });
      }

      // Check if member already verified
      if (targetMember.roles.cache.has(data.role)) {
        return interaction.editReply({
          content: "❗ You are already verified.",
        });
      }

      // Ensure they're using the correct channel
      if (channel.id !== data.channelId) {
        return interaction.editReply({
          content: `❗ This is not the correct channel. Please go to <#${data.channelId}>.`,
        });
      }

      // Fetch user captcha record
      const userData = await userCodeSch.findOne({
        GuildId: guildId,
        memberId: user.id,
      });

      if (!userData) {
        return interaction.editReply({
          content: `❗ You haven't generated a verification code yet. Press the verify button first in <#${data.channelId}>.`,
        });
      }

      // Check if captcha code matches
      if (userData.capcha !== code) {
        // Optional: Increment failed attempt (if needed)
        userData.ke += 1;
        await userData.save();

        const triesLeft = data.limitKe - userData.ke;
        if (triesLeft <= 0) {
          await userCodeSch.deleteOne({ GuildId: guildId, memberId: user.id });
          await targetMember.kick("Exceeded max captcha attempts.");
          return interaction.editReply({
            content: `❌ Incorrect code too many times. You have been kicked.`,
          });
        }

        return interaction.editReply({
          content: `❗ Incorrect code. You have ${triesLeft} tries left.`,
        });
      }

      // Give role
      const role = guild.roles.cache.get(data.role);
      if (!role) {
        return interaction.editReply({
          content: "❗ Verification role not found. Contact server admin.",
        });
      }

      await targetMember.roles.add(role).catch((err) => {
        Logger.error(`Error adding role: ${err.stack}`);
        return interaction.editReply({
          content: "❗ Couldn't assign role. Check bot permissions.",
        });
      });

      // Clean up
      await userData.deleteOne();

      // Respond with success
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({
          name: targetMember.user.tag,
          iconURL: targetMember.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
          `✅ Successfully verified and received the <@&${role.id}> role.`,
        );

      return interaction.editReply({
        embeds: [embed],
      });
    } catch (err) {
      Logger.error(`Error in submitCaptchaMdl:\n${err.stack}`);
      return interaction.editReply({
        content: "❗ Unexpected error occurred. Try again later.",
      });
    }
  },
};
