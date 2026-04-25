const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user"); // Assuming User is your Mongoose model
const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
  const { rollNumber, name, email, password, confirmPassword, role } = req.body;

  // Check if password matches confirm password
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // Check if the user already exists with the same roll number and role
    const existingUser = await User.findOne({ rollNumber, role });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this role" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      rollNumber,
      name,
      email, // Store email in the database
      password: hashedPassword,
      role,
    });

    // Save the new user to the database
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { rollNumber, password, role } = req.body;

  try {
    const user = await User.findOne({ rollNumber, role });
    if (!user) {
      return res.status(400).json({ message: "User with this role not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", role });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

module.exports = router;
