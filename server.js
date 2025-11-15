import path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/** -------------------------------------
 *   1. API ROUTES (from /server folder)
 --------------------------------------*/
import aiRoutes from "./server/ai.js";
import paymentRoutes from "./server/payments.js";

app.use("/api/ai", aiRoutes);
app.use("/api/payments", paymentRoutes);

/** -------------------------------------
 *   2. SERVE CLIENT FRONTEND (Vite)
 --------------------------------------*/
const __dirname = path.resolve();
const clientPath = path.join(__dirname, "client", "dist");

app.use(express.static(clientPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

/** -------------------------------------
 *   3. START SERVER
 --------------------------------------*/
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
