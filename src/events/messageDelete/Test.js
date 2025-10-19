import { EmbedBuilder, AuditLogEvent } from "discord.js";

export default async (client, message) => {
  const fetchedLogs = await message.guild.fetchAuditLogs({
    type: AuditLogEvent.MessageDelete,
    limit: 1,
  });
  //console.log("test audit");
  //console.log(fetchedLogs.entries.first());
  console.log("message id : ", message.id);
};
