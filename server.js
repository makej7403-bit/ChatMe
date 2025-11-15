import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { JSONFilePreset } from "lowdb/node";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rate limit
const limiter = rateLimit({
  windowMs: 10000,
  max: 50
});
app.use(limiter);

// LowDB v6 compatible
const db = await JSONFilePreset("./db.json", {
  chats: [],
  users: [],
  settings: {}
});
await db.write();

// OpenAI
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are ChatMe AI v15.0.0 created by Akin S Sokpah from Liberia. Respond extremely fast like live texting."
        },
        { role: "user", content: message }
      ]
    });

    const reply = response.choices[0].message.content;

    db.data.chats.push({
      user: message,
      bot: reply,
      time: Date.now()
    });
    await db.write();

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`ChatMe AI backend running on port ${PORT}`)
);
