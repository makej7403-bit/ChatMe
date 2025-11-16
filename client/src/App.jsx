import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ChatPanel from "./components/ChatPanel";
import MainMenu from "./components/MainMenu";
import ModeToolbar from "./components/ModeToolbar"; // <-- ADDED

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-[#0b0f19] text-white min-h-screen flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-10">

          {/* NEW: Perplexity-style toolbar */}
          <ModeToolbar />

          {/* Chat panel */}
          <ChatPanel />

          {/* Bottom menu */}
          <MainMenu />
        </div>
      </div>
    </div>
  );
}
