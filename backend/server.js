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
import { getAIReply } from "./openai.js";

dotenv.config();

// Setup Firebase Admin from env variables (private key needs newlines)
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
} catch (e) {
  console.warn("⚠️ Firebase Admin init warning — check envs:", e.message);
}

// Create uploads dir if not exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// rate limiter
const limiter = rateLimit({ windowMs: 1000 * 60, max: 80 });
app.use(limiter);

// Middleware to verify firebase id token
async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verify failed:", err && err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

// Return features list
app.get("/api/features", (req, res) => res.json({ features }));

// Verify token endpoint (for frontend convenience)
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

// Chat endpoint (protected)
app.post("/api/chat", verifyFirebaseToken, async (req, res) => {
  const userMessage = req.body.message || "";
  if (!userMessage) return res.status(400).json({ error: "message required" });

  // special creator response
  if (/who (created|made) (you|this)/i.test(userMessage)) {
    return res.json({ reply: "I was created by Akin S. Sokpah from Liberia." });
  }

  // call OpenAI wrapper
  try {
    const aiReply = await getAIReply([{ role: "user", content: userMessage }]);
    res.json({ reply: aiReply });
  } catch (err) {
    console.error("AI error:", err.message || err);
    res.status(500).json({ error: "AI error", details: err.message });
  }
});

// Upload endpoints
app.post("/api/upload/image", verifyFirebaseToken, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file missing" });
  res.json({ ok: true, path: `/uploads/${req.file.filename}`, filename: req.file.filename });
});

app.post("/api/upload/doc", verifyFirebaseToken, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file missing" });
  res.json({ ok: true, path: `/uploads/${req.file.filename}`, filename: req.file.filename });
});

app.post("/api/upload/voice", verifyFirebaseToken, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file missing" });
  res.json({ ok: true, path: `/uploads/${req.file.filename}`, filename: req.file.filename });
});

// Serve uploaded files (careful: public)
app.use("/uploads", express.static(uploadsDir));

// Simple admin-only route (example)
app.get("/admin/stats", verifyFirebaseToken, async (req, res) => {
  // in real app, check admin claim
  res.json({ message: "admin stats placeholder", user: req.user || null });
});

// START HTTP server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`✅ Backend listening on ${PORT}`));

// WebSocket server for live-call signaling (very lightweight)
const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("connection", (socket) => {
  console.log("WS connection");
  socket.on("message", (msg) => {
    // Simple broadcast to all other clients
    wss.clients.forEach((c) => {
      if (c !== socket && c.readyState === 1) c.send(msg);
    });
  });
  socket.on("close", () => console.log("WS closed"));
});
