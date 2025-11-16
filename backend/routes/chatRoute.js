import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // or gpt-4.1, or your preferred model
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!data.choices) {
      return res.status(500).json({
        error: "AI did not return a valid response.",
        details: data,
      });
    }

    return res.json({
      reply: data.choices[0].message.content,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
