import mongoose from "mongoose";

const unitSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    // Link to subject
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    // Uploaded materials
    unitFileUrl: { type: String, required: true }, // Main PDF/PPT file
    unitFileType: { type: String, enum: ["pdf", "ppt", "pptx"], required: true },

    twoMarkFileUrl: { type: String },
    fiveMarkFileUrl: { type: String },
    tenMarkFileUrl: { type: String },

    // AI-generated questions
    generatedTwoMark: [
      {
        q: { type: String },
        a: { type: String },
      },
    ],
    generatedFiveMark: [
      {
        q: { type: String },
        a: { type: String },
      },
    ],
    generatedTenMark: [
      {
        q: { type: String },
        a: { type: String },
      },
    ],

    // Creator reference
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError during hot reload (Nodemon + ESM)
const Unit = mongoose.models.Unit || mongoose.model("Unit", unitSchema);

export default Unit;
