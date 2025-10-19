import { model, Schema } from "mongoose";

let mcChangelogSchema = new Schema(
  {
    type: String,
    version: String,
    thumbnail: String,
    article: {
      id: Number,
      url: String,
      title: String,
      created_at: String,
      updated_at: String,
      edited_at: String,
    },
  },
  { strict: false },
);

export default model("mcChangelog", mcChangelogSchema);
