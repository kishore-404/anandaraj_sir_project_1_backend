// src/controllers/subjectController.js
import Subject from "../models/Subject.js";
import Unit from "../models/Unit.js";
import fs from "fs";
import path from "path";
// 🎯 Create a new subject
export const createSubject = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    const existing = await Subject.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Subject already exists" });
    }

    const subject = await Subject.create({
      name,
      code,
      description,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Subject created successfully",
      subject,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating subject" });
  }
};

// 📚 Get all subjects
export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: -1 });
    res.json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching subjects" });
  }
};


// 🧾 Get single subject with its units (already exists)
export const getSubjectDetails = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const subject = await Subject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const units = await Unit.find({ subject: subjectId }).sort({ createdAt: -1 });

    res.json({
      subject,
      units,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching subject details" });
  }
};

// ❌ Delete Subject (and its units)
export const deleteSubjects = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Find all units under the subject
    const units = await Unit.find({ subject: subjectId });

    // Delete each unit file
    for (const unit of units) {
      if (unit.fileUrl) {
        const filePath = path.join(process.cwd(), unit.fileUrl);
        fs.unlink(filePath, (err) => {
          if (err) console.log("⚠️ Could not delete file:", filePath);
        });
      }
    }

    // Delete units first
    await Unit.deleteMany({ subject: subjectId });

    // Delete the subject
    await Subject.findByIdAndDelete(subjectId);

    res.json({ message: "Subject and its units deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting subject" });
  }
};