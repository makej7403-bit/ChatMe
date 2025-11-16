import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="flex h-screen w-screen bg-[#0d1117] text-white overflow-hidden">

      {/* LEFT SIDEBAR */}
      <Sidebar onSelect={(p) => setPage(p)} />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 h-full overflow-hidden">
        {page === "home" && <ChatPanel />}
        {page === "discover" && <Placeholder title="Discover" />}
        {page === "library" && <Placeholder title="Library" />}
        {page === "settings" && <Placeholder title="Settings" />}
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
