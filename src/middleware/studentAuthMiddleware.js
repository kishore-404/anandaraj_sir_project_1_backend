import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import dotenv from "dotenv";

dotenv.config();


export const protectStudent = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.student = await Student.findById(decoded.id);
    if (!req.student)
      return res.status(404).json({ message: "Student not found" });
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
