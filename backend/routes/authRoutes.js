const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Generate JWT
// const generateToken = (userId) => {
//   return jwt.sign(
//     { userId }, // This creates a payload with "userId" property
//     process.env.JWT_SECRET,
//     { expiresIn: '7d' }
//   );
// };
const generateToken = (userId) => {
  return jwt.sign(
    { userId: userId.toString() }, // Ensure it's a string
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};
// Check database connection before handling requests
const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(500).json({ 
      message: "Database not connected",
      error: "Please try again later" 
    });
  }
  next();
};

// Register
router.post("/register", checkDBConnection, async (req, res) => {
  const { name, email, password } = req.body;

  // Input validation
  if (!name || !email || !password) {
    return res.status(400).json({ 
      message: "Please provide name, email, and password" 
    });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
});

// Login
router.post("/login", checkDBConnection, async (req, res) => {
  const { email, password } = req.body;
  
  // Input validation
  if (!email || !password) {
    return res.status(400).json({ 
      message: "Please provide email and password" 
    });
  }

  console.log('Login attempt:', { email });
  
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await user.matchPassword(password);
    
    if (isPasswordValid) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      console.log("Invalid password");
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
});


// Add this to your auth routes file
router.get("/debug-token", async (req, res) => {
  try {
    // Test token generation
    const testUserId = "test-user-id"; // Use a real user ID from your DB for testing
    const token = generateToken(testUserId);
    
    console.log("Generated token:", token);
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    
    // Test token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    
    res.json({
      generatedToken: token,
      secret: process.env.JWT_SECRET ? "Present" : "Missing",
      decoded: decoded
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;