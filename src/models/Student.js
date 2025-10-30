import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String },
    department: { type: String },
    registerNumber: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // ❌ remove "required: true" — optional for Google users
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;
