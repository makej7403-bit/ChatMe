import React, { useState } from "react";
import TypingEffect from "./TypingEffect";

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState("");

  const sendMessage = async () => {
    if (!typing) return;

    const userMsg = { from: "you", text: typing };
    setMessages((m) => [...m, userMsg]);

    const response = await fetch(
      "https://YOUR_RENDER_BACKEND_URL.onrender.com/api/ask",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: typing })
      }
    );

    const data = await response.json();

    setMessages((m) => [...m, { from: "ai", text: data.reply }]);
    setTyping("");
  };

  return (
    <div className="chatbox">
      <div className="messages">
        {messages.map((msg, i) => (
          <TypingEffect key={i} message={msg} />
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={typing}
          onChange={(e) => setTyping(e.target.value)}
          placeholder="Ask me anything..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
