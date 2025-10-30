import express from "express";
const router = express.Router();
import { getAdminDashboard } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
// import { getAllStudents } from "../controllers/adminController.js";



// GET /api/admin/dashboard
router.get("/dashboard", protect, adminOnly, getAdminDashboard);

// router.get("/students", protect,adminOnly, getAllStudents);

export default router;


