import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { config  } from "../../config.json.js";
import { mConfig  } from "../../messageConfig.json.js";
import { Logger } from "../../util.js";

export {
  data: new SlashCommandBuilder()
    .setName("list_invites")
    .setDescription("list all server invites")
    .toJSON(),
  deleted: false,
  devOnly: false,
  modOnly: false,
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    const { options, guildId, guild, member } = interaction;

    async function sendMsg(msg) {
      const embed = new EmbedBuilder()
        .setDescription(`## Invites List\`\`\` \`\`\``)
        .setColor("fa00b7");
    }
    await interaction.reply("log");
    //await interaction.deferReply({ flags: 64 });

    const invit = await guild.invites.fetch();
    Logger.log(invit);
    guild.invites.fetch().then(console.log).catch(console.error);
  },
};
