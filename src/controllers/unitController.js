import Unit from "../models/Unit.js";
import Subject from "../models/Subject.js";
import fs from "fs";
import path from "path";

// 📜 Get all units under a subject
export const getUnitsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const units = await Unit.find({ subject: subjectId }).sort({ createdAt: -1 });
    res.json(units);
  } catch (error) {
    res.status(500).json({ message: "Error fetching units" });
  }
};

// 📄 Get specific unit details
export const getUnitDetails = async (req, res) => {
  try {
    const { unitId } = req.params;
    const unit = await Unit.findById(unitId).populate("subject", "name code");
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    res.json(unit);
  } catch (error) {
    res.status(500).json({ message: "Error fetching unit details" });
  }
};

// ➕ Create a Unit with multiple file uploads
export const createUnit = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { title, description } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    if (!req.files || !req.files.unitFile) {
      return res.status(400).json({ message: "Main unit file is required" });
    }

    const unitFile = req.files.unitFile[0];
    const unitFileUrl = `/uploads/${unitFile.filename}`; // ✅ fixed path
    const unitFileType = path.extname(unitFile.originalname).substring(1);

    const unit = await Unit.create({
      title,
      description,
      subject: subjectId,
      unitFileUrl,
      unitFileType,
      twoMarkFileUrl: req.files.twoMarkFile
        ? `/uploads/${req.files.twoMarkFile[0].filename}`
        : null,
      fiveMarkFileUrl: req.files.fiveMarkFile
        ? `/uploads/${req.files.fiveMarkFile[0].filename}`
        : null,
      tenMarkFileUrl: req.files.tenMarkFile
        ? `/uploads/${req.files.tenMarkFile[0].filename}`
        : null,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Unit created successfully", unit });
  } catch (error) {
    console.error("❌ Error in createUnit:", error);
    res.status(500).json({ message: "Error creating unit" });
  }
};

// ❌ Delete a specific unit
export const deleteUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    const unit = await Unit.findById(unitId);

    if (!unit) return res.status(404).json({ message: "Unit not found" });

    const filePath = path.join(process.cwd(), unit.unitFileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.log("⚠️ Could not delete file:", filePath);
      });
    }

    await Unit.findByIdAndDelete(unitId);
    res.json({ message: "Unit deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting unit" });
  }
};

export const getUnitById = async (req, res) => {
  try {
    const { subjectId, unitId } = req.params;
    const unit = await Unit.findById(unitId)
      .populate("subject", "name code");

    if (!unit) return res.status(404).json({ message: "Unit not found" });

    res.json({
      _id: unit._id,
      title: unit.title,
      description: unit.description,
      unitFileUrl: unit.unitFileUrl,
      twoMarkFileUrl: unit.twoMarkFileUrl,
      fiveMarkFileUrl: unit.fiveMarkFileUrl,
      tenMarkFileUrl: unit.tenMarkFileUrl,
      generatedTwoMark: unit.generatedTwoMark || [],
      generatedFiveMark: unit.generatedFiveMark || [],
      generatedTenMark: unit.generatedTenMark || [],
      subject: unit.subject,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching unit", error: err.message });
  }
};
