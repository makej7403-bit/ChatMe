// server.js (root)
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import fetch from "node-fetch"; // node 18+ has global fetch, but include node-fetch to be safe
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors());
app.use(express.json({ limit: "6mb" }));

// ------------------------
// FIREBASE ADMIN INITIALIZATION
// Expects FIREBASE_ADMIN_JSON environment variable (raw JSON string)
// ------------------------
if (!process.env.FIREBASE_ADMIN_JSON) {
  console.error("FIREBASE_ADMIN_JSON not set. Exiting.");
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_JSON);
} catch (err) {
  console.error("Invalid FIREBASE_ADMIN_JSON:", err);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://fir-u-c-students-web-default-rtdb.firebaseio.com"
});

// ------------------------
// Simple auth middleware that verifies Firebase ID token if provided.
// If token missing, request proceeds but with req.user = null (optional auth).
// For protected routes you should enforce presence.
// ------------------------
async function maybeAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split("Bearer ")[1] : null;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    console.warn("Token verify failed:", err?.message ?? err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ------------------------
// Health / Test
// ------------------------
app.get("/api/test", (req, res) => {
  res.json({ ok: true, message: "API working" });
});

// ------------------------
// Chat endpoint
// - Accepts { message: string }
// - If user asks "who created you" (or similar) returns custom reply
// - Otherwise proxies to OpenAI (non-streaming completion) and returns text
// - Requires OPENAI_API_KEY env
// ------------------------
app.post("/api/chat", maybeAuth, async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message required" });
  }

  const textLower = message.toLowerCase();
  const creatorChecks = [
    "who created you",
    "who made you",
    "your creator",
    "who developed you",
    "who built you",
    "who is your creator"
  ];
  if (creatorChecks.some((p) => textLower.includes(p))) {
    return res.json({ answer: "I was created by Akin S. Sokpah from Liberia." });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI key not configured" });
  }

  try {
    // make a simple chat request to OpenAI REST API
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: message }
        ],
        max_tokens: 600,
        temperature: 0.2
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("OpenAI error:", resp.status, errText);
      return res.status(500).json({ error: "OpenAI error", details: errText });
    }

    const data = await resp.json();
    const aiText = data.choices?.[0]?.message?.content ?? "Sorry, no response.";
    return res.json({ answer: aiText });
  } catch (err) {
    console.error("Chat proxy error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ------------------------
// Serve client build (client/dist)
// ------------------------
const clientDistPath = path.join(__dirname, "client", "dist");
app.use(express.static(clientDistPath));

// If file doesn't exist, frontend index fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

// ------------------------
const PORT = process.env.PORT || 8877;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
