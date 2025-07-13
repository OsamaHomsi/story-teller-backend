const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    passWord: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, default: "parent", immutable: true },
  },
  {
    collation: { locale: "en", strength: 2 },
  }
);

const Parent = mongoose.model("Parent", parentSchema);
module.exports = Parent;
