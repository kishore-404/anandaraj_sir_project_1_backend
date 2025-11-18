import express from "express";
import { generateSelfTest, submitSelfTest } from "../controllers/selfTestController.js";
import { protectStudent } from "../middleware/studentAuthMiddleware.js";
import { askDoubt } from "../controllers/studentController.js";
import { handleStudentDoubt } from "../controllers/doubtController.js";
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";

const router = express.Router();



router.post("/subjects/:subjectId/units/:unitId/selftest", protectStudent, generateSelfTest);
router.post("/subjects/:subjectId/units/:unitId/selftest/submit", protectStudent, submitSelfTest);



// POST /api/student/doubt
router.post("/doubt", handleStudentDoubt);

router.put("/update-profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { name, department } = req.body;
    if (!name || !department) {
      return res.status(400).json({ message: "Name and department are required" });
    }

    const student = await Student.findById(decoded.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.name = name;
    student.department = department;
    await student.save();

    res.json({ message: "Profile updated successfully", student });
  } catch (err) {
    console.error("Error updating student profile:", err);
    res.status(500).json({ message: "Server error while updating profile" });
  }
});

export default router;
