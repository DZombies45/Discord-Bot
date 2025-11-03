import {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} from "discord.js";
import { Logger } from "../../util.js";
import QRCode from "qrcode";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import jsQR from "jsqr";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

export default {
  data: new SlashCommandBuilder()
    .setName("qr")
    .setDescription("Generate or read QR code")
    .addSubcommand((sub) =>
      sub
        .setName("create")
        .setDescription("Generate QR code from text")
        .addStringOption((opt) =>
          opt
            .setName("text")
            .setDescription("Text or link to convert")
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("read")
        .setDescription("Read QR code from image or URL")
        .addStringOption((opt) =>
          opt.setName("url").setDescription("URL to QR image"),
        )
        .addAttachmentOption((opt) =>
          opt
            .setName("qr-code")
            .setDescription("Upload QR image (png/jpg/gif)")
            .setRequired(false),
        ),
    )
    .toJSON(),
  deleted: false,
  devOnly: false,
  modOnly: false,
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    await interaction.deferReply();
    const sub = interaction.options.getSubcommand();

    if (sub === "create") {
      const text = interaction.options.getString("text");
      try {
        const qrBuffer = await QRCode.toBuffer(text);
        const attachment = new AttachmentBuilder(qrBuffer, {
          name: "qrcode.png",
        });
        const embed = new EmbedBuilder()
          .setColor("#42d74d")
          .setDescription(`✅ QR code generated for:\n\`\`\`${text}\`\`\``);

        await interaction.editReply({ embeds: [embed], files: [attachment] });
      } catch (e) {
        const embed = new EmbedBuilder()
          .setColor("#bf2c04")
          .setDescription("❌ There was an error generating QR code.");
        await interaction.editReply({ embeds: [embed] });
        Logger.error(`from ${__filename} :\n${e.stack}`);
      }
    }

    if (sub === "read") {
      const optUrl = interaction.options.getString("url");
      const optImg = interaction.options.getAttachment("qr-code");

      if (!optUrl && !optImg) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("#bf2c04")
              .setDescription("⚠️ You must provide a QR image or URL."),
          ],
        });
      }

      const imageUrl = optUrl || optImg.url;

      try {
        const image = await loadImage(imageUrl);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const result = jsQR(imageData.data, image.width, image.height);

        if (!result) {
          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor("#bf2c04")
                .setDescription("❌ QR code not detected or unreadable."),
            ],
          });
        }

        const embed = new EmbedBuilder()
          .setColor("#42d74d")
          .setDescription(`✅ QR content:\n\`\`\`${result.data}\`\`\``);

        await interaction.editReply({ embeds: [embed] });
      } catch (e) {
        const embed = new EmbedBuilder()
          .setColor("#bf2c04")
          .setDescription("❌ Failed to read QR code, try again later.");
        await interaction.editReply({ embeds: [embed] });
        Logger.error(`from ${__filename} :\n${e.stack}`);
      }
    }
  },
};