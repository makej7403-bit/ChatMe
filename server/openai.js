// server/openai.js
import fetch from "node-fetch"; // Node 18 has global fetch, but require node-fetch for older compatibility if needed

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// streamOpenAIChat: uses OpenAI REST /v1/chat/completions with stream=true
export async function streamOpenAIChat(messages, onChunk, onDone, onError) {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");

  const url = "https://api.openai.com/v1/chat/completions";
  const body = {
    model: "gpt-4o-mini", // or "gpt-4o" - change if you have a different model
    messages,
    stream: true
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const txt = await res.text();
    onError(new Error(`OpenAI error: ${res.status} ${txt}`));
    return;
  }

  // read streaming chunks
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // OpenAI stream uses lines starting with "data: "
    const parts = buffer.split("\n\n");
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i].trim();
      buffer = parts.slice(i + 1).join("\n\n");
      if (!part.startsWith("data:")) continue;
      const data = part.replace(/^data:\s*/, "");
      if (data === "[DONE]") {
        onDone();
        return;
      }
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.message?.content || "";
        if (delta) onChunk(delta);
      } catch (err) {
        // ignore JSON parse errors for partial data
      }
    }
  }
  onDone();
}
