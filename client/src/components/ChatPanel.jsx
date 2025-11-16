import React, { useState, useRef, useEffect } from "react";
import SmartSuggestions from "./SmartSuggestions";
import { Send } from "lucide-react";

export default function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to the bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message to backend
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      const aiMessage = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error connecting to server." },
      ]);
    }
  };

  // Handle enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-gray-100 px-4 pt-6">
      
      {/* ======================= */}
      {/*  PERPLEXITY STYLE CARDS */}
      {/* ======================= */}
      {messages.length === 0 && (
        <SmartSuggestions onSelect={(prompt) => setInput(prompt)} />
      )}

      {/* ======================= */}
      {/* CHAT WINDOW DISPLAY     */}
      {/* ======================= */}
      <div className="flex-1 overflow-y-auto mt-6 space-y-4 pr-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-4 max-w-2xl rounded-2xl ${
              msg.role === "user"
                ? "bg-blue-600 ml-auto text-white"
                : "bg-[#1b2433] border border-[#2a3142] text-gray-200"
            }`}
          >
            {msg.content}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* ======================= */}
      {/* INPUT AREA              */}
      {/* ======================= */}
      <div className="flex items-center gap-3 mt-4 mb-6 bg-[#121722] border border-[#1f2633] px-4 py-3 rounded-2xl">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask anything..."
          className="flex-1 bg-transparent outline-none text-gray-100 placeholder-gray-500"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 transition p-2 rounded-xl"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
