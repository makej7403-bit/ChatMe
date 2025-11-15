import express from "express";
import cors from "cors";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const app = express();
app.use(cors());
app.use(express.json());

// DATABASE
const adapter = new JSONFile("db.json");
const db = new Low(adapter, { users: [] });

await db.read();
db.data ||= { users: [] };

// --------------------------------------
//  AI ENDPOINT (VERSION 15.0.0 ENGINE)
// --------------------------------------
app.post("/api/ask", async (req, res) => {
  const { message } = req.body;

  if (!message) return res.json({ reply: "Please type something." });

  // Creator recognition rule
  if (message.toLowerCase().includes("who created")) {
    return res.json({
      reply:
        "I was created by **Akin S. Sokpah**, proudly from Liberia 🇱🇷 — version 15.0.0 ultra-speed AI engine."
    });
  }

  // Basic smart reply engine
  const reply = `AI v15.0.0: I understand your message: "${message}". How else can I help you?`;

  res.json({ reply });
});

// BASIC TEST
app.get("/", (req, res) => {
  res.send("🔥 ChatMe AI Server Running on Render — v15.0.0");
});

// PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
