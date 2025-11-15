import React, { useState, useEffect } from "react";
import features from "./features";
import MainMenu from "./components/MainMenu";
import Chat from "./components/Chat";

export default function App() {
  const [active, setActive] = useState("chat");

  return (
    <div style={{ fontFamily: "Inter, Arial", padding: 20 }}>
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ width: 320 }}>
          <h1 style={{ color: "#6C63FF" }}>ChatMe v15.0.0</h1>
          <MainMenu features={features} onSelect={setActive} />
        </div>

        <div style={{ flex: 1 }}>
          {active === "chat" && <Chat />}
          {active === "image" && (
            <div>
              <h3>Image Analyzer</h3>
              <p>Upload an image and the AI will analyze it.</p>
              <Upload kind="image" />
            </div>
          )}
          {active === "document" && (
            <div>
              <h3>Document Q&A</h3>
              <Upload kind="doc" />
            </div>
          )}
          {active === "livecall" && (
            <div>
              <h3>Live Call (demo)</h3>
              <p>Click to connect to WebSocket for signaling / demo WebRTC</p>
              <LiveCallDemo />
            </div>
          )}
          {/* Add other UIs as needed */}
        </div>
      </div>
    </div>
  );
}

function Upload({ kind }) {
  const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  async function onFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const token = await (await import("firebase/auth")).getAuth().currentUser.getIdToken();
    const fd = new FormData();
    fd.append("file", file);
    const route = kind === "image" ? "/api/upload/image" : "/api/upload/doc";
    const r = await fetch(`${BACKEND}${route}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });
    const data = await r.json();
    alert(JSON.stringify(data));
  }
  return <input type="file" onChange={onFile} />;
}

function LiveCallDemo() {
  const [ws, setWs] = React.useState(null);
  function start() {
    const url = (import.meta.env.VITE_BACKEND_WS_URL) || "ws://localhost:5000/ws";
    const s = new WebSocket(url);
    s.onopen = () => { alert("WS connected"); setWs(s); };
    s.onmessage = (m) => console.log("ws msg", m.data);
    s.onclose = () => alert("WS closed");
  }
  return <button onClick={start}>Connect to Live Call Signaling</button>;
}
