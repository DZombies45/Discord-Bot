import { model, Schema } from "mongoose";

let moderationSchema = new Schema(
  { GuildId: String, memberId: String, reason: String, endTime: Number },
  { strict: false },
);

export default model("tempban", moderationSchema);
