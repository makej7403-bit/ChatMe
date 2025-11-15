import { useState } from "react";

export default function Sidebar({ onSelect }) {
  const [active, setActive] = useState("chat");

  function select(name) {
    setActive(name);
    onSelect(name);
  }

  return (
    <aside className="w-64 h-full bg-gray-100 border-r p-4">
      <h2 className="text-lg font-semibold mb-4">Menu</h2>

      <nav className="flex flex-col gap-2">
        <button
          className={`p-2 rounded ${active === "chat" ? "bg-blue-500 text-white" : "bg-white"}`}
          onClick={() => select("chat")}
        >
          AI Chat
        </button>

        <button
          className={`p-2 rounded ${active === "image" ? "bg-blue-500 text-white" : "bg-white"}`}
          onClick={() => select("image")}
        >
          Image Uploader
        </button>

        <button
          className={`p-2 rounded ${active === "doc" ? "bg-blue-500 text-white" : "bg-white"}`}
          onClick={() => select("doc")}
        >
          Document Uploader
        </button>

        <button
          className={`p-2 rounded ${active === "voice" ? "bg-blue-500 text-white" : "bg-white"}`}
          onClick={() => select("voice")}
        >
          Voice Recorder
        </button>

        <button
          className={`p-2 rounded ${active === "call" ? "bg-blue-500 text-white" : "bg-white"}`}
          onClick={() => select("call")}
        >
          Live Voice Call
        </button>

        <button
          className={`p-2 rounded ${active === "premium" ? "bg-yellow-500 text-white" : "bg-white"}`}
          onClick={() => select("premium")}
        >
          Premium Access
        </button>
      </nav>
    </aside>
  );
}
