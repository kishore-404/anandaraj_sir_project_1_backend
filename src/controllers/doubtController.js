import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 🧭 Rate limit setup: allow only 5 requests per minute
let requestCount = 0;
let lastReset = Date.now();
const MAX_REQUESTS_PER_MIN = 5;

// ✅ Handles student doubt
export const handleStudentDoubt = async (req, res) => {
  try {
    // ⚙️ Check and log if over the 5 per minute limit
    const now = Date.now();
    if (now - lastReset >= 60000) {
      requestCount = 0;
      lastReset = now;
    }
    requestCount++;
    if (requestCount > MAX_REQUESTS_PER_MIN) {
      console.log("⚠️ Rate limit: More than 5 student doubt requests in a minute detected.");
    }

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
