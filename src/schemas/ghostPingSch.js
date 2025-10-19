import { model, Schema } from "mongoose";

let moderationSchema = new Schema(
  { GuildId: String, LogChannelId: String, AlsoSendOriginalChannel: Boolean },
  { strict: false },
);

export default model("ghostPing", moderationSchema);
