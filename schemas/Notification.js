// schemas/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Parent", required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["warning", "alert", "info"], default: "warning" },
    createdAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
  },
  { collection: "Notifications" }
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
