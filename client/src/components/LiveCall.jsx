import React, { useState, useRef } from "react";

const LiveCall = () => {
  const [active, setActive] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const startCall = async () => {
    setActive(true);

    // 1. Connect WebSocket
    socketRef.current = new WebSocket(import.meta.env.VITE_API_WS + "/live");

    socketRef.current.onmessage = (event) => {
      setTranscript((prev) => [...prev, { role: "ai", text: event.data }]);
    };

    // 2. Start Mic
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (e) => {
      socketRef.current.send(e.data);
    };

    mediaRecorderRef.current.start(300); // send chunks every 300ms
    setTranscript([{ role: "system", text: "Live AI Call Started..." }]);
  };

  const stopCall = () => {
    setActive(false);
    mediaRecorderRef.current?.stop();
    socketRef.current?.close();
    setTranscript((prev) => [
      ...prev,
      { role: "system", text: "Call Ended." }
    ]);
  };

  if (!active)
    return (
      <button
        onClick={startCall}
        style={{
          position: "fixed",
          bottom: "100px",
          right: "25px",
          background: "#0d2b4c",
          color: "white",
          padding: "16px 30px",
          borderRadius: 40,
          border: "none",
          fontSize: 17,
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)"
        }}
      >
        🎧 Start Live AI Call
      </button>
    );

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#ffffff",
        height: "60%",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.25)",
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <h2 style={{ fontWeight: 700 }}>Live AI Call</h2>

      {/* waveform animation */}
      <div
        style={{
          height: 40,
          display: "flex",
          gap: 6,
          margin: "16px 0",
        }}
      >
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: Math.random() * 30 + 10,
              background: "#0d2b4c",
              borderRadius: 4,
              animation: "pulse 0.6s infinite ease",
            }}
          />
        ))}
      </div>

      {/* transcript */}
      <div>
        {transcript.map((msg, i) => (
          <p
            key={i}
            style={{
              padding: "8px 12px",
              background: msg.role === "ai" ? "#e6f0ff" : "#eee",
              borderRadius: 10,
              marginBottom: 8,
            }}
          >
            {msg.text}
          </p>
        ))}
      </div>

      <button
        onClick={stopCall}
        style={{
          marginTop: 20,
          width: "100%",
          padding: "14px 0",
          background: "#b42323",
          color: "white",
          border: "none",
          borderRadius: 12,
          fontSize: 16,
        }}
      >
        ⛔ End Call
      </button>
    </div>
  );
};

export default LiveCall;
