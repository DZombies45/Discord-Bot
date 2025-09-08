const {
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ActionRowBuilder,
} = require("discord.js");
const { Logger } = require("../util.js");

module.exports = async (interaction, pages, time = 60 * 1000) => {
  try {
    if (!interaction || !pages || pages.length === 0)
      throw new Error("invalid arguments");

    await interaction.deferReply();

    if (pages.length === 1) {
      return await interaction.editReply({
        embeds: pages,
        components: [],
        fetchReply: true,
      });
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
      .setLabel(`${index + 1}/${pages.length}`)
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

    const msg = await interaction.editReply({
      embeds: [pages[index]],
      components: [buttons],
      fetchReply: true,
    });

    const mc = await msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time,
    });
    mc.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id)
        return await i.reply({
          flags: 64,
          content: "you are not the one that run the command",
        });

      await i.deferUpdate();
      switch (i.customId) {
        case "first":
          if (index !== 0) index = 0;
          break;
        case "prev":
          if (index > 0) index--;
          break;
        case "next":
          if (index < pages.length - 1) index++;
          break;
        case "last":
          if (index !== pages.length - 1) index = pages.length - 1;
          break;
        default:
        // code
      }

      page.setLabel(`${index + 1}/${pages.length}`);

      if (index === 0) {
        prev.setDisabled(true);
        first.setDisabled(true);
      } else {
        prev.setDisabled(false);
        first.setDisabled(false);
      }
      if (index === pages.length - 1) {
        next.setDisabled(true);
        last.setDisabled(true);
      } else {
        next.setDisabled(false);
        last.setDisabled(false);
      }

      await msg.edit({
        embeds: [pages[index]],
        components: [buttons],
      });
      mc.resetTimer();
    });

    mc.on("end", async () => {
      await msg.edit({
        embeds: [pages[index]],
        components: [],
      });
    });

    return msg;
  } catch (e) {
    Logger.error(`from buttonPaginator.js :\n${e.stack}`);
  }
};
