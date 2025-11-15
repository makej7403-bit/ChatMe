import React, { useState, useEffect } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function Chat() {
  const [user, setUser] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  async function login() {
    const res = await signInWithPopup(auth, googleProvider);
    setUser(res.user);
  }
  async function logout() { await signOut(auth); setUser(null); }

  async function send() {
    if (!input) return;
    setMessages((m) => [...m, { from: "you", text: input }]);
    const token = await auth.currentUser.getIdToken();
    const body = { message: input };

    const r = await fetch(`${BACKEND}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    setMessages((m) => [...m, { from: "ai", text: data.reply }]);
    setInput("");
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2>ChatMe</h2>
        <div>
          {user ? (
            <div>
              <span style={{ marginRight: 8 }}>{user.email}</span>
              <button onClick={logout}>Logout</button>
            </div>
          ) : (
            <button onClick={login}>Sign in with Google</button>
          )}
        </div>
      </div>

      <div style={{ border: "1px solid #ddd", padding: 12, height: 320, overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <b>{m.from}:</b> {m.text}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} style={{ flex: 1, padding: 8 }} />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
