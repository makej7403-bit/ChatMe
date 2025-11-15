import { useState, useRef } from "react";
import { SERVER_URL } from "../config";

export default function LiveCall({ token }) {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Not connected");
  const wsRef = useRef(null);
  const audioRef = useRef(null);
  const mediaRecorder = useRef(null);

  async function startCall() {
    setStatus("Connecting...");

    wsRef.current = new WebSocket(
      `${SERVER_URL.replace("https", "wss")}/live?token=${token}`
    );

    wsRef.current.onopen = async () => {
      setStatus("Connected");
      setConnected(true);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: "audio/webm" });

      mediaRecorder.current.ondataavailable = (e) => {
        if (wsRef.current.readyState === 1) wsRef.current.send(e.data);
      };

      mediaRecorder.current.start(250);
    };

    wsRef.current.onmessage = (event) => {
      const blob = new Blob([event.data], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);
      audioRef.current.src = url;
      audioRef.current.play();
    };

    wsRef.current.onclose = () => {
      setConnected(false);
      setStatus("Disconnected");
    };
  }

  function stopCall() {
    try {
      mediaRecorder.current?.stop();
      wsRef.current?.close();
    } catch {}
    setConnected(false);
    setStatus("Call Ended");
  }

  return (
    <div className="p-4">
      <audio ref={audioRef} hidden />

      {!connected ? (
        <button
          onClick={startCall}
          className="w-full px-4 py-2 bg-green-600 text-white rounded"
        >
          Start Live Call
        </button>
      ) : (
        <button
          onClick={stopCall}
          className="w-full px-4 py-2 bg-red-600 text-white rounded"
        >
          End Call
        </button>
      )}

      <p className="mt-3">{status}</p>
    </div>
  );
}
