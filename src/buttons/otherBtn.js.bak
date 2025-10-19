const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { formatDate, Logger } = require("../util.js");

module.exports = {
  customId: "otherBtn",
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
        .setColor("#d11a58")
        .setTitle("Other Option")
        .setAuthor({
          iconURL: `${targetMember.user.displayAvatarURL({
            dynamic: true,
          })}`,
          name: `${targetMember.user.username}`,
        })
        .setDescription(
          `what do you want to do against ${targetMember.user.username}`,
        );
      const otherButton = new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setCustomId("addRoleBtn")
          .setLabel("Add Role")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("nickBtn")
          .setLabel("Nickname")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("cancelBtn")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Secondary),
      );
      await interaction.editReplay({
        embeds: [embed],
        components: [otherButton],
      });
    } catch (e) {
      Logger.error(`from otherBtn.js :\n${e.stack}`);
    }
  },
};
