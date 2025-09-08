const {
  SlashCommandBuilder,
  Routes,
  resolveImage,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { Logger } = require("../../util.js");
const {
  embedColorSuccess,
  embedColorError,
} = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("changeprofile")
    .setDescription("[admin] change bot avatar or banner")
    .addSubcommand((sub) =>
      sub
        .setName("avatar")
        .setDescription("Change bot avatar")
        .addAttachmentOption((opt) =>
          opt
            .setName("image")
            .setDescription("Image to use as avatar")
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("banner")
        .setDescription("Change bot banner")
        .addAttachmentOption((opt) =>
          opt
            .setName("image")
            .setDescription("Image to use as banner")
            .setRequired(true),
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON(),

  deleted: false,
  devOnly: true,
  userPermissions: [],
  botPermissions: [],

  run: async (client, interaction) => {
    const subCmd = interaction.options.getSubcommand();
    const image = interaction.options.getAttachment("image");

    // Check image type
    if (!["image/png", "image/gif"].includes(image.contentType)) {
      const msg = `Image must be PNG or GIF, but got: \`${image.contentType}\``;
      const embed = new EmbedBuilder()
        .setColor(embedColorError)
        .setDescription(msg);
      return await interaction.reply({ embeds: [embed], flags: 64 });
    }

    // Helper reply
    const reply = async (msg, color = embedColorSuccess) => {
      const embed = new EmbedBuilder().setColor(color).setDescription(msg);
      await interaction.reply({ embeds: [embed], flags: 64 });
    };

    try {
      if (subCmd === "avatar") {
        Logger.log(`Changing avatar: ${image.url}`);
        await client.user.setAvatar(image.url);
        return reply("✅ Avatar updated successfully.");
      } else if (subCmd === "banner") {
        Logger.log(`Changing banner: ${image.url}`);
        const imageData = await resolveImage(image.url);
        await client.rest.patch(Routes.user(), {
          body: { banner: imageData },
        });
        return reply("✅ Banner updated successfully.");
      } else {
        return reply("❌ Invalid subcommand.", embedColorError);
      }
    } catch (err) {
      Logger.debug(err.stack);
      return reply(
        `❌ Error occurred: \`${err.message || err}\``,
        embedColorError,
      );
    }
  },
};

