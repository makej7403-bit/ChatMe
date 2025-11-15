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

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 1000,
    max: 50,
  })
);

// ================================
// ✅ FIXED LOWDB CODE FOR RENDER
// ================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adapter for the JSON storage
const adapter = new JSONFile(path.join(__dirname, "db.json"));
const db = new Low(adapter, { chats: [] });

await db.read();
db.data ||= { chats: [] };
await db.write();
// ================================

// OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are ChatMe AI v15.0.0 created by Akin S Sokpah from Liberia. Respond extremely fast like live texting.",
        },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content;

    db.data.chats.push({ user: message, bot: reply, time: Date.now() });
    await db.write();

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend
app.use(express.static(path.join(__dirname, "client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

// Server start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
