import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const createAdmin = async () => {
  try {
    const existing = await User.findOne({ userId: "admin123" });
    if (existing) {
      console.log("Admin already exists ✅");
      process.exit();
    }

    const admin = await User.create({
      name: "Admin",
      userId: "admin123",
      password: "Admin@123",
      role: "admin",
    });

    console.log("✅ Admin created:", admin);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
