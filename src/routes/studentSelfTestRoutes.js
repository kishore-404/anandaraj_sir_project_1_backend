import express from "express";
import { generateSelfTest } from "../controllers/selfTestController.js";
import { protectStudent } from "../middleware/studentAuthMiddleware.js";

const router = express.Router();

// ✅ POST route for generating self test
router.post(
  "/subjects/:subjectId/units/:unitId/selftest",
  protectStudent,
  generateSelfTest
);

export default router;
