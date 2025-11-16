import React from "react";

export default function Sidebar() {
  return (
    <div className="flex flex-col w-full h-full p-4 text-white">

      <h1 className="text-xl font-semibold mb-6 opacity-70">
        FullTask AI Tutor Pro
      </h1>

      <button className="mb-3 text-left px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition">
        + New Chat
      </button>

      <div className="mt-6 opacity-60 text-sm">
        History
      </div>

      <div className="flex-1 mt-3 space-y-2 text-white/70 text-sm">
        <p className="hover:bg-white/10 p-2 rounded-lg cursor-pointer">Today</p>
        <p className="hover:bg-white/10 p-2 rounded-lg cursor-pointer">Yesterday</p>
        <p className="hover:bg-white/10 p-2 rounded-lg cursor-pointer">Last 7 days</p>
      </div>

      <div className="mt-auto opacity-60 text-sm">
        Settings
      </div>

    </div>
  );
}
