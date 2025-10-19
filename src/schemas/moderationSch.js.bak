const { model, Schema } = require("mongoose");

let moderationSchema = new Schema(
  { GuildId: String, LogChannelId: String, MuteRoleId: String },
  { strict: false },
);

module.exports = model("moderation", moderationSchema);
