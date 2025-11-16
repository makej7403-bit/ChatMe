// client/src/components/Chat.jsx
import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello — ChatMe v15.0.0. Ask me anything or upload files. (Ask 'who created you?')",
    },
  ]);

  const handleSend = (text) => {
    if (!text.trim()) return;

    const userMsg = { role: "user", content: text };
    const botMsg = {
      role: "assistant",
      content:
        text.toLowerCase().includes("who created you")
          ? "I was created by Akin S. Sokpah from Liberia using advanced OpenAI technology. ChatMe Pro was fully designed and developed by him."
          : "Processing your request...",
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  return (
    <div className="flex flex-col gap-4">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`p-3 rounded-xl max-w-[80%] ${
            msg.role === "assistant"
              ? "bg-white shadow"
              : "bg-blue-500 text-white ml-auto"
          }`}
        >
          {msg.content}
        </div>
      ))}
    </div>
  );
}
