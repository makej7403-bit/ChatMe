import React from "react";
import TopNav from "./components/TopNav";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import MainMenu from "./components/MainMenu";

export default function App() {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-black to-gray-900 text-white flex">

      {/* Top Navigation */}
      <TopNav />

      {/* Layout wrapper with padding to avoid top bar overlap */}
      <div className="pt-20 w-full flex">

        {/* Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-10">
          <ChatPanel />
          <MainMenu />
        </div>

      </div>
    </div>
  );
}
