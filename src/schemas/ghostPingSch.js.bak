const { model, Schema } = require("mongoose");

let moderationSchema = new Schema(
  { GuildId: String, LogChannelId: String, AlsoSendOriginalChannel: Boolean },
  { strict: false },
);

module.exports = model("ghostPing", moderationSchema);
