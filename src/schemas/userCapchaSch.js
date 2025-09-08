const { model, Schema } = require("mongoose");

let notifSchema = new Schema({
  GuildId: { type: String, require: true },
  memberId: { type: String, require: true },
  capcha: { type: String, require: true },
  ke: { type: Number, require: true },
});

module.exports = model("user_capcha", notifSchema);
