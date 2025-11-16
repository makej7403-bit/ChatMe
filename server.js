import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import aiRouter from "./backend/routes/ai.js";

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "client/dist")));

// API routes
app.use("/api/ai", aiRouter);

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
