const Notification = require("../schemas/Notification");
const User = require("../schemas/User");

exports.createNotification = async (req, res) => {
  try {
    // Ensure the request is being made by an authenticated child.
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { message, type } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Notification message is required" });
    }

    // Fetch child details to get parent's ID.
    const child = await User.findById(req.user.userId);
    if (!child) {
      return res.status(404).json({ error: "Child not found" });
    }

    // Create the notification. You can extend this logic to include more details if needed.
    const notification = new Notification({
      childId: child._id,
      parentId: child.parentId,
      message,
      type: type || "warning",
    });

    await notification.save();
    res.status(201).json({ message: "Notification created", notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// controllers/notificationController.js
exports.getNotificationsForParent = async (req, res) => {
  try {
    // Ensure the parent is authenticated.
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Fetch notifications and populate the child's username.
    const notifications = await Notification.find({ parentId: req.user.userId })
      .populate("childId", "userName") // Only include the 'userName' field from the child document.
      .sort({ createdAt: -1 });

    res.status(200).json({ notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
