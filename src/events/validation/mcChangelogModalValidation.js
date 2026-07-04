import { handleMcChangelogModal } from "../../contextMenus/mcChangelogCTM.js";

export default async (client, interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (!interaction.customId.startsWith("mcChangelogCTM:")) return;
  await handleMcChangelogModal(client, interaction);
};
