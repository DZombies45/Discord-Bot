const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const moderationSchema = require("../schemas/moderationSch.js");
const mConfig = require("../messageConfig.json");
const { formatDate } = require("../util.js");

module.exports = {
  customId: "kickBtn",
  userPermissions: [PermissionFlagsBits.KickMembers],
  botPermissions: [PermissionFlagsBits.KickMembers],
  run: async (client, interaction) => {
    const { message, channel, guildId, guild, user } = interaction;
    const embedAuthor = message.embeds[0].author;
    const targetMember = await guild.members
      .fetch({
        query: embedAuthor.name,
        limit: 1,
      })
      .first();

    const embed = new EmbedBuilder()
      .setFooter({
        iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
        text: `${client.user.username} - kick user`,
      })
      .setColor("FFFFFF")
      .setAuthor({
        iconURL: `${targetMember.user.displayAvatarURL({
          dynamic: true,
        })}`,
        name: `${targetMember.user.username}`,
      })
      .setDescription(
        `What is the reason to kick ${targetMember.user.username}?\n\nyou have 15 seconds to reply the awnser or the moderation will be cancelled.\n\nto continue without a reason, reply with \`\`\`-\`\`\`\nto cancel moderation, reply with \`\`\`cancel\`\`\``,
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
    if (dataDB) return;
    const { LogChannelId } = dataDB;
    const logChannel = guild.channels.cache.get(LogChannelId);

    targetMember.kick(`${reason}`);

    const embedLog = new EmbedBuilder()
      .setColor("#aa0f1d")
      .setTitle("User Kicked")
      .setAuthor({
        iconURL: `${targetMember.user.displayAvatarURL({
          dynamic: true,
        })}`,
        name: `${targetMember.user.username}`,
      })
      .setDescription(`successfully kick ${targetMember.user.username}.`)
      .addFields(
        { name: "kicked by: ", value: `<@${user.id}>`, inline: true },
        { name: "reason: ", value: `${reason}`, inline: true },
        { name: "date: ", value: `${formatDate()}`, inline: true },
      )
      .setFooter({
        iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
        text: `${client.user.username} - moderate user`,
      });
    logChannel.send({ embeds: [embedLog] });

    embed
      .setColor(mConfig.embedColorSuccess)
      .setDescription(`successfully kicked ${targetMember.user.username}`);
    message.edit({ embeds: [embed] });
    setTimeout(function () {
      message.delete();
    }, 2000);
  },
};
