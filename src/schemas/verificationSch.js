const { model, Schema } = require("mongoose");

let notifSchema = new Schema({
  GuildId: { type: String, require: true },
  role: { type: String, require: true },
  channelId: { type: String, require: true },
  limitKe: { type: Number, require: true },
});

module.exports = model("verification", notifSchema);
