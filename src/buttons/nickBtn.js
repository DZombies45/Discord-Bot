import { PermissionFlagsBits, EmbedBuilder } from "discord.js";
import moderationSchema from "../schemas/moderationSch.js";
import mConfig from "../messageConfig.json" with { type: "json" };
import { formatDate, Logger } from "../util.js";

export default {
  customId: "nickBtn",
  userPermissions: [PermissionFlagsBits.ManageUsernames],
  botPermissions: [PermissionFlagsBits.ManageUsernames],
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

    const tag = 1 + Math.random() * 10000;

    const embed = new EmbedBuilder()
      .setFooter({
        iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
        text: `${client.user.username} - nickname user`,
      })
      .setColor("FFFFFF")
      .setAuthor({
        iconURL: `${targetMember.user.displayAvatarURL({
          dynamic: true,
        })}`,
        name: `${targetMember.user.username}`,
      })
      .setDescription(
        `What is the reason to change ${targetMember.user.username}'s' name?\n\nyou have 15 seconds to reply the awnser or the moderation will be cancelled.\n\nto continue without a reason, reply with \`\`\`-\`\`\`\nto cancel moderation, reply with \`\`\`cancel\`\`\``,
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
      await targetMember.setNickname(`user-${tag}`);
    } catch (e) {
      embed
        .setColor(mConfig.embedColorError)
        .setDescription(`failed to rename ${targetMember.user.username}: bot may be missing permissions.`);
      message.edit({ embeds: [embed] });
      return;
    }

    const embedLog = new EmbedBuilder()
      .setColor("#aa0f1d")
      .setTitle("User Name Moderated")
      .setAuthor({
        iconURL: `${targetMember.user.displayAvatarURL({
          dynamic: true,
        })}`,
        name: `${targetMember.user.username}`,
      })
      .setDescription(`successfully rename ${targetMember.user.username}.`)
      .addFields(
        { name: "changed by: ", value: `<@${user.id}>`, inline: true },
        { name: "change to: ", value: `user-${tag}`, inline: true },
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
      .setDescription(`successfully rename ${targetMember.user.username}`);
    message.edit({ embeds: [embed] });
    setTimeout(function () {
      message.delete();
    }, 2000);
  },
};
