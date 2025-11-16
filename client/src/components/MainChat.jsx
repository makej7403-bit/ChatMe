import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export default function MainChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(query) {
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Could not connect to server." },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="flex h-screen w-screen bg-[#0d0d0f] text-white">
      {/* Sidebar (left) */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Header onSearch={handleSearch} />

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl max-w-3xl ${
                m.role === "user"
                  ? "self-end bg-[#1c1d21]"
                  : "self-start bg-[#131417]"
              }`}
            >
              {m.content}
            </div>
          ))}

          {loading && (
            <div className="p-4 rounded-2xl bg-[#131417] max-w-3xl opacity-70">
              Thinking…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
