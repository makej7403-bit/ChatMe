import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rate limit
app.use(
  rateLimit({
    windowMs: 10 * 1000,
    max: 50
  })
);

// ⬇⬇⬇ FIXED LOWDB CODE (WORKS 100% ON RENDER)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adapter = new JSONFile(path.join(__dirname, "db.json"));
const db = new Low(adapter, { chats: [], users: [], settings: {} });

// Make sure DB is initialized
await db.read();
db.data ||= { chats: [], users: [], settings: {} };
await db.write();
// ⬆⬆⬆ END FIXED LOWDB CODE

// OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are ChatMe AI v15.0.0 created by Akin S Sokpah from Liberia. Respond fast like live texting."
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
app.use(express.static(path.join(__dirname, "client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`ChatMe Backend Running on ${PORT}`);
});
