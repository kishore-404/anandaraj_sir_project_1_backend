import express from "express";
import { createUnit, getUnitsBySubject } from "../controllers/unitController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Create Unit
router.post("/create", protect, adminOnly, createUnit);

// ✅ Get Units by Subject
router.get("/:subjectId", protect, adminOnly, getUnitsBySubject);

export default router;
