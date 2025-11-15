// LiveCall.jsx
import React, { useEffect, useRef, useState } from "react";

export default function LiveCall({ apiBase = "" }) {
  const [ws, setWs] = useState(null);
  const mediaRef = useRef(null);
  const recorderRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [log, setLog] = useState([]);

  useEffect(() => {
    return () => {
      if (ws) ws.close();
      if (recorderRef.current) recorderRef.current.stop();
    };
  }, []);

  function addLog(line) {
    setLog((l) => [...l, line].slice(-30));
  }

  async function startCall() {
    const socket = new WebSocket((apiBase || "") + "/ws".replace(/\/\//g, "/"));
    socket.onopen = () => {
      setConnected(true);
      addLog("WS connected");
    };
    socket.onmessage = (ev) => {
      try {
        const m = JSON.parse(ev.data);
        if (m.type === "reply") {
          const text = m.payload.text;
          addLog("AI: " + text);
          // speak locally
          speakText(text);
        } else if (m.type === "transcript") {
          addLog("Transcribed: " + (m.payload?.text || ""));
        } else if (m.type === "error") {
          addLog("Error: " + m.payload?.message);
        }
      } catch (e) {
        addLog("MSG: " + ev.data);
      }
    };
    socket.onclose = () => {
      setConnected(false);
      addLog("WS closed");
    };
    setWs(socket);

    // start sending audio chunks
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
    recorderRef.current = mr;
    mr.ondataavailable = (e) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        socket.send(JSON.stringify({ type: "audio-chunk", payload: { audioBase64: base64, mime: "audio/webm" } }));
        addLog("Sent audio chunk: " + base64.slice(0, 16) + "...");
      };
      reader.readAsDataURL(e.data);
    };
    mr.start(800); // collect ~800ms chunks
    addLog("Started microphone recording and streaming chunks");
  }

  function stopCall() {
    if (recorderRef.current) recorderRef.current.stop();
    if (ws) ws.close();
    setConnected(false);
    addLog("Call stopped");
  }

  function speakText(text) {
    if (!("speechSynthesis" in window)) return;
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
  }

  return (
    <div className="p-3 bg-white rounded shadow">
      <h3 className="font-semibold mb-2">Live Call with AI</h3>
      <div className="flex gap-2">
        <button onClick={startCall} disabled={connected} className="px-3 py-1 bg-green-600 text-white rounded">Start Call</button>
        <button onClick={stopCall} disabled={!connected} className="px-3 py-1 bg-red-500 text-white rounded">Stop Call</button>
      </div>
      <div className="mt-2 text-sm bg-slate-50 p-2 rounded h-40 overflow-auto">
        {log.map((l, i) => <div key={i}><small>{l}</small></div>)}
      </div>
    </div>
  );
}
