// src/routes/authRoutes.js
import express from "express";
import { registerAdmin, loginAdmin } from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/register-admin
router.post("/register-admin", registerAdmin);

// POST /api/auth/login
router.post("/login", loginAdmin);

// src/routes/authRoutes.js
import express from "express";
import { registerAdmin, loginAdmin } from "../controllers/authController.js";



// POST /api/auth/register-admin
router.post("/register-admin", registerAdmin);

// POST /api/auth/login
router.post("/login", loginAdmin);




export default router;
