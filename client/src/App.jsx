import React, { useState } from 'react';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import ChatView from './components/ChatView';
import BottomNav from './components/BottomNav';

const App = () => {
  const [messages, setMessages] = useState([]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      const aiMsg = { role: "assistant", content: data.reply };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Could not connect to server." }
      ]);
    }
  };

  return (
    <div className="app-container">
      <Header />
      <ChatView messages={messages} />
      <ChatInput onSend={sendMessage} />
      <BottomNav />
    </div>
  );
};

export default App;
