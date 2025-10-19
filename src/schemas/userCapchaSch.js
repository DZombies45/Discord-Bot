import { model, Schema } from "mongoose";

let notifSchema = new Schema({
  GuildId: { type: String, require: true },
  memberId: { type: String, require: true },
  capcha: { type: String, require: true },
  ke: { type: Number, require: true },
});

export default model("user_capcha", notifSchema);
