import express from "express";
import { loginAdmin } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", (req, res, next) => {
  console.log("🟢 /api/admin/login hit!");
  next();
}, loginAdmin);

export default router;
