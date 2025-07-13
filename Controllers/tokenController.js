require("dotenv").config();
const jwt = require("jsonwebtoken");
const tokenkey = process.env.TOKEN_KEY;

exports.verifyToken = (req, res, next) => {
  try {
    // Check if the Authorization header is present
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    // Extract and verify the token
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, tokenkey);
    req.user = decoded; // Attach decoded data (like role, id) to the request object
    next(); // Pass control to the next middleware
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};
