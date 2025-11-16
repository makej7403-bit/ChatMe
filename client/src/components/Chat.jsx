import React, { useState, useRef, useEffect } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello — I'm FullTask AI Tutor Pro. How can I help?" }
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Simulate AI typing
  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: "user", text: input }]);
    setInput("");

    // Show typing
    setTyping(true);

    setTimeout(() => {
      setTyping(false);

      // Fake AI response
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: `You asked: ${input}`
        }
      ]);
    }, 1200);
  };

  return (
    <div className="w-full h-full flex flex-col items-center">

      {/* Chat Messages */}
      <div className="w-full max-w-3xl flex-1 overflow-y-auto px-4 md:px-6 py-8 space-y-6">
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`fade-in w-full rounded-2xl p-5 ${
              msg.role === "assistant"
                ? "bg-white/5 border border-white/10"
                : "bg-blue-600 text-white self-end"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {/* AI Typing Indicator */}
        {typing && (
          <div className="fade-in bg-white/5 border border-white/10 rounded-2xl p-5 w-full max-w-3xl">
            <div className="typing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef}></div>
      </div>

      {/* Input Bar (floating, like Perplexity) */}
      <div className="w-full flex justify-center px-4 pb-6">
        <div className="w-full max-w-3xl flex bg-white/10 border border-white/20 rounded-2xl p-2 backdrop-blur-lg">

          <input
            className="flex-1 bg-transparent outline-none px-3 text-white"
            placeholder="Ask anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={sendMessage}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition text-white"
          >
            Send
          </button>

        </div>
      </div>

    </div>
  );
}
