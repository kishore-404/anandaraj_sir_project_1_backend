import express from "express";
import Student from "../models/Student.js"; // ✅ Corrected import
import { getAdminDashboard, getAllStudents } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";


const router = express.Router();

// GET /api/admin/dashboard
router.get("/dashboard", protect, adminOnly, getAdminDashboard);

// GET all students
router.get("/students", protect, adminOnly, getAllStudents);

// DELETE a student by ID
router.delete("/students/:id", protect, adminOnly, async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await Student.findByIdAndDelete(studentId);

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const logs = await AdminLog.find()
      .populate("admin", "name email") // Populates the admin's name & email
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});



export default router;
