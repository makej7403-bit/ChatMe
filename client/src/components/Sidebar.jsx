import React from "react";
import { Home, Compass, Book, Settings } from "lucide-react";

export default function Sidebar({ onSelect }) {
  return (
    <div className="h-full w-64 bg-[#0d1117] border-r border-[#1b2230] flex flex-col py-6 px-4">

      <h1 className="text-white text-2xl font-bold mb-8">
        FullTask <span className="text-blue-500">AI Tutor Pro</span>
      </h1>

      <nav className="flex flex-col space-y-2">
        <SidebarItem icon={<Home />} text="Home" onClick={() => onSelect("home")} />
        <SidebarItem icon={<Compass />} text="Discover" onClick={() => onSelect("discover")} />
        <SidebarItem icon={<Book />} text="Library" onClick={() => onSelect("library")} />
        <SidebarItem icon={<Settings />} text="Settings" onClick={() => onSelect("settings")} />
      </nav>

      <div className="mt-auto pt-6 border-t border-[#1b2230] text-gray-400 text-sm">
        © 2025 FullTask AI Tutor Pro
      </div>

    </div>
  );
}

function SidebarItem({ icon, text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-[#1a2332] px-3 py-2 rounded-xl transition"
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}
