const { model, Schema } = require("mongoose");

let moderationSchema = new Schema(
  { GuildId: String, memberId: String, reason: String, endTime: Number },
  { strict: false },
);

module.exports = model("tempban", moderationSchema);
