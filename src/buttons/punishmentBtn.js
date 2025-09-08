const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { formatDate, Logger } = require("../util.js");

module.exports = {
  customId: "punishmentBtn",
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    const { message, channel, guildId, guild, user } = interaction;
    await interaction.deferReply();

    try {
      const embedAuthor = message.embeds[0].author;
      const targetMember = await guild.members
        .fetch({
          query: embedAuthor.name,
          limit: 1,
        })
        .first();

      const embed = new EmbedBuilder()
        .setColor("#e00e0e")
        .setTitle("Punishment")
        .setAuthor({
          iconURL: `${targetMember.user.displayAvatarURL({
            dynamic: true,
          })}`,
          name: `${targetMember.user.username}`,
        })
        .setDescription(
          `what do you want to do against ${targetMember.user.username}`,
        );
      const punishButton = new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setCustomId("tempBanBtn")
          .setLabel("Temp Ban")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("banBtn")
          .setLabel("Perm Ban")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("tempMuteBtn")
          .setLabel("Temp Mute")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("kickBtn")
          .setLabel("kick")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("cancelBtn")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Secondary),
      );
      await interaction.editReplay({
        embeds: [embed],
        components: [punishButton],
      });
    } catch (e) {
      Logger.error(`from punishmentBtn.js :\n${e.stack}`);
    }
  },
};
