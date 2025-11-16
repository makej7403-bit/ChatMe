import React, { useState } from "react";
import TypingDots from "./TypingDots";
import AIMessage from "./AIMessage";

export default function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // --- CALL YOUR BACKEND ---
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userMsg.text }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: data.answer,
        sources: data.sources || [],
      },
    ]);

    setLoading(false);
  }

  return (
    <div className="h-full overflow-y-auto p-8 flex flex-col">

      {/* Messages */}
      {messages.map((msg, i) => (
        <div key={i} className="my-2 w-full">
          {msg.role === "user" ? (
            <div className="text-gray-300 bg-[#1c2432] px-4 py-3 rounded-xl inline-block">
              {msg.text}
            </div>
          ) : (
            <AIMessage text={msg.text} sources={msg.sources} />
          )}
        </div>
      ))}

      {/* Typing Indicator */}
      {loading && <TypingDots />}

      {/* Input Box */}
      <div className="flex mt-6">
        <input
          className="flex-1 bg-[#1a2330] border border-[#2c3547] rounded-xl px-4 py-3 outline-none text-gray-200"
          placeholder="Ask anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="ml-3 bg-blue-600 hover:bg-blue-700 px-5 rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
}
