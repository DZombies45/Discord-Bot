import { model, Schema } from "mongoose";

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

export default model("inboxPing", mailSchema);
