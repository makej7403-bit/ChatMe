import { useState } from "react";
import { SERVER_URL } from "../config";

export default function ChatPanel({ token }) {
  const [msg, setMsg] = useState("");
  const [reply, setReply] = useState("");

  async function sendMessage() {
    const res = await fetch(`${SERVER_URL}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ message: msg })
    });

    const data = await res.json();
    setReply(data.reply);
  }

  return (
    <div className="mt-6">
      <textarea
        className="border p-2 w-full"
        rows={3}
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
      />

      <button
        onClick={sendMessage}
        className="bg-green-600 px-4 py-2 text-white mt-2 rounded-lg"
      >
        Send
      </button>

      {reply && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <strong>AI:</strong> {reply}
        </div>
      )}
    </div>
  );
}
