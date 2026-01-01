import {
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ActionRowBuilder,
} from "discord.js";
import { Logger } from "../util.js";

export default async (interaction, pages, time = 60 * 1000) => {
  try {
    if (!interaction || !Array.isArray(pages) || pages.length === 0)
      throw new Error("invalid arguments");

    await interaction.deferReply();

    // === SINGLE PAGE ===
    if (pages.length === 1) {
      await interaction.editReply({
        embeds: pages,
        components: [],
      });
      return interaction.fetchReply();
    }

    let index = 0;

    const first = new ButtonBuilder()
      .setCustomId("first")
      .setEmoji("⏮️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);

    const prev = new ButtonBuilder()
      .setCustomId("prev")
      .setEmoji("◀️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);

    const page = new ButtonBuilder()
      .setCustomId("page")
      .setLabel(`1/${pages.length}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);

    const next = new ButtonBuilder()
      .setCustomId("next")
      .setEmoji("▶️")
      .setStyle(ButtonStyle.Primary);

    const last = new ButtonBuilder()
      .setCustomId("last")
      .setEmoji("⏭️")
      .setStyle(ButtonStyle.Primary);

    const buttons = new ActionRowBuilder().addComponents(
      first,
      prev,
      page,
      next,
      last,
    );

    await interaction.editReply({
      embeds: [pages[index]],
      components: [buttons],
    });

    const msg = await interaction.fetchReply();

    const mc = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time,
    });

    mc.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          ephemeral: true,
          content: "you are not the one that run the command",
        });
      }

      await i.deferUpdate();

      switch (i.customId) {
        case "first":
          index = 0;
          break;
        case "prev":
          if (index > 0) index--;
          break;
        case "next":
          if (index < pages.length - 1) index++;
          break;
        case "last":
          index = pages.length - 1;
          break;
      }

      page.setLabel(`${index + 1}/${pages.length}`);

      first.setDisabled(index === 0);
      prev.setDisabled(index === 0);
      next.setDisabled(index === pages.length - 1);
      last.setDisabled(index === pages.length - 1);

      await msg.edit({
        embeds: [pages[index]],
        components: [buttons],
      });

      mc.resetTimer();
    });

    mc.on("end", async () => {
      await msg.edit({
        components: [],
      });
    });

    return msg;
  } catch (e) {
    Logger.error(`from buttonPaginator.js:\n${e.stack}`);
  }
};
