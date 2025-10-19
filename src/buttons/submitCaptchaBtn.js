import {
  PermissionFlagsBits,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { formatDate, Logger } from "../util.js";

export default {
  customId: "submitCaptchaBtn",
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    try {
      const addRoleModal = new ModalBuilder()
        .setTitle("Submit Captcha Code")
        .setCustomId("submitCaptchaMdl")
        .setComponents(
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel("Code")
              .setCustomId("captcha_code")
              .setPlaceholder("your captcha code")
              .setStyle(TextInputStyle.Short),
          ),
        );
      return await interaction.showModal(addRoleModal);
    } catch (e) {
      Logger.error(`from submitCaptchaBtn.js :\n${e.stack}`);
    }
  },
};
