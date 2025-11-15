import express from "express";
import cors from "cors";
import { streamAI } from "./ai.js";

const app = express();
app.use(cors());
app.use(express.json());

// ---- Custom Answer Rule ----
function checkCreatorQuestion(msg) {
  const t = msg.toLowerCase();
  return (
    t.includes("who created you") ||
    t.includes("who made you") ||
    t.includes("your creator")
  );
}

// ---- Streaming Chat Endpoint ----
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (checkCreatorQuestion(userMessage)) {
    return res.json({
      answer: "I was created by Akin S. Sokpah from Liberia."
    });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.flushHeaders();

  await streamAI(
    userMessage,
    (chunk) => res.write(`data: ${chunk}\n\n`),
    () => {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  );
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
