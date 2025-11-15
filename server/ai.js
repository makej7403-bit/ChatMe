import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function streamAI(message, sendChunk, onEnd) {
  const stream = await client.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [{ role: "user", content: message }]
  });

  for await (const chunk of stream) {
    const text = chunk.choices?.[0]?.delta?.content || "";
    sendChunk(text);
  }

  onEnd();
}
