const { EmbedBuilder } = require("discord.js");
const {
  developerId,
  testServerId,
  moderatorRoleId,
  commandErrorChannel,
} = require("../../config.json");
const mConfig = require("../../messageConfig.json");
const getLocalContextMenus = require("../../utils/getLocalContextMenus.js");
const { Logger } = require("../../util.js");

module.exports = async (client, interaction) => {
  if (!interaction.isContextMenuCommand()) return;
  const localContextMenus = getLocalContextMenus();

  try {
    const contextMenuObject = localContextMenus.find(
      (cmd) => cmd.data.name === interaction.commandName,
    );
    if (!contextMenuObject) return;

    if (contextMenuObject.devOnly) {
      if (!developerId.includes(interaction.member.id)) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.commandDevOnly}`);
        interaction.reply({ embeds: [rEmbed], flags: 64 });
        return;
      }
    }

    if (contextMenuObject.modOnly) {
      if (
        !moderatorRoleId.some((roleId) =>
          interaction.member.roles.cache.has(roleId),
        )
      ) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.commandModOnly}`);
        interaction.reply({ embeds: [rEmbed], flags: 64 });
        return;
      }
    }

    if (contextMenuObject.testMode) {
      if (interaction.guild.id !== testServerId) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.commandTestMode}`);
        interaction.reply({ embeds: [rEmbed], flags: 64 });
        return;
      }
    }

    if (contextMenuObject.userPermissions?.length) {
      for (const permission of contextMenuObject.userPermissions) {
        if (interaction.member.permissions.has(permission)) {
          continue;
        }
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.userNoPermissions}`);
        interaction.reply({ embeds: [rEmbed], flags: 64 });
        return;
      }
    }

    if (contextMenuObject.botPermissions?.length) {
      for (const permission of contextMenuObject.botPermissions) {
        const bot = interaction.guild.members.me;
        if (bot.permissions.has(permission)) {
          continue;
        }
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.botNoPermissions}`);
        interaction.reply({ embeds: [rEmbed], flags: 64 });
        return;
      }
    }

    await contextMenuObject.run(client, interaction);
  } catch (err) {
    const errorEmbed = new EmbedBuilder()
      .setColor(`${mConfig.embedColorError}`)
      .setDescription(`${mConfig.commandError}`);
    await interaction
      .reply({ embeds: [errorEmbed], flags: 64 })
      .catch(async () => {
        await interaction
          .editReply({ embeds: [errorEmbed], flags: 64 })
          .catch(() => {});
      });

    const embed = new EmbedBuilder()
      .setTitle("Context Menu Error")
      .setColor(`${mConfig.embedColorError}`)
      .addFields({
        name: `menu`,
        value: `${interaction.commandName}`,
      })
      .addFields({
        name: `Run by user`,
        value: `${interaction.user.username}`,
      })
      .setDescription(`**error**\n\`\`\`\n${err.stack}\n\`\`\`\n`)
      .setTimestamp();
    const channel =
      client.channels.cache.get(commandErrorChannel) ||
      client.channels.fetch(commandErrorChannel);
    await channel.send({ embeds: [embed] }).catch(() => {});

    Logger.error(`from contextMenuCmdValidator.js :\n${err.stack}`);
  }
};
