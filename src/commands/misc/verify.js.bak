const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const userCaptha = require("../../schemas/userCapchaSch.js");
const verifySchema = require("../../schemas/verificationSch.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("verify yourself")
    .addStringOption((option) =>
      option
        .setName("captcha")
        .setDescription("captcha code")
        .setRequired(true),
    )
    .setDMPermission(false)
    .toJSON(),
  deleted: false,
  userPermissions: [],
  botPermissions: [],
  devOnly: false,
  run: async (client, interaction) => {
    const { options, guildId, guild, user, channelId } = interaction;

    await interaction.deferReply();
    const data = await verification.findOne({ GuildId: guildId });
    if (!data)
      return inteaction.editReply({
        content: "❗ verification is disable in this server",
        flags: 64,
      });
    if (user.roles.cache.has(data.role))
      return inteaction.editReply({
        content: "❗ you already verified",
        flags: 64,
      });
    if (channelId !== data.channelId)
      return inteaction.editReply({
        content: `❗ can't use this command here, use it <#${data.channelId}>`,
        flags: 64,
      });

    const userData = await userCaptha.findOne({
      GuildId: guildId,
      memberId: user.id,
    });
    if (!userData)
      return inteaction.editReply({
        content: `❗ press \`verify\` here first <#${data.channelId}> to generate your code`,
        flags: 64,
      });

    const code = options.getString("captcha");

    if (userData.capcha !== code) {
      inteaction.editReply({
        content: `❗ code don't match, try again or press verify again, you has ${
          data.limitKe - userData.ke
        } try left`,
        flags: 64,
      });
    }
    const role = await guild.roles.cache.get(data.role);
    await user.roles.add(role).catch((err) => {
      Logger.log(
        `some error at adding role ${roleId} to ${user.user.username}`,
      );
      return interaction.editReply({
        content: "error, try again latter",
        flags: 64,
      });
    });
    await userData.remove();
    await interaction.editReply({
      content: "verification success",
      flags: 64,
    });
  },
};
