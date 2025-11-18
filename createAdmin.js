// src/scripts/createAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const adminExists = await User.findOne({ role: "developer" });
    if (adminExists) {
      console.log("⚠️ Admin already exists:", adminExists.userId);
      process.exit();
    }

    const admin = new User({
      name: "developer",
      userId: "23-UCS-001", // you can change this
      password: "29082004", // will be hashed automatically
      role: "admin",
    });

    await admin.save();
    console.log("✅ Admin user created successfully!");
    console.log("Login credentials:");
    console.log("User ID:", admin.userId);
    console.log("Password: 29082004");

    process.exit();
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
