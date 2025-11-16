import React from "react";
import { Plus, User, Search } from "lucide-react";

export default function Topbar({ onNewChat }) {
  return (
    <div className="w-full h-16 bg-[#0f1621]/80 backdrop-blur-xl border-b border-[#1b2230] flex items-center px-6 justify-between">

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-[#1a2330] px-4 py-2 rounded-xl w-[50%]">
        <Search className="text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Ask anything…"
          className="bg-transparent outline-none text-gray-200 w-full"
        />
      </div>

      {/* Right Buttons */}
      <div className="flex items-center gap-4">

        {/* New Chat */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          <span className="font-medium">New Chat</span>
        </button>

        {/* Profile */}
        <button className="w-10 h-10 rounded-full bg-[#1a2330] border border-[#2b3343] flex items-center justify-center hover:bg-[#232d40] transition">
          <User className="text-gray-300" />
        </button>
      </div>
    </div>
  );
}
