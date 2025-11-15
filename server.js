import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// -------------------------------
// 🔥 FIREBASE INITIALIZATION USING ENV VARIABLE
// -------------------------------
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-u-c-students-web-default-rtdb.firebaseio.com"
});

// -------------------------------
// 🔥 STATIC FRONTEND SERVE (RENDER FIX)
// -------------------------------
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "frontend", "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// -------------------------------
app.get("/", (req, res) => {
  res.send("Server is running on Render!");
});

// -------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
