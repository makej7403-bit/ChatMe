// server/index.js
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");

require("dotenv").config();

const aiRoutes = require("./ai");
const paymentRoutes = require("./payments");

// ---------------------------
// Firebase Admin Initialization
// ---------------------------
const serviceAccount = {
  type: "service_account",
  project_id: "fir-u-c-students-web",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-u-c-students-web-default-rtdb.firebaseio.com"
});

const app = express();
app.use(express.json());
app.use(cors());

// ---------------------------
// Token Verification Middleware
// ---------------------------
async function verifyUser(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ---------------------------
// API ROUTES
// ---------------------------
app.use("/api/ai", verifyUser, aiRoutes);
app.use("/api/payments", verifyUser, paymentRoutes);

// ---------------------------
// SERVE FRONTEND (Vite build)
// ---------------------------
const frontendPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ---------------------------
// START SERVER
// ---------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
