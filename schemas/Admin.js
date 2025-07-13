const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    passWord: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, default: "admin", immutable: true },
  },
  { collection: "Admins" }
);

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
