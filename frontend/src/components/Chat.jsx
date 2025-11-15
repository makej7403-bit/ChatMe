import React, { useState, useEffect } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function Chat() {
  const [user, setUser] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  async function login() {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      setUser(res.user);
    } catch (e) {
      console.error("Login error", e);
    }
  }
  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  // Non-stream send (keeps compatibility)
  async function sendSimple() {
    if (!input) return;
    setMessages((m) => [...m, { from: "you", text: input }]);
    const token = await auth.currentUser.getIdToken();
    const r = await fetch(`${BACKEND}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: input })
    });
    const data = await r.json();
    setMessages((m) => [...m, { from: "ai", text: data.reply }]);
    setInput("");
  }

  // Streaming send
  async function sendStream() {
    if (!input) return;
    setMessages((m) => [...m, { from: "you", text: input }]);
    // placeholder stream message with id to replace later
    setMessages((m) => [...m, { from: "ai", text: "" , streaming: true}]);

    const token = await auth.currentUser.getIdToken();

    // POST then stream response body (SSE-like but we used raw streaming)
    const resp = await fetch(`${BACKEND}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: input })
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      setMessages((m) => [...m, { from: "ai", text: `Error: ${err?.error || resp.statusText}` }]);
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let aiText = "";
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        // The server sends SSE-like lines: data: {"chunk":"..."}\n\n or data: [DONE]\n\n
        // We'll extract JSON occurrences
        const parts = chunk.split("\n\n");
        for (const part of parts) {
          if (!part.trim()) continue;
          const line = part.replace(/^data:\s*/, "").trim();
          if (line === "[DONE]") {
            done = true;
            break;
          }
          try {
            const payload = JSON.parse(line);
            if (payload.chunk) {
              aiText += payload.chunk;
              // replace last streaming message
              setMessages((prev) => {
                // drop last streaming placeholder(s)
                const others = prev.filter((x, idx) => {
                  // keep all except last streaming placeholder
                  return true;
                });
                // find index of previous ai streaming message
                const lastIdx = prev.map(p => p.streaming).lastIndexOf(true);
                if (lastIdx === -1) {
                  return [...prev, { from: "ai", text: aiText }];
                } else {
                  // update that message
                  const copy = prev.slice();
                  copy[lastIdx] = { from: "ai", text: aiText };
                  return copy;
                }
              });
            } else if (payload.error) {
              setMessages((m) => [...m, { from: "ai", text: `Error: ${payload.details || payload.error}` }]);
            }
          } catch (e) {
            // ignore non-json lines
          }
        }
      }
    }

    // final: ensure final text in messages (already updated incrementally)
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
        <button onClick={sendStream}>Send (stream)</button>
        <button onClick={sendSimple}>Send (simple)</button>
      </div>
    </div>
  );
}
