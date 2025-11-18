// src/controllers/adminController.js
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import Unit from "../models/Unit.js";
import File from "../models/File.js";
import Student from "../models/Student.js";


// 👑 Get Admin Dashboard Summary
export const getAdminDashboard = async (req, res) => {
  try {
    // Count collections
    const totalSubjects = await Subject.countDocuments();
    const totalUnits = await Unit.countDocuments();
    const totalFiles = await File.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });

    res.json({
      admin: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role,
      },
      stats: {
        totalSubjects,
        totalUnits,
        totalFiles,
        totalStudents,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error loading dashboard" });
  }
};

// ✅ Get all registered students (for admin dashboard)
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({}, "-password -__v").sort({ createdAt: -1 }); // exclude password & __v
    res.status(200).json(students);
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    res.status(500).json({ message: "Failed to fetch students", error: err.message });
  }
};


