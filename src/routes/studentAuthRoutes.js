import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// 🔹 Step 1: Google login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// 🔹 Step 2: Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/student/login" }),
  async (req, res) => {
    try {
      const student = req.user;
      if (!student) {
        return res.redirect(`${process.env.FRONTEND_URL}/student/login?error=auth_failed`);
      }

      // Generate JWT
      const token = jwt.sign({ id: student._id, role: "student" }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });

      // ✅ Redirect back to LOGIN PAGE (so we can extract & store token properly)
      res.redirect(`${process.env.FRONTEND_URL}/student/login?token=${token}`);
    } catch (err) {
      console.error("Error during Google callback:", err);
      res.redirect(`${process.env.FRONTEND_URL}/student/login?error=server_error`);
    }
  }
);

// 🔹 Step 3: Authenticated student info
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const student = await Student.findById(decoded.id).select("-__v");
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json(student);
  } catch (err) {
    console.error("Error in /me:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

export default router;
