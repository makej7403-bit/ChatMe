// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import OpenAI from "openai";
import { WebSocketServer } from "ws";
import tmp from "tmp";
import fetch from "node-fetch";
import FormData from "form-data";
import pdfParse from "pdf-parse";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads & db exist
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// LowDB setup (v3 style)
const dbFile = path.join(__dirname, "db.json");
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify({ chats: [], uploads: [] }, null, 2));
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);
await db.read();
db.data ||= { chats: [], uploads: [] };
await db.write();

// Express + middlewares
const app = express();
app.use(cors());
app.use(express.json());

app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 200
}));

// OpenAI client (we will use the SDK for chat and REST for audio)
const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) console.warn("OPENAI_API_KEY not set");
const openai = new OpenAI({ apiKey: OPENAI_KEY });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Simple helper: creator question detection
function isCreatorQuestion(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  return t.includes("who created you") || t.includes("who made you") || t.includes("your creator") || t.includes("who created") || t.includes("who built you");
}

// --- API: text chat (simple) ---
app.post("/api/ai/chat", async (req, res) => {
  try {
    const message = (req.body && (req.body.prompt || req.body.message || req.body.text)) || "";
    if (!message) return res.status(400).json({ error: "message required" });

    if (isCreatorQuestion(message)) {
      return res.json({ reply: "I was created by Akin S. Sokpah from Liberia." });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are ChatMe AI v15.0.0 created by Akin S. Sokpah from Liberia. Answer concisely." },
        { role: "user", content: message }
      ]
    });

    const reply = response.choices?.[0]?.message?.content ?? "Sorry, no reply";
    db.data.chats.push({ type: "chat", user: message, reply, time: Date.now() });
    await db.write();
    res.json({ reply });
  } catch (err) {
    console.error("chat error:", err);
    res.status(500).json({ error: String(err) });
  }
});

// --- API: image upload ---
app.post("/api/upload-image", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "image required" });
    const meta = { id: Date.now().toString(), type: "image", filename: file.filename, original: file.originalname, path: file.path, time: Date.now() };
    db.data.uploads.push(meta);
    await db.write();
    res.json({ ok: true, meta });
  } catch (err) {
    console.error("upload-image error:", err);
    res.status(500).json({ error: String(err) });
  }
});

// --- API: document upload (pdf/txt) ---
app.post("/api/upload-doc", upload.single("doc"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "doc required" });
    const ext = path.extname(file.originalname).toLowerCase();
    let text = "";
    if (ext === ".pdf") {
      const buffer = fs.readFileSync(file.path);
      const pdf = await pdfParse(buffer);
      text = pdf.text || "";
    } else {
      text = fs.readFileSync(file.path, "utf8");
    }
    const meta = { id: Date.now().toString(), type: "doc", filename: file.filename, original: file.originalname, textPreview: text.slice(0, 2000), time: Date.now() };
    db.data.uploads.push(meta);
    await db.write();
    res.json({ ok: true, meta });
  } catch (err) {
    console.error("upload-doc error:", err);
    res.status(500).json({ error: String(err) });
  }
});

// --- API: transcribe single audio upload (one-off) ---
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "audio required" });
    // Use OpenAI audio transcription (whisper) via REST because SDK audio support varies
    const form = new FormData();
    form.append("file", fs.createReadStream(file.path));
    form.append("model", "whisper-1");

    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_KEY}` },
      body: form
    });
    const j = await r.json();
    const text = j.text || j?.data?.text || "";
    db.data.uploads.push({ id: Date.now().toString(), type: "transcript", file: file.filename, text: text.slice(0, 2000), time: Date.now() });
    await db.write();
    res.json({ ok: true, text });
  } catch (err) {
    console.error("transcribe error:", err);
    res.status(500).json({ error: String(err) });
  }
});

// --- WebSocket: live call (clients send small base64 audio chunks) ---
const server = app.listen(process.env.PORT || 8877, () => {
  console.log("Server running on port", process.env.PORT || 8877);
});

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  console.log("WS connected");
  ws.on("message", async (message) => {
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed.type === "audio-chunk") {
        const { audioBase64, mime } = parsed.payload;
        const tmpobj = tmp.fileSync({ postfix: mime && mime.includes("webm") ? ".webm" : ".ogg" });
        fs.writeFileSync(tmpobj.name, Buffer.from(audioBase64, "base64"));

        // send to OpenAI transcription endpoint
        const form = new FormData();
        form.append("file", fs.createReadStream(tmpobj.name));
        form.append("model", "whisper-1");

        const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${OPENAI_KEY}` },
          body: form
        });
        const j = await r.json();
        const transcript = j.text || "";

        db.data.chats.push({ type: "live-transcript", transcript, time: Date.now() });
        await db.write();

        if (!transcript || transcript.trim().length === 0) {
          ws.send(JSON.stringify({ type: "transcript", payload: { text: "" } }));
          tmpobj.removeCallback();
          return;
        }

        if (isCreatorQuestion(transcript)) {
          ws.send(JSON.stringify({ type: "reply", payload: { text: "I was created by Akin S. Sokpah from Liberia." } }));
          tmpobj.removeCallback();
          return;
        }

        // Query chat model
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are ChatMe AI v15.0.0 created by Akin S. Sokpah from Liberia. Answer quickly and concisely." },
            { role: "user", content: transcript }
          ]
        });

        const reply = completion.choices?.[0]?.message?.content || "Sorry, I couldn't answer that.";
        db.data.chats.push({ type: "live-reply", user: transcript, reply, time: Date.now() });
        await db.write();

        ws.send(JSON.stringify({ type: "reply", payload: { text: reply } }));
        tmpobj.removeCallback();
      } else if (parsed.type === "text") {
        const text = parsed.payload.text || "";
        if (isCreatorQuestion(text)) {
          ws.send(JSON.stringify({ type: "reply", payload: { text: "I was created by Akin S. Sokpah from Liberia." } }));
          return;
        }
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are ChatMe AI v15.0.0 created by Akin S. Sokpah from Liberia." },
            { role: "user", content: text }
          ]
        });
        const reply = completion.choices?.[0]?.message?.content || "";
        db.data.chats.push({ type: "live-text", user: text, reply, time: Date.now() });
        await db.write();
        ws.send(JSON.stringify({ type: "reply", payload: { text: reply } }));
      }
    } catch (err) {
      console.error("WS error:", err);
      ws.send(JSON.stringify({ type: "error", payload: { message: String(err) } }));
    }
  });

  ws.on("close", () => console.log("WS disconnected"));
});

// Serve client static (if built)
app.use(express.static(path.join(__dirname, "client/dist")));
app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "client/dist", "index.html");
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  res.status(404).send("Not found");
});
