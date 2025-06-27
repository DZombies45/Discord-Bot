const { EmbedBuilder } = require("discord.js");
const {
  developerId,
  testServerId,
  moderatorRoleId,
  commandErrorChannel,
} = require("../../config.json");
const mConfig = require("../../messageConfig.json");
const getButtons = require("../../utils/getButtons.js");
const { Logger } = require("../../util.js");

module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;
  const buttons = getButtons();

  try {
    const buttonObject = buttons.find(
      (btn) => btn.customId === interaction.customId,
    );
    if (!buttonObject) return;

    if (buttonObject.devOnly) {
      if (!developerId.includes(interaction.member.id)) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.commandDevOnly}`);
        interaction.reply({ embeds: [rEmbed], flags: 64 });
        return;
      }
    }

    if (buttonObject.testMode) {
      if (interaction.guild.id !== testServerId) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.commandTestMode}`);
        interaction.reply({ embeds: [rEmbed], flags: 64 });
        return;
      }
    }

    if (buttonObject.userPermissions?.length) {
      for (const permission of buttonObject.userPermissions) {
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

    if (buttonObject.botPermissions?.length) {
      for (const permission of buttonObject.botPermissions) {
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

    if (interaction.message.interaction) {
      if (interaction.message.interaction.user.id !== interaction.user.id) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.cannottUseButton}`);
        interaction.reply({ embeds: [rEmbed], flags: 64 });
        return;
      }
    }

    await buttonObject.run(client, interaction);
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
      .setTitle("Button Error")
      .setColor(`${mConfig.embedColorError}`)
      .addFields({
        name: `Button`,
        value: `${interaction.customId}`,
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

    Logger.error(`from buttonValidator.js :\n${err.stack}`);
  }
};
