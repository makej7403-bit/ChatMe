import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ChatPanel from "./components/ChatPanel";

export default function App() {
  const [page, setPage] = useState("home");
  const [resetChatKey, setResetChatKey] = useState(0);

  return (
    <div className="flex h-screen w-screen bg-[#0d1117] text-white overflow-hidden">

      {/* LEFT SIDEBAR */}
      <Sidebar onSelect={(p) => setPage(p)} />

      {/* RIGHT CONTENT WRAPPER */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">

        {/* TOP NAV BAR */}
        <Topbar 
          onNewChat={() => setResetChatKey(prev => prev + 1)} 
        />

        {/* MAIN CONTENT BELOW TOPBAR */}
        <div className="flex-1 overflow-hidden">
          {page === "home" && <ChatPanel key={resetChatKey} />}
          {page === "discover" && <Placeholder title="Discover" />}
          {page === "library" && <Placeholder title="Library" />}
          {page === "settings" && <Placeholder title="Settings" />}
        </div>
      </div>
    </div>
  );
}

function Placeholder({ title }) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-3xl">
      {title} page coming soon...
    </div>
  );
}
