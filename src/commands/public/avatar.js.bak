const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Get the avatar or banner of a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to get info about")
        .setRequired(true),
    )
    .toJSON(),
  deleted: false,
  devOnly: false,
  modOnly: false,
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    const user = interaction.options.getUser("user");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("check_avatar")
        .setLabel("Check Avatar [🔎]")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("check_banner")
        .setLabel("Check Banner [🔎]")
        .setStyle(ButtonStyle.Primary),
    );

    const embed = new EmbedBuilder()
      .setColor("#611BDB")
      .setDescription(`**What do you want to see for** **${user}**`)
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [row] });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60_000,
      filter: (i) => i.user.id === interaction.user.id,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "check_avatar") {
        const avatarEmbed = new EmbedBuilder()
          .setColor("#611BDB")
          .setDescription(`# ${user} Avatar`)
          .setImage(user.displayAvatarURL({ size: 1024 }))
          .setFooter({
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp();
        await i.update({ embeds: [avatarEmbed], components: [row] });
      } else if (i.customId === "check_banner") {
        await user.fetch();
        const banner = user.bannerURL({ size: 1024 });

        const bannerEmbed = new EmbedBuilder()
          .setColor("#611BDB")
          .setDescription(`# ${user} Banner !`)
          .setFooter({
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp();

        if (banner) {
          bannerEmbed.setImage(banner);
        } else {
          bannerEmbed.setDescription("User has no banner");
        }

        await i.update({ embeds: [bannerEmbed], components: [row] });
      }
    });

    collector.on("end", () => {
      interaction.editReply({ components: [] }).catch(() => {});
    });
  },
};

