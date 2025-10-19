const { model, Schema } = require("mongoose");

let mailSchema = new Schema(
  {
    User: String,
    Message: String,
    Guild: String,
    ID: String,
    ChannelId: String,
  },
  { strict: false },
);

module.exports = model("inboxPing", mailSchema);
