const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const verifySchema = require("../../schemas/verificationSch.js");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verification_setup")
    .setDescription("[admin] setup the verification")
    .addSubcommand((sub) =>
      sub
        .setName("configure")
        .setDescription("[admin] configure verification system on the server")
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("channel for verify")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText),
        )
        .addRoleOption((opt) =>
          opt
            .setName("role")
            .setDescription("role given to verified member")
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName("max_try")
            .setDescription("max amount of try before kick")
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("[admin] remove verification system on the server"),
    )
    .toJSON(),
  userPermissions: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.ManageRoles],
  devOnly: true,
  deleted: false,
  run: async (client, interaction) => {
    const { options, guildId, guild } = interaction;
    const subCmd = options.getSubcommand();
    if (!["configure", "remove"].includes(subCmd)) return;

    const embed = new EmbedBuilder().setFooter({
      iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
      text: `${client.user.username} - verification system`,
    });

    const verifyEmbed = new EmbedBuilder()
      .setDescription(
        `# verify me\n\`\`\` \`\`\`\n> press the button below to start`,
      )
      .setFooter({
        iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
        text: `${client.user.username}'s verification`,
      });
    const button = new ActionRowBuilder().setComponents(
      new ButtonBuilder()
        .setCustomId("verifyBtn")
        .setLabel("Verify")
        .setStyle(ButtonStyle.Danger),
    );

    switch (subCmd) {
      case "configure":
        const verifyChannel = options.getChannel("channel");
        const verifyRole = options.getRole("role");
        const maxTry = options.getInteger("max_try");
        let dataDB = await verifySchema.findOne({
          GuildId: guildId,
        });

        if (!dataDB) {
          embed
            .setColor(mConfig.embedColorWarning)
            .setDescription(
              "new server detected: creating verification system...",
            );
          await interaction.reply({
            embeds: [embed],
            fetchReply: true,
            flags: 64,
          });

          dataDB = new verifySchema({
            GuildId: guildId,
            role: verifyRole,
            channelId: verifyChannel,
            limitKe: maxTry,
          });
          await dataDB.save();

          embed
            .setColor(mConfig.embedColorSuccess)
            .setDescription("verification system successfuly created.")
            .addFields({
              name: "verify channel",
              value: `<#${verifyChannel.id}>`,
              inline: true,
            })
            .addFields({
              name: "verify role",
              value: `${verifyRole.id}`,
              inline: true,
            })
            .addFields({
              name: "max try",
              value: `${maxTry}`,
              inline: true,
            });
          setTimeout(async () => {
            await interaction.editReply({
              embeds: [embed],
              flags: 64,
            });
          }, 1000);
        } else {
          await verifySchema.findOneAndUpdate(
            { GuildId: guildId },
            {
              role: verifyRole.id,
              channelId: verifyChannel.id,
              limitKe: maxTry,
            },
          );
          embed
            .setColor(mConfig.embedColorSuccess)
            .setDescription("verification system successfuly edited.")
            .addFields({
              name: "verify channel",
              value: `<#${verifyChannel.id}>`,
              inline: true,
            })
            .addFields({
              name: "verify role",
              value: `${verifyRole}`,
              inline: true,
            })
            .addFields({
              name: "max try",
              value: `${maxTry}`,
              inline: true,
            });
          await interaction.reply({
            embeds: [embed],
            flags: 64,
          });
        }
        await verifyChannel.send({
          embeds: [verifyEmbed],
          components: [button],
        });
        break;
      case "remove":
        const removed = await verifySchema.findOneAndDelete({
          GuildId: guildId,
        });

        if (removed) {
          embed
            .setColor(mConfig.embedColorSuccess)
            .setDescription(
              "verification system successfuly deleted from this server.",
            );
        } else {
          embed
            .setColor(mConfig.embedColorError)
            .setDescription(
              "verification system is not configured for this server.",
            );
        }
        await interaction.reply({ embeds: [embed], flags: 64 });
        break;

      default:
        await interaction.reply({
          content: "unkown command",
          flags: 64,
        });
    }
  },
};
