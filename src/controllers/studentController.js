// controllers/studentController.js
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const askDoubt = async (req, res) => {
  try {
    const { question, subjectId, unitId } = req.body;
    if (!question) return res.status(400).json({ message: "Question required" });

    // You can fetch content from Unit files for better context
    const prompt = `
You are a helpful software engineering tutor.
Answer the following student question clearly and concisely.

Question: ${question}
`;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    res.json({ answer: aiRes.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get answer" });
  }
};