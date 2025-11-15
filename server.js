// server.js (ROOT) – FINAL RENDER VERSION
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import cors from "cors";

// ------------------------
//  PATH FIX
// ------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ------------------------
//  FIREBASE ADMIN FIXED
// ------------------------
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-u-c-students-web-default-rtdb.firebaseio.com"
});

// Protect backend routes
app.use(async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
});

// ------------------------
//  API ROUTES
// ------------------------
app.get("/api/test", (req, res) => {
  res.json({ message: "API working!" });
});

// ------------------------
//  SERVE CLIENT BUILD
// ------------------------
const clientDistPath = path.join(__dirname, "client", "dist");
app.use(express.static(clientDistPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

// ------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
