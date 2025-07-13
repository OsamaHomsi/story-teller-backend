const Parent = require("../schemas/Parent");
const User = require("../schemas/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const tokenkey = "Nvrtx3050$";
const tokenController = require("./tokenController");

// Create Child
exports.createChild = [
  tokenController.verifyToken,
  upload.single("photo"),
  async (req, res) => {
    const { userName, passWord, age } = req.body;
    const photo = req.file;

    try {
      const parent = await Parent.findById(req.user.userId);
      if (!parent) {
        return res.status(400).json({ message: "Invalid parent ID" });
      }

      const hashedPassword = await bcrypt.hash(passWord, 10);
      const newUser = new User({
        userName,
        passWord: hashedPassword,
        parentId: req.user.userId,
        age,
        photo: photo ? photo.path : null,
      });
      await newUser.save();

      res.status(201).json({
        message: "User (child) account created successfully",
      });
    } catch (err) {
      console.error("Error during user creation:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
];

// Child Login
exports.childLogin = async (req, res) => {
  const { email, userName, passWord } = req.body;

  try {
    const parent = await Parent.findOne({ email });
    if (!parent) {
      return res.status(400).json({ message: "Invalid email or user not found" });
    }

    const user = await User.findOne({ parentId: parent._id, userName });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or user not found" });
    }

    const isMatch = await bcrypt.compare(passWord, user.passWord);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, userName: user.userName, parentId: user.parentId, role: user.role },
      tokenkey,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Child login successful",
      token,
    });
  } catch (err) {
    console.error("Error during user login:", err);
    res.status(500).json({ message: "Server error" });
  }
};
//increase child level
exports.increaseChildLevel = async (req, res) => {
  try {
    // Ensure the child is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Use findByIdAndUpdate with $inc operator to increment the level by 1
    const updatedChild = await User.findByIdAndUpdate(
      req.user.userId,
      { $inc: { level: 1 } },
      { new: true } // Return the updated document
    );

    if (!updatedChild) {
      return res.status(404).json({ error: "Child not found" });
    }

    res.status(200).json({
      message: "Level increased successfully",
      level: updatedChild.level,
    });
  } catch (err) {
    console.error("Error increasing child's level:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.getLevel = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Use findByIdAndUpdate with $inc operator to increment the level by 1
    const updatedChild = await User.findById(req.user.userId);

    if (!updatedChild) {
      return res.status(404).json({ error: "Child not found" });
    }

    res.status(200).json({
      message: "Child Level ",
      level: updatedChild.level,
    });
  } catch (err) {
    console.error("Error increasing child's level:", err);
    res.status(500).json({ error: err.message });
  }
};
