const { model, Schema } = require("mongoose");

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

module.exports = model("mcChangelog", mcChangelogSchema);
