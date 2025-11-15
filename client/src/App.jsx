import React, { useState } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  async function sendMessage() {
    const msg = input;
    setInput("");

    setMessages((m) => [...m, { from: "you", text: msg }]);

    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });

    if (response.headers.get("content-type") === "application/json") {
      const data = await response.json();
      setMessages((m) => [...m, { from: "ai", text: data.answer }]);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let finalText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      if (text.includes("[DONE]")) break;

      finalText += text.replace("data:", "").trim();

      setMessages((m) => {
        const other = m.filter((x) => x.from !== "stream");
        return [...other, { from: "stream", text: finalText }];
      });
    }

    setMessages((m) => {
      const other = m.filter((x) => x.from !== "stream");
      return [...other, { from: "ai", text: finalText }];
    });
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>My AI Assistant</h1>

      <div style={{
        border: "1px solid #ccc",
        padding: 10,
        height: 400,
        overflowY: "scroll",
        marginBottom: 10
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: "10px 0" }}>
            <b>{m.from}:</b> {m.text}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        style={{ width: "70%", padding: 8 }}
      />
      <button onClick={sendMessage} style={{ padding: 8 }}>Send</button>
    </div>
  );
}
