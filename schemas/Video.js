const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    videoPath: { type: String, required: true },
    duration: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { collection: "Videos" }
);

const Video = mongoose.model("Video", videoSchema);
module.exports = Video;
