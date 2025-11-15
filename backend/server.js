// backend/server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import admin from "firebase-admin";
import multer from "multer";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import { WebSocketServer } from "ws";
import features from "./features.js";
import { getAIReply, streamChat } from "./openai.js";

dotenv.config();

// ---------- Firebase Admin init ----------
const serviceAccount = {
  type: process.env.FIREBASE_TYPE || "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
  token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com"
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || ""
  });
  console.log("✅ Firebase Admin initialized.");
} catch (err) {
  console.warn("⚠ Firebase Admin init error (check envs):", err && err.message);
}

// Firestore instance
const db = admin.firestore();

// ---------- Uploads dir & multer ----------
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 60 * 1024 * 1024 } });

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// rate limiter to avoid abuse
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

// Helper: build public base URL (Render sets host properly)
function getBaseUrl(req) {
  const forwardedHost = req.get("x-forwarded-host") || req.get("host");
  const protocol = req.get("x-forwarded-proto") || req.protocol;
  return `${protocol}://${forwardedHost}`;
}

// Middleware: verify Firebase token from Authorization: Bearer <token>
async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verify failed:", err && err.message);
    return res.status(401).json({ error: "Invalid token", details: err.message });
  }
}

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

// List features
app.get("/api/features", (req, res) => res.json({ features }));

// Verify token convenience endpoint
app.post("/api/verifyToken", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "token required" });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    res.json({ ok: true, uid: decoded.uid, email: decoded.email });
  } catch (e) {
    res.status(401).json({ error: "invalid token", details: e.message });
  }
});

// Non-streaming chat (keeps compatibility)
app.post("/api/chat", verifyFirebaseToken, async (req, res) => {
  const userMessage = req.body.message || "";
  if (!userMessage) return res.status(400).json({ error: "message required" });

  // Creator response
  if (/who (created|made) (you|this)/i.test(userMessage)) {
    const reply = "I was created by Akin S. Sokpah from Liberia.";
    // save to Firestore
    await saveChat(req.user.uid, userMessage, reply);
    return res.json({ reply });
  }

  try {
    const aiReply = await getAIReply([{ role: "user", content: userMessage }]);
    // Save to Firestore
    await saveChat(req.user.uid, userMessage, aiReply);
    res.json({ reply: aiReply });
  } catch (err) {
    console.error("AI error:", err && err.message);
    res.status(500).json({ error: "AI error", details: err.message });
  }
});

// Streaming chat via Server-Sent Events (SSE)
// Client should POST JSON { message: "..."} with Bearer token in Authorization header
app.post("/api/chat/stream", verifyFirebaseToken, async (req, res) => {
  const userMessage = req.body.message || "";
  if (!userMessage) return res.status(400).json({ error: "message required" });

  // Creator question shortcut
  if (/who (created|made) (you|this)/i.test(userMessage)) {
    // SSE headers then send JSON as a single event
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    res.write(`data: ${JSON.stringify({ chunk: "I was created by Akin S. Sokpah from Liberia." })}\n\n`);
    res.write("data: [DONE]\n\n");
    // Save to Firestore
    await saveChat(req.user.uid, userMessage, "I was created by Akin S. Sokpah from Liberia.");
    return res.end();
  }

  // set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    // Stream from OpenAI
    const stream = await streamChat([{ role: "user", content: userMessage }]);

    let final = "";
    for await (const chunk of stream) {
      // The chunk may include choices[].delta.content for streaming
      try {
        const text = chunk.choices?.[0]?.delta?.content || "";
        if (text) {
          final += text;
          // send SSE chunk as JSON for easier parsing on client
          res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
        }
      } catch (e) {
        // ignore parse errors of chunk
      }
    }

    // end signal
    res.write("data: [DONE]\n\n");
    await saveChat(req.user.uid, userMessage, final);
    res.end();
  } catch (err) {
    console.error("Streaming error:", err && err.message);
    res.write(`data: ${JSON.stringify({ error: "stream error", details: err.message })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
});

// Upload image then run image analysis
app.post("/api/upload/image", verifyFirebaseToken, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file missing" });

  // Build public reachable URL for the uploaded file
  const base = getBaseUrl(req);
  const publicUrl = `${base}/uploads/${req.file.filename}`;

  // Simple image analysis prompt using OpenAI chat (you can make it richer)
  const prompt = `You are an assistant that analyzes images. Describe the content of the image at this URL in detail, mention objects, people, clothing, text in the image (if any), colors, possible context, and answer any likely questions about it. Image URL: ${publicUrl}`;

  try {
    const analysis = await getAIReply([{ role: "user", content: prompt }]);
    // Save a short chat record (user asked to analyze an image)
    const userMessage = `Analyze image: ${req.file.filename}`;
    await saveChat(req.user.uid, userMessage, analysis, { type: "image", file: req.file.filename, publicUrl });
    res.json({ ok: true, filename: req.file.filename, publicUrl, analysis });
  } catch (err) {
    console.error("Image analyze error:", err && err.message);
    res.status(500).json({ error: "analysis_failed", details: err.message });
  }
});

// Generic doc/voice upload (keeps earlier endpoints)
app.post("/api/upload/doc", verifyFirebaseToken, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file missing" });
  const base = getBaseUrl(req);
  res.json({ ok: true, filename: req.file.filename, publicUrl: `${base}/uploads/${req.file.filename}` });
});
app.post("/api/upload/voice", verifyFirebaseToken, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file missing" });
  const base = getBaseUrl(req);
  res.json({ ok: true, filename: req.file.filename, publicUrl: `${base}/uploads/${req.file.filename}` });
});

// Serve uploaded files (public)
app.use("/uploads", express.static(uploadsDir));

// ADMIN demo endpoint
app.get("/admin/stats", verifyFirebaseToken, async (req, res) => {
  // NOTE: production should check custom claim admin:true
  const user = req.user || {};
  res.json({ ok: true, user });
});

// ---------- Firestore helper: save chat ----------
async function saveChat(uid, userMessage, aiReply, extras = {}) {
  try {
    if (!uid) return;
    const col = db.collection("users").doc(uid).collection("chats");
    const doc = col.doc(); // auto id
    await doc.set({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      userMessage,
      aiReply,
      ...extras
    });
    return doc.id;
  } catch (e) {
    console.warn("saveChat error:", e && e.message);
  }
}

// Start HTTP server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`✅ Backend listening on ${PORT}`));

// Lightweight WebSocket server for signaling (WebRTC) - basic broadcast
const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("connection", (socket) => {
  console.log("WS client connected");
  socket.on("message", (msg) => {
    // broadcast to others
    for (const client of wss.clients) {
      if (client !== socket && client.readyState === 1) client.send(msg);
    }
  });
  socket.on("close", () => console.log("WS client disconnected"));
});
