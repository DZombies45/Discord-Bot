import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import afkSchema from "../../schemas/afkSch.js";

export default {
  data: new SlashCommandBuilder()
    .setName("afk")
    .setDescription("Set or remove your AFK status")
    .addSubcommand((sub) =>
      sub
        .setName("set")
        .setDescription("Set your AFK status")
        .addStringOption((opt) =>
          opt
            .setName("reason")
            .setDescription("Reason for going AFK")
            .setRequired(false),
        ),
    )
    .addSubcommand((sub) =>
      sub.setName("remove").setDescription("Remove your AFK status"),
    )
    .toJSON(),
  deleted: false,
  devOnly: false,
  modOnly: false,
  userPermissions: [],
  botPermissions: [],
  run: async (client, interaction) => {
    const { options, user, guild } = interaction;

    const sub = options.getSubcommand();
    const reason = options.getString("reason") || "No reason provided.";

    if (sub === "set") {
      await afkSchema.findOneAndUpdate(
        { userId: user.id, guildId: guild.id },
        { reason, timestamp: Date.now() },
        { upsert: true },
      );

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${user.username} is now AFK 💤`,
          iconURL: user.displayAvatarURL(),
        })
        .setDescription(`**Reason:** ${reason}`)
        .setColor("Blue")
        .setFooter({
          text: client.user.username,
          iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (sub === "remove") {
      const data = await afkSchema.findOne({
        userId: user.id,
        guildId: guild.id,
      });

      if (!data) {
        return interaction.reply({
          content: "You are not AFK!",
          flags: MessageFlags.Ephemeral,
        });
      }

      await afkSchema.deleteOne({ userId: user.id, guildId: guild.id });

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${user.username} is no longer AFK ✅`,
          iconURL: user.displayAvatarURL(),
        })
        .setColor("Green")
        .setFooter({
          text: client.user.username,
          iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
