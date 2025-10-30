// src/routes/subjectRoutes.js
import express from "express";
import {
  createSubject,
  getAllSubjects,
  getSubjectDetails,
  deleteSubjects,
} from "../controllers/subjectController.js";
import {
  createUnit,
  getUnitsBySubject,
  getUnitDetails,
  deleteUnit,
} from "../controllers/unitController.js";
import { generateQuestions } from "../controllers/GenerateQuestions.js";
import upload from "../middleware/uploadMiddleware.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { generateSelfTest } from "../controllers/selfTestController.js";
import { protectStudent } from "../middleware/studentAuthMiddleware.js";

const router = express.Router();

/* ===========================
   SUBJECT ROUTES
=========================== */

// ➕ Create Subject (Admin only)
router.post("/create", protect, adminOnly, createSubject);

// 📜 Get all subjects — accessible by both Admin & Students
router.get("/", protect, getAllSubjects);

// 🔍 Get subject details — accessible by both Admin & Students
router.get("/:subjectId", protect, getSubjectDetails);

// ❌ Delete subject — Admin only
router.delete("/:subjectId", protect, adminOnly, deleteSubjects);

/* ===========================
   UNIT ROUTES (Nested)
=========================== */

// ➕ Create Unit (Admin only with file upload)
router.post(
  "/:subjectId/units/create",
  protect,
  adminOnly,
  upload.fields([
    { name: "unitFile", maxCount: 1 },
    { name: "twoMarkFile", maxCount: 1 },
    { name: "fiveMarkFile", maxCount: 1 },
    { name: "tenMarkFile", maxCount: 1 },
  ]),
  createUnit
);

// 📜 Get units by subject — accessible by both Admin & Students
router.get("/:subjectId/units", protect, getUnitsBySubject);

// 🔍 Get unit details — accessible by both Admin & Students
router.get("/:subjectId/units/:unitId", protect, getUnitDetails);

// ❌ Delete unit — Admin only
router.delete("/:subjectId/units/:unitId", protect, adminOnly, deleteUnit);

// 🧠 Generate Questions — Admin only
router.post("/:subjectId/units/:unitId/generate", protect, adminOnly, generateQuestions);


router.post(
  "/:subjectId/units/:unitId/selftest",
  protectStudent,
  generateSelfTest
);


export default router;
