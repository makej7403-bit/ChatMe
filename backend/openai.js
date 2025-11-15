// backend/openai.js
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// simple chat completion helper (non-streaming)
export async function getAIReply(messages = [], opts = {}) {
  const model = opts.model || "gpt-4o-mini"; // change if needed
  const resp = await client.chat.completions.create({
    model,
    messages,
    max_tokens: opts.maxTokens || 500
  });
  const text = resp.choices?.[0]?.message?.content || "";
  return text;
}

// streaming usage example is left as a later opt-in to avoid complexity / quota on deploy.
export default client;
