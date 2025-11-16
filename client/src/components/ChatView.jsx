import React from "react";

const ChatView = ({ messages }) => {
  return (
    <div className="chat-view">
      {messages.length === 0 && (
        <div style={{
          textAlign: "center",
          marginTop: 120,
          color: "#777",
          fontSize: 28,
          fontWeight: 300
        }}>
          Where learning begins
        </div>
      )}

      {messages.map((msg, i) => (
        <div key={i} className={`message ${msg.role}`}>
          {msg.content}
        </div>
      ))}
    </div>
  );
};

export default ChatView;
