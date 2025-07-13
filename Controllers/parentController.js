const Parent = require("../schemas/Parent");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenkey = "Nvrtx3050$";

// Parent Signup
exports.signUp = async (req, res) => {
  const { userName, passWord, email } = req.body;

  try {
    const existingUser = await Parent.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(passWord, 10);
    const newUser = new Parent({
      userName,
      passWord: hashedPassword,
      email,
    });
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, userName: newUser.userName, role: newUser.role },
      tokenkey,
      {
        expiresIn: "24h",
      }
    );
    res.status(201).json({
      message: "Parent registered successfully",
      token,
    });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Parent Login
exports.login = async (req, res) => {
  const { email, passWord } = req.body;

  try {
    const user = await Parent.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(passWord, user.passWord);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, userName: user.userName, role: user.role },
      tokenkey,
      {
        expiresIn: "24h",
      }
    );

    res.status(200).json({
      message: "Parent login successful",
      token,
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Server error" });
  }
};
