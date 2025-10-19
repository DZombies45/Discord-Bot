const { model, Schema } = require("mongoose");

let notifSchema = new Schema(
  {
    GuildId: { type: String, require: true },
    channelId: { type: String, require: true },
    ytId: { type: String, require: true },
    message: { type: String, require: true },
    lastChaked: { type: Date, require: true },
    lastVid: {
      type: {
        id: { type: String, require: true },
        pubDate: { type: Date, require: true },
      },
      require: false,
    },
  },
  { timetamps: true },
);

module.exports = model("yt_notification", notifSchema);
