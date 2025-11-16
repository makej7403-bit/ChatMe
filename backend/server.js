import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoute from "./routes/chatRoute.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Chat route
app.use("/api/chat", chatRoute);

app.get("/", (req, res) => {
  res.send("FullTask AI Tutor Pro API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
