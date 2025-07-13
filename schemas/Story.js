const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String },
    category: { type: String },
    photoURLs: [{ type: String }],
    audioURL: { type: String },
  },
  { collection: "Stories" }
);

const Story = mongoose.model("Story", storySchema);
module.exports = Story;
