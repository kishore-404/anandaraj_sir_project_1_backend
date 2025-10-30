import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Handles student doubt
export const handleStudentDoubt = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || question.trim() === "")
      return res.status(400).json({ message: "Question is required" });

    const prompt = `
You are a helpful AI tutor for Software Engineering students.
Explain the following question in a simple, short, and clear way:
Question: ${question}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    const answer = completion.choices[0].message.content.trim();

    res.status(200).json({ question, answer });
  } catch (err) {
    console.error("❌ Doubt handler error:", err);
    res.status(500).json({
      message: "Failed to generate answer",
      error: err.message,
    });
  }
};
