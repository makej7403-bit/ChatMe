import React from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Chat from "./components/Chat";

export default function App() {
  return (
    <div className="w-screen h-screen flex bg-[#0d0d0d] text-white overflow-hidden">

      {/* Sidebar */}
      <div className="hidden md:flex w-[250px] bg-black/40 border-r border-white/10 backdrop-blur-xl">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 h-full">

        {/* Top Header (Search bar like Perplexity) */}
        <div className="h-[65px] border-b border-white/10 bg-black/30 backdrop-blur-xl flex items-center px-6">
          <Header />
        </div>

        {/* Main Chat Section */}
        <div className="flex-1 overflow-y-auto bg-[#0d0d0d]">
          <Chat />
        </div>

      </div>
    </div>
  );
}
