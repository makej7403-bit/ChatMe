// backend/openai.js
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Non-streaming chat helper
export async function getAIReply(messages = [], opts = {}) {
  const model = opts.model || "gpt-4o-mini";
  const resp = await client.chat.completions.create({
    model,
    messages,
    max_tokens: opts.maxTokens || 600
  });
  // Newer client libs may nest differently; handle both shapes
  const text = resp.choices?.[0]?.message?.content || resp.choices?.[0]?.delta?.content || "";
  return text;
}

// Streaming chat: returns an async iterator you can for-await over
export async function streamChat(messages = [], opts = {}) {
  const model = opts.model || "gpt-4o-mini";
  // The official openai Node client supports .chat.completions.create({stream:true})
  const stream = await client.chat.completions.create({
    model,
    messages,
    stream: true,
    max_tokens: opts.maxTokens || 600
  });
  return stream; // iterate with: for await (const chunk of stream) { ... }
}

export default client;
