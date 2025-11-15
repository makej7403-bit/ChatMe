import { useState, useRef } from "react";
import { SERVER_URL } from "../config";

export default function VoiceRecorder({ token, onResult }) {
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("Idle");
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioChunks.current = [];
    mediaRecorder.current = new MediaRecorder(stream);

    mediaRecorder.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    mediaRecorder.current.onstop = sendToServer;

    mediaRecorder.current.start();
    setRecording(true);
    setStatus("Recording...");
  }

  function stopRecording() {
    mediaRecorder.current.stop();
    setRecording(false);
    setStatus("Processing...");
  }

  async function sendToServer() {
    const blob = new Blob(audioChunks.current, { type: "audio/webm" });
    const form = new FormData();
    form.append("file", blob);
    form.append("token", token);

    const res = await fetch(`${SERVER_URL}/api/upload-voice`, {
      method: "POST",
      body: form
    });

    const data = await res.json();
    setStatus("Done.");

    if (onResult) onResult(data.output);
  }

  return (
    <div className="p-4">
      {!recording ? (
        <button
          onClick={startRecording}
          className="px-4 py-2 bg-blue-600 text-white rounded w-full"
        >
          🎤 Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="px-4 py-2 bg-red-600 text-white rounded w-full"
        >
          ⏹ Stop Recording
        </button>
      )}

      <p className="mt-3 text-gray-700">{status}</p>
    </div>
  );
}
