// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Student from "../models/Student.js";



// ✅ General authentication middleware
export const authMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.error("❌ Token verification failed:", error);
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  } else {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};

export const protectStudent = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const student = await Student.findById(decoded.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    req.student = student;
    next();
  } catch (err) {
    console.error("protectStudent error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ✅ Generic protect middleware (works for both Admin & Student)
export const protect = async (req, res, next) => {
  try {
    let token;

    // ✅ Extract token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Try Admin first
    let user = await User.findById(decoded.id).select("-password");

    // ✅ If not found, try Student
    if (!user) {
      user = await Student.findById(decoded.id).select("-password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Protect middleware error:", error.message);
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

// ✅ Admin-only route protection
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied — Admins only." });
  }
};