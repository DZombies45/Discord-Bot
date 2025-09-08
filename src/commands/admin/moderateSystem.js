const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
} = require("discord.js");
const moderationSchema = require("../../schemas/moderationSch.js");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("moderate_setup")
    .setDescription("[admin] setup the moderation")
    .addSubcommand((sub) =>
      sub
        .setName("configure")
        .setDescription("[mod] configure moderation system on the server")
        .addChannelOption((opt) =>
          opt
            .setName("log_channel")
            .setDescription("channel to send a log to")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText),
        )
        .addRoleOption((opt) =>
          opt
            .setName("mute_role")
            .setDescription("role given to muted member")
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("[mod] remove moderation system on the server"),
    )
    .toJSON(),
  userPermissions: [PermissionFlagsBits.Administrator],
  botPermissions: [],
  devOnly: true,
  run: async (client, interaction) => {
    const { options, guildId, guild } = interaction;
    const subCmd = options.getSubcommand();
    if (!["configure", "remove"].includes(subCmd)) return;

    const embed = new EmbedBuilder().setFooter({
      iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
      text: `${client.user.username} - moderation system`,
    });

    switch (subCmd) {
      case "configure":
        const logChannel = options.getChannel("log_channel");
        const muteRole = options.getRole("mute_role");
        let dataDB = await moderationSchema.findOne({
          GuildId: guildId,
        });
        if (!dataDB) {
          embed
            .setColor(mConfig.embedColorWarning)
            .setDescription(
              "new server detected: creating moderation system...",
            );
          await interaction.reply({
            embeds: [embed],
            fetchReply: true,
            flags: 64,
          });

          dataDB = new moderationSchema({
            GuildId: guildId,
            LogChannelId: logChannel.id,
            MuteRoleId: muteRole.id,
          });
          await dataDB.save();

          embed
            .setColor(mConfig.embedColorSuccess)
            .setDescription("moderation system successfuly created.")
            .addFields({
              name: "log channel",
              value: `${logChannel}`,
              inline: true,
            })
            .addFields({
              name: "mute role",
              value: `${muteRole}`,
              inline: true,
            });
          setTimeout(() => {
            interaction.editReply({
              embeds: [embed],
              flags: 64,
            });
          }, 2000);
        } else {
          await moderationSchema.findOneAndUpdate(
            { GuildId: guildId },
            { LogChannelId: logChannel.id, MuteRoleId: muteRole.id },
          );
          embed
            .setColor(mConfig.embedColorSuccess)
            .setDescription("moderation system successfuly edited.")
            .addFields({
              name: "log channel",
              value: `${logChannel}`,
              inline: true,
            })
            .addFields({
              name: "mute role",
              value: `${muteRole}`,
              inline: true,
            });
          interaction.reply({ embeds: [embed], flags: 64 });
        }
        break;
      case "remove":
        const removed = await moderationSchema.findOneAndDelete({
          GuildId: guildId,
        });

        if (removed) {
          embed
            .setColor(mConfig.embedColorSuccess)
            .setDescription(
              "moderation system successfuly deleted from this server.",
            );
        } else {
          embed
            .setColor(mConfig.embedColorError)
            .setDescription(
              "moderation system is not configured for this server.",
            );
        }
        interaction.reply({ embeds: [embed], flags: 64 });
        break;

      default:
        interaction.reply({
          content: "unkown command",
          flags: 64,
        });
    }
  },
};
