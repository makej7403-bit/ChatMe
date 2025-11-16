import React, { useState } from "react";
import VoiceRecorder from "./VoiceRecorder";
import ImageUpload from "./ImageUpload";
import DocumentUpload from "./DocumentUpload";

const ChatInput = ({ onSend }) => {
  const [text, setText] = useState("");

  const send = () => {
    if (text.trim()) onSend(text);
    setText("");
  };

  return (
    <div className="chat-input-container">

      <ImageUpload onSend={onSend} />
      <DocumentUpload onSend={onSend} />
      <VoiceRecorder onText={(t) => onSend(t)} />

      <input
        className="chat-input"
        placeholder="Ask anything..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
      />

      <button className="send-btn" onClick={send}>➤</button>
    </div>
  );
};

export default ChatInput;
