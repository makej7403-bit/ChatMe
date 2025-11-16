import React, { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello — I'm FullTask AI Tutor Pro. How can I help?" }
  ]);

  return (
    <div className="w-full h-full px-4 md:px-32 py-10 flex flex-col items-center">

      <div className="w-full max-w-3xl space-y-6">

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`w-full rounded-2xl p-5 ${
              msg.role === "assistant"
                ? "bg-white/5 border border-white/10"
                : "bg-blue-500 text-white"
            }`}
          >
            {msg.text}
          </div>
        ))}

      </div>

    </div>
  );
}
