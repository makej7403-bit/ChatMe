// server.js (FINAL FIXED VERSION FOR RENDER)
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import aiRouter from "./backend/routes/ai.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------
//  FIREBASE ADMIN INITIALIZE
// --------------------------

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountString) {
  console.error("❌ Missing FIREBASE_SERVICE_ACCOUNT in Render environment");
}

let serviceAccount = null;

try {
  // FIX: Convert \n back to real newlines
  const parsed = JSON.parse(serviceAccountString);
  parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  serviceAccount = parsed;

  console.log("🔥 Firebase service account parsed correctly");
} catch (err) {
  console.error("❌ FIREBASE_SERVICE_ACCOUNT JSON parse error:", err);
}

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fir-u-c-students-web-default-rtdb.firebaseio.com",
  });
  console.log("🔥 Firebase Admin initialized");
}

// --------------------------
//    APP SETUP
// --------------------------

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// AI routes
app.use("/api/ai", aiRouter);

// Firebase auth middleware
async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Firebase auth error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Example protected
app.get("/api/user/protected", verifyToken, (req, res) => {
  res.json({
    message: "You are authenticated!",
    uid: req.user.uid,
  });
});

// --------------------------
// SERVE FRONTEND (Vite)
// --------------------------

const frontendPath = path.join(__dirname, "frontend/dist");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// --------------------------
// START SERVER
// --------------------------

const PORT = process.env.PORT || 8877;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
