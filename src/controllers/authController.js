// src/controllers/authController.js
import User from "../models/User.js";
import { generateToken } from "../utils/GenerateToken.js";



// 🧱 Register Admin (for first setup only)
export const registerAdmin = async (req, res) => {
  try {
    const { name, userId, password } = req.body;

    const existing = await User.findOne({ userId });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const user = await User.create({
      name,
      userId,
      password,
      role: "admin",
    });

    res.status(201).json({
      message: "Admin created successfully",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔑 Login Admin
export const loginAdmin = async (req, res) => {
  try {
    const { userId, password } = req.body;

    const user = await User.findOne({ userId });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
