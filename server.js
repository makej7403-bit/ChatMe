// SERVER.JS — Render + Firebase Admin + Google Auth Ready
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import admin from "firebase-admin";

// Load .env variables
dotenv.config();

// --- Fix: Render needs full JSON inside project ---
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

// --- Initialize Firebase Admin ---
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-u-c-students-web-default-rtdb.firebaseio.com"
});

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Verify Google ID Token Middleware
async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired Firebase token" });
  }
}

// Default Route
app.get("/", (req, res) => {
  res.send("🔥 ChatMe Full Backend Running on Render — Connected to Firebase");
});

// Example Protected API Route
app.get("/profile", verifyFirebaseToken, (req, res) => {
  res.json({
    message: "Authenticated",
    uid: req.user.uid,
    email: req.user.email
  });
});

// Example Future Chatbot Route
app.post("/chat", verifyFirebaseToken, async (req, res) => {
  const userMessage = req.body.message || "";

  if (!userMessage) {
    return res.status(400).json({ error: "Message missing" });
  }

  // Custom response
  if (userMessage.toLowerCase().includes("who created you")) {
    return res.json({
      reply: "I was created by Akin S Sokpah from Liberia."
    });
  }

  // Placeholder (replace with AI later)
  return res.json({
    reply: "AI response will be added soon."
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
