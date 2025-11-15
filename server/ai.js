// server/ai.js
const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// CHAT COMPLETION
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (err) {
    res.status(500).json({ error:  err.message });
  }
});

// TEXT ANALYZER
router.post("/analyze", async (req, res) => {
  try {
    const { text } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an advanced analyzer." },
        { role: "user", content: text },
      ],
    });

    res.json({ result: response.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// IMAGE DESCRIPTION
router.post("/image", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    const result = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this image." },
            { type: "image_url", image_url: `data:image/jpeg;base64,${imageBase64}` }
          ]
        }
      ]
    });

    res.json({ description: result.choices[0].message.content });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
