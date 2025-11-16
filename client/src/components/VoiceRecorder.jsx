import React, { useState, useRef } from "react";

const VoiceRecorder = ({ onText }) => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      audioChunks.current = [];

      const form = new FormData();
      form.append("audio", audioBlob);

      const res = await fetch(import.meta.env.VITE_API_URL + "/voice", {
        method: "POST",
        body: form
      });

      const data = await res.json();
      onText(data.text);
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <button
      onClick={recording ? stopRecording : startRecording}
      style={{
        background: recording ? "#b42323" : "#0d2b4c",
        color: "white",
        padding: "12px 18px",
        borderRadius: 40,
        border: "none",
      }}
    >
      {recording ? "Stop" : "🎤 Voice"}
    </button>
  );
};

export default VoiceRecorder;
