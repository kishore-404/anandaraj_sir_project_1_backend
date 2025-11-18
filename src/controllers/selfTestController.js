import Unit from "../models/unitModel.js";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper to safely parse JSON
const safeParseJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

// 🧭 Rate limit — 1 test per 5 minutes
let lastTestTime = 0;
const TEST_COOLDOWN = 5 * 60 * 1000; // 5 minutes in ms

// ✅ Generate Self Test (MCQs)
export const generateSelfTest = async (req, res) => {
  try {
    const now = Date.now();
    if (now - lastTestTime < TEST_COOLDOWN) {
      console.log(
        "⚠️ Only 1 self-test allowed per 5 minutes. Learn and come again — do your best in the next test!"
      );
    } else {
      lastTestTime = now;
    }

    const { subjectId, unitId } = req.params;
    const unit = await Unit.findOne({ _id: unitId, subject: subjectId });
    if (!unit) return res.status(404).json({ message: "Unit not found" });

    const buildSection = (label, arr) =>
      `${label}:\n${(arr || [])
        .map((q) => `${q.q} - ${q.a}`)
        .join("\n")}\n`;

    const combinedContent =
      buildSection("2 MARK QUESTIONS", unit.generatedTwoMark) +
      buildSection("5 MARK QUESTIONS", unit.generatedFiveMark) +
      buildSection("10 MARK QUESTIONS", unit.generatedTenMark);

    if (!combinedContent.trim()) {
      return res.status(400).json({
        message: "No 2/5/10 mark question data available to generate self-test",
      });
    }

    const prompt = `
You are a senior Software Engineering professor.

From the following content (2, 5, and 10 mark questions), create **20 Multiple Choice Questions (MCQs)**.
Each question must:
- Be based only on the given content.
- Have 4 options.
- Include 1 correct answer.
- Avoid repetition.
Return JSON only:
{
  "mcq": [
    {
      "q": "Question",
      "options": ["A", "B", "C", "D"],
      "answer": "Correct Option"
    }
  ]
}

Content:
${combinedContent}
`;

    // 🕐 Small delay to avoid OpenAI rate limit
    await new Promise((resolve) => setTimeout(resolve, 25000)); // 25 seconds

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const aiText = response.choices[0].message.content.trim();
    let parsed = safeParseJSON(aiText);

    if (!parsed) {
      const match = aiText.match(/\{[\s\S]*\}/);
      if (match) parsed = safeParseJSON(match[0]);
    }

    if (!parsed || !parsed.mcq?.length) {
      return res.status(500).json({
        message: "AI did not return valid MCQ JSON",
        raw: aiText,
      });
    }

    // Clean MCQs
    parsed.mcq = parsed.mcq.slice(0, 20).map((m, i) => ({
      q: m.q?.trim() || `Question ${i + 1}`,
      options: Array.isArray(m.options)
        ? m.options.filter(Boolean).slice(0, 4)
        : ["A", "B", "C", "D"],
      answer:
        m.answer && m.options?.includes(m.answer)
          ? m.answer
          : m.options?.[0] || "",
    }));

    unit.selfTest = {
      mcq: parsed.mcq,
      fillups: [],
      twoMark: [],
      generatedAt: new Date(),
    };

    await unit.save();

    res.status(200).json({
      message: "✅ Self test generated successfully",
      test: unit.selfTest,
    });
  } catch (err) {
    console.error("❌ Self Test Error:", err);
    res.status(500).json({
      message: "Failed to generate self test",
      error: err.message,
    });
  }
};

// ✅ Submit Self Test Answers
export const submitSelfTest = async (req, res) => {
  try {
    const { subjectId, unitId } = req.params;
    const { answers } = req.body;
    if (!answers)
      return res.status(400).json({ message: "Answers required" });

    const unit = await Unit.findOne({ _id: unitId, subject: subjectId });
    if (!unit?.selfTest)
      return res.status(404).json({ message: "Self test not found" });

    const { mcq = [] } = unit.selfTest;

    let total = 0;
    let correct = 0;
    const details = [];

    const normalize = (s) => (s || "").toString().trim().toLowerCase();

    mcq.forEach((m, idx) => {
      const key = `mcq_${idx}`;
      const studentAns = answers[key];
      total++;
      const isCorrect = normalize(studentAns) === normalize(m.answer);
      if (isCorrect) correct++;
      details.push({
        type: "mcq",
        q: m.q,
        correctAnswer: m.answer,
        studentAnswer: studentAns || null,
        isCorrect,
      });
    });

    const score = {
      correct,
      total,
      percent: total ? Math.round((correct / total) * 100) : 0,
    };

    res.status(200).json({ message: "Test graded", score, details });
  } catch (err) {
    console.error("❌ Grade Self Test Error:", err);
    res.status(500).json({
      message: "Failed to grade self test",
      error: err.message,
    });
  }
};
