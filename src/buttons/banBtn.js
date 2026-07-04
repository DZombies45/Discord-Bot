import { PermissionFlagsBits, EmbedBuilder } from "discord.js";
import moderationSchema from "../schemas/moderationSch.js";
import jsonMessageConfig from "../messageConfig.json" with { type: "json" };
const { mConfig } = jsonMessageConfig;
import { formatDate } from "../util.js";
import Config from "../config.json" with { type: "json" };
import getAppCommand from "../utils/getAppCommands.js";

export default {
  customId: "banBtn",
  userPermissions: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
  run: async (client, interaction) => {
    const { message, channel, guildId, guild, user } = interaction;
    const embedAuthor = message.embeds[0].author;

    const targetMembers = await guild.members.fetch({
      query: embedAuthor.name,
      limit: 1,
    });
    const targetMember = targetMembers.first();
    if (!targetMember) {
      return interaction.reply({
        content: "❗ Could not find that member (they may have left the server).",
        flags: 64,
      });
    }

    const unbanCmdObj = await getAppCommand(client, Config.testServerId);
    const unbanCmd = unbanCmdObj.cache.find((cmd) => cmd.name === "unban");
    const unbanCmdId = unbanCmd?.id ?? null;

    const embed = new EmbedBuilder()
      .setFooter({
        iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
        text: `${client.user.username} - ban user`,
      })
      .setColor("FFFFFF")
      .setAuthor({
        iconURL: `${targetMember.user.displayAvatarURL({
          dynamic: true,
        })}`,
        name: `${targetMember.user.username}`,
      })
      .setDescription(
        `What is the reason to ban ${targetMember.user.username}?\n\nyou have 15 seconds to reply the awnser or the moderation will be cancelled.\n\nto continue without a reason, reply with \`\`\`-\`\`\`\nto cancel moderation, reply with \`\`\`cancel\`\`\``,
      );
    message.edit({ embeds: [embed], components: [] });

    const filter = (m) => m.author.id === user.id;

    const reasonCollector = await channel
      .awaitMessages({
        filter,
        max: 1,
        time: 15000,
        errors: ["time"],
      })
      .then((reason) => {
        if (reason.first().content.toLowerCase() === "cancel") {
          reason.first().delete();
          embed
            .setColor(mConfig.embedColorError)
            .setDescription("moderation cancelled");
          message.edit({ embeds: [embed] });
          setTimeout(function () {
            message.delete();
          }, 2000);
          return;
        }
        return reason;
      })
      .catch(() => {
        embed
          .setColor(mConfig.embedColorError)
          .setDescription("moderation cancelled");
        message.edit({ embeds: [embed] });
        setTimeout(function () {
          message.delete();
        }, 2000);
        return;
      });

    const reasonObj = reasonCollector?.first();
    if (!reasonObj) return;
    let reason = reasonObj.content;
    if (reasonObj.content === "-") reason = "no reason specified";
    reasonObj.delete();

    let dataDB = await moderationSchema.findOne({
      GuildId: guildId,
    });
    if (!dataDB) {
      embed
        .setColor(mConfig.embedColorError)
        .setDescription("moderation system is not configured for this server.");
      message.edit({ embeds: [embed], components: [] });
      return;
    }
    const { LogChannelId } = dataDB;
    const logChannel = guild.channels.cache.get(LogChannelId);

    try {
      await targetMember.ban({
        reason: `${reason}`,
        deleteMessageSeconds: 60 * 60 * 24 * 7,
      });
    } catch (e) {
      embed
        .setColor(mConfig.embedColorError)
        .setDescription(`failed to ban ${targetMember.user.username}: bot may be missing permissions.`);
      message.edit({ embeds: [embed] });
      return;
    }

    const embedLog = new EmbedBuilder()
      .setColor("#962abd")
      .setTitle("User Banned")
      .setAuthor({
        iconURL: `${targetMember.user.displayAvatarURL({
          dynamic: true,
        })}`,
        name: `${targetMember.user.username}`,
      })
      .setDescription(
        `successfully ban ${targetMember.user.username}.${
          unbanCmdId
            ? `\n\nto unban type </unban:${unbanCmdId}>`
            : `\n\nuse /unban ${targetMember.user.id} to unban.`
        }`,
      )
      .addFields(
        { name: "banned by: ", value: `<@${user.id}>`, inline: true },
        { name: "reason: ", value: `${reason}`, inline: true },
        { name: "date: ", value: `${formatDate()}`, inline: true },
      )
      .setFooter({
        iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
        text: `${client.user.username} - moderate user`,
      });
    if (logChannel) logChannel.send({ embeds: [embedLog] }).catch(() => null);

    embed
      .setColor(mConfig.embedColorSuccess)
      .setDescription(`successfully banned ${targetMember.user.username}`);
    message.edit({ embeds: [embed] });
    setTimeout(function () {
      message.delete();
    }, 2000);
  },
};
