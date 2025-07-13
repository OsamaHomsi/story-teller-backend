const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    passWord: { type: String, required: true },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      required: true,
    },
    age: { type: Number, required: true },
    photo: { type: String },
    favoriteStories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Story" }],
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    stories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Story" }],
    level: { type: Number, default: 1 },
    role: { type: String, default: "child", immutable: true },
  },
  { collection: "Users" }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
