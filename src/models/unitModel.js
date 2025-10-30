// src/models/unitModel.js
import mongoose from "mongoose";

const qaSchema = new mongoose.Schema({
  q: String,
  a: String,
});

const selfTestSchema = new mongoose.Schema({
  mcq: [
    {
      q: String,
      options: [String],
      answer: String, // correct answer
    },
  ],
  fillups: [
    {
      q: String,
      answer: String,
    },
  ],
  twoMark: [
    {
      q: String,
      answer: String,
    },
  ],
  generatedAt: Date,
});

const unitSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    unitFileUrl: { type: String, required: true },
    unitFileType: { type: String, enum: ["pdf", "ppt", "pptx"], required: true },
    twoMarkFileUrl: String,
    fiveMarkFileUrl: String,
    tenMarkFileUrl: String,
    generatedTwoMark: [qaSchema],
    generatedFiveMark: [qaSchema],
    generatedTenMark: [qaSchema],
    selfTest: selfTestSchema,         // <-- new
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Unit = mongoose.models.Unit || mongoose.model("Unit", unitSchema);
export default Unit;
