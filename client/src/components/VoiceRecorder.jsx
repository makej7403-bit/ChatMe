// VoiceRecorder.jsx
import React, { useState, useRef } from "react";

export default function VoiceRecorder({ apiBase = "" }) {
  const [recording, setRecording] = useState(false);
  const [mediaRec, setMediaRec] = useState(null);
  const [transcript, setTranscript] = useState("");
  const chunksRef = useRef([]);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    setMediaRec(mr);
    chunksRef.current = [];
    mr.ondataavailable = (e) => chunksRef.current.push(e.data);
    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const fd = new FormData();
      fd.append("audio", blob, "rec.webm");
      const res = await fetch(`${apiBase}/api/transcribe`, { method: "POST", body: fd });
      const j = await res.json();
      setTranscript(j.text || JSON.stringify(j));
    };
    mr.start();
    setRecording(true);
  }

  function stop() {
    if (mediaRec) mediaRec.stop();
    setRecording(false);
  }

  return (
    <div className="p-3 bg-white rounded shadow">
      <h3 className="font-semibold mb-2">Record Voice</h3>
      <div>
        <button onClick={start} disabled={recording} className="px-3 py-1 bg-green-600 text-white rounded mr-2">Start</button>
        <button onClick={stop} disabled={!recording} className="px-3 py-1 bg-red-500 text-white rounded">Stop</button>
      </div>
      {transcript && <div className="mt-2"><strong>Transcript:</strong><pre className="bg-slate-50 p-2 rounded">{transcript}</pre></div>}
    </div>
  );
}
