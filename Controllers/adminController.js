const Admin = require("../schemas/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenkey = "Nvrtx3050$";

// Admin Signup
exports.adminSignUp = async (req, res) => {
  const { userName, passWord, email } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(passWord, 10);
    const newAdmin = new Admin({
      userName,
      passWord: hashedPassword,
      email,
    });
    await newAdmin.save();

    const token = jwt.sign(
      { adminId: newAdmin._id, userName: newAdmin.userName, role: newAdmin.role },
      tokenkey,
      {
        expiresIn: "24h",
      }
    );
    res.status(201).json({
      message: "Admin registered successfully",
      token,
    });
  } catch (err) {
    console.error("Error during admin signup:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  const { email, passWord } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(passWord, admin.passWord);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { adminId: admin._id, userName: admin.userName, role: admin.role },
      tokenkey,
      {
        expiresIn: "24h",
      }
    );

    res.status(200).json({
      message: "Admin login successful",
      token,
    });
  } catch (err) {
    console.error("Error during admin login:", err);
    res.status(500).json({ message: "Server error" });
  }
};
