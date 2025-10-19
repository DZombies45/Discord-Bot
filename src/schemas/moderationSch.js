import { model, Schema } from "mongoose";

let moderationSchema = new Schema(
  { GuildId: String, LogChannelId: String, MuteRoleId: String },
  { strict: false },
);

export default model("moderation", moderationSchema);
