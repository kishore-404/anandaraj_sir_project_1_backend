import fs from "fs";
import path from "path";
import textract from "textract";
import pdfParse from "pdf-parse-fixed";
import mammoth from "mammoth";
import Unit from "../models/Unit.js";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateQuestions = async (req, res) => {
  try {
    const { subjectId, unitId } = req.params;

    // 1️⃣ Validate unit
    const unit = await Unit.findById(unitId);
    if (!unit || !unit.unitFileUrl) {
      return res.status(404).json({ message: "Unit file not found" });
    }

    const uploadBasePath = path.resolve();
    const relativePath = unit.unitFileUrl.startsWith("/")
      ? unit.unitFileUrl.slice(1)
      : unit.unitFileUrl;
    const filePath = path.join(uploadBasePath, relativePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: `File not found at: ${filePath}` });
    }

    // 2️⃣ Extract text
    const ext = path.extname(filePath).toLowerCase();
    let text = "";

    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    } else if (ext === ".docx" || ext === ".doc") {
      const dataBuffer = fs.readFileSync(filePath);
      const { value } = await mammoth.extractRawText({ buffer: dataBuffer });
      text = value;
    } else if ([".pptx", ".ppt", ".txt"].includes(ext)) {
      text = await new Promise((resolve, reject) => {
        textract.fromFileWithPath(filePath, (err, extractedText) => {
          if (err) return reject(err);
          resolve(extractedText);
        });
      });
    } else {
      return res.status(400).json({ message: `Unsupported file type: ${ext}` });
    }

    if (!text || text.trim().length < 100) {
      return res.status(400).json({ message: "File doesn't have enough readable content" });
    }

    // 3️⃣ Build prompt
   const prompt = `
You are an expert university exam question generator.

From the provided study material, generate exam questions in **three categories** with the following counts and answer lengths:

1️⃣ **Two-mark questions** — Generate **10 to 20** short questions (2–3 line answers).  
2️⃣ **Five-mark questions** — Generate **10 to 15** medium-length questions (8–10 line answers).  
3️⃣ **Ten-mark questions** — Generate **5 to 10** long, detailed questions (70–90 line structured paragraph with points answers).

Ensure:
- All questions are **relevant**, **non-repetitive**, and **based strictly on the provided content**.
- Each answer should be **concise, factual, and clear**.
- Output should be **valid JSON only**, no extra explanations or markdown.

 **Content to study from:**
${text.slice(0, 7000)}

 **Output format (JSON only):**
{
  "twoMark": [
    { "q": "Question 1", "a": "Answer 1" }
  ],
  "fiveMark": [
    { "q": "Question 1", "a": "Answer 1" }
  ],
  "tenMark": [
    { "q": "Question 1", "a": "Answer 1" }
  ]
}

Do not include any extra commentary, explanations, or text outside the JSON.
`;


    // 🕐 Small delay to avoid OpenAI rate limit
    await new Promise((resolve) => setTimeout(resolve, 25000)); // 25 seconds

    // 4️⃣ Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const aiText = response.choices[0].message.content.trim();

    let parsedOutput;
    try {
      parsedOutput = JSON.parse(aiText);
    } catch (err) {
      console.error("⚠️ JSON parse failed:", aiText);
      parsedOutput = {
        twoMark: [{ q: "Error parsing AI output", a: aiText }],
        fiveMark: [],
        tenMark: [],
      };
    }

    // 5️⃣ Save in DB
    unit.generatedTwoMark = parsedOutput.twoMark || [];
    unit.generatedFiveMark = parsedOutput.fiveMark || [];
    unit.generatedTenMark = parsedOutput.tenMark || [];
    await unit.save();

    res.status(200).json({
      message: "✅ Questions generated successfully",
      generatedTwoMark: unit.generatedTwoMark,
      generatedFiveMark: unit.generatedFiveMark,
      generatedTenMark: unit.generatedTenMark,
    });
  } catch (error) {
    console.error("❌ Error in generateQuestions:", error);
    res.status(500).json({
      message: "Error generating questions",
      error: error.message,
    });
  }
};
