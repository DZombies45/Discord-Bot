import { model, Schema } from "mongoose";

let mailSchema = new Schema(
  {
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    reason: { type: String, default: "No reason provided." },
    timestamp: { type: Number, default: Date.now },
  },
  { strict: false },
);

export default model("afk", mailSchema);
