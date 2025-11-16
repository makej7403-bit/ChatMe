import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Import routes (ESM)
import aiRoutes from "./backend/routes/ai.js";
import authRoutes from "./backend/routes/auth.js";
import paymentRoutes from "./backend/routes/payment.js";

app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);

// --- Serve client build ---
app.use(express.static(path.join(__dirname, "client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
