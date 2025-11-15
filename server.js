// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node"; // lowdb v3 style via node adapter
import multer from "multer";
import pdfParse from "pdf-parse";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import tmp from "tmp";
import fetch from "node-fetch";
import OpenAI from "openai";

dotenv.config();
const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) console.warn("Warning: OPENAI_API_KEY not set");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// rate limiter
app.use(rateLimit({ windowMs: 10 * 1000, max: 120 }));

// lowdb local storage
const dbFile = path.join(__dirname, "db.json");
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify({ chats: [], users: [] }, null, 2));
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);
await db.read();
db.data ||= { chats: [], users: [] };
await db.write();

// OpenAI client
const openai = new OpenAI({ apiKey: OPENAI_KEY });

// ------------------------
// Multer setup for uploads
// ------------------------
const upload = multer({ dest: path.join(__dirname, "uploads/") });
if (!fs.existsSync(path.join(__dirname, "uploads"))) fs.mkdirSync(path.join(__dirname, "uploads"));

// ------------------------
// Helpers
// ------------------------
function creatorReplyCheck(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  return t.includes("who created") || t.includes("who made you") || t.includes("your creator") || t.includes("who built you");
}

// ------------------------
// Image upload endpoint
// ------------------------
app.post("/api/upload-image", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "image file required" });

    // Option A: send URL or file to OpenAI image understanding (if available)
    // For portability we'll send a short prompt to the model describing the file name and ask user to ask questions referencing it.
    // But better: use OpenAI Vision APIs if available. Here we'll return file path and store metadata.
    const id = Date.now().toString();
    const meta = { id, filename: file.filename, original: file.originalname, path: file.path };
    db.data.chats.push({ type: "upload-image", meta, time: Date.now() });
    await db.write();

    res.json({ ok: true, meta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

// ------------------------
// Document upload endpoint (PDF / TXT)
// ------------------------
app.post("/api/upload-doc", upload.single("doc"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "doc file required" });

    const ext = path.extname(file.originalname).toLowerCase();
    let text = "";

    if (ext === ".pdf") {
      const data = fs.readFileSync(file.path);
      const pdf = await pdfParse(data);
      text = pdf.text;
    } else {
      // attempt to read as utf-8 text
      text = fs.readFileSync(file.path, "utf8");
    }

    const id = Date.now().toString();
    db.data.chats.push({ type: "upload-doc", id, filename: file.originalname, textPreview: text.slice(0, 2000), time: Date.now() });
    await db.write();

    res.json({ ok: true, id, textPreview: text.slice(0, 500) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

// ------------------------
// Transcribe uploaded audio (one-off uploads)
// Accepts audio file (webm/ogg/mp3/wav)
// ------------------------
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "audio file required" });

    // Use OpenAI speech-to-text (Whisper) via /audio/transcriptions if available in SDK
    // Fallback: send via fetch to OpenAI REST if SDK doesn't support audio
    const formData = new FormData();
    formData.append("file", fs.createReadStream(file.path));
    formData.append("model", "whisper-1");

    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_KEY}` },
      body: formData
    });
    const j = await r.json();
    const text = j.text || j?.data?.text || "";

    // store
    db.data.chats.push({ type: "transcript", file: file.originalname, text: text.slice(0, 2000), time: Date.now() });
    await db.write();

    res.json({ ok: true, text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

// ------------------------
// Generic chat endpoint (text)
// - Handles creator question shortcut
// - Uses OpenAI chat completion
// ------------------------
app.post("/api/ai/chat", async (req, res) => {
  try {
    const message = (req.body && (req.body.prompt || req.body.message || req.body.text)) || "";
    if (!message) return res.status(400).json({ error: "message required" });

    if (creatorReplyCheck(message)) {
      return res.json({ reply: "I was created by Akin S. Sokpah from Liberia." });
    }

    // Call OpenAI Chat Completion
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are ChatMe AI v15.0.0 created by Akin S Sokpah from Liberia. Be helpful and concise." },
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices?.[0]?.message?.content ?? "Sorry, no reply";

    // save conversation snippet
    db.data.chats.push({ type: "chat", user: message, bot: reply, time: Date.now() });
    await db.write();

    res.json({ reply });
  } catch (err) {
    console.error("ai/chat error:", err);
    res.status(500).json({ error: String(err) });
  }
});

// ------------------------
// WebSocket server for "live call" style interaction
// Client will open a ws connection and send small base64-encoded audio blobs (webm/ogg) and/or "text" events.
// Server will transcribe each chunk (via OpenAI audio.transcriptions), forward transcript to chat model, and reply text back to client.
// Client is responsible for speech synthesis locally.
// ------------------------
const server = app.listen(process.env.PORT || 8877, () => {
  console.log("Server listening on", process.env.PORT || 8877);
});

// Create WebSocket server on same http server, path /ws
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  console.log("WS client connected");

  // per-connection small buffer for audio chunks
  ws.on("message", async (data) => {
    try {
      // Expect messages as JSON strings with type and payload
      const parsed = JSON.parse(data.toString());
      if (parsed.type === "audio-chunk") {
        // payload: { audioBase64: "...", mime: "audio/webm" }
        const { audioBase64, mime } = parsed.payload;
        // write to temp file
        const tmpobj = tmp.fileSync({ postfix: mime.includes("webm") ? ".webm" : ".ogg" });
        const buffer = Buffer.from(audioBase64, "base64");
        fs.writeFileSync(tmpobj.name, buffer);

        // send to OpenAI transcription endpoint
        // Using REST endpoint for audio transcription
        const formData = new FormData();
        formData.append("file", fs.createReadStream(tmpobj.name));
        formData.append("model", "whisper-1");

        const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${OPENAI_KEY}` },
          body: formData
        });
        const j = await r.json();
        const transcript = j.text || "";

        // Save chunk transcript
        db.data.chats.push({ type: "live-transcript", text: transcript, time: Date.now() });
        await db.write();

        // If transcript is empty skip
        if (!transcript || transcript.trim().length === 0) {
          ws.send(JSON.stringify({ type: "transcript", payload: { text: "" } }));
          tmpobj.removeCallback();
          return;
        }

        // Creator check
        if (creatorReplyCheck(transcript)) {
          ws.send(JSON.stringify({ type: "reply", payload: { text: "I was created by Akin S. Sokpah from Liberia." } }));
          tmpobj.removeCallback();
          return;
        }

        // Query chat model with the transcript as user message
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are ChatMe AI v15.0.0 created by Akin S Sokpah from Liberia. Answer quickly and concisely." },
            { role: "user", content: transcript }
          ]
        });

        const replyText = completion.choices?.[0]?.message?.content || "Sorry, I couldn't answer that.";

        // save reply
        db.data.chats.push({ type: "live-reply", userText: transcript, replyText, time: Date.now() });
        await db.write();

        // send reply back to client
        ws.send(JSON.stringify({ type: "reply", payload: { text: replyText } }));

        // cleanup temp file
        tmpobj.removeCallback();
      } else if (parsed.type === "text") {
        // Simple text-based live chat message from client
        const text = parsed.payload.text || "";
        if (creatorReplyCheck(text)) {
          ws.send(JSON.stringify({ type: "reply", payload: { text: "I was created by Akin S. Sokpah from Liberia." } }));
          return;
        }
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are ChatMe AI v15.0.0 created by Akin S Sokpah from Liberia." },
            { role: "user", content: text }
          ]
        });
        const replyText = completion.choices?.[0]?.message?.content || "";
        db.data.chats.push({ type: "live-text", userText: text, replyText, time: Date.now() });
        await db.write();
        ws.send(JSON.stringify({ type: "reply", payload: { text: replyText } }));
      }
    } catch (err) {
      console.error("WS message handling error:", err);
      ws.send(JSON.stringify({ type: "error", payload: { message: String(err) } }));
    }
  });

  ws.on("close", () => console.log("WS client disconnected"));
});
