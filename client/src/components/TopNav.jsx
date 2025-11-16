import React from "react";
import { FiHome, FiShare2, FiSettings, FiUser } from "react-icons/fi";

export default function TopNav() {
  return (
    <div className="
      w-full fixed top-0 left-0 z-40
      backdrop-blur-xl bg-black/20 border-b border-white/10
      flex items-center justify-between
      px-6 py-4
    ">
      
      {/* Left - Home */}
      <button className="text-white/80 hover:text-white transition text-xl">
        <FiHome />
      </button>

      {/* Center - Branding */}
      <div className="text-white text-lg md:text-xl font-semibold tracking-wide">
        FullTask AI Tutor Pro
      </div>

      {/* Right - Icons */}
      <div className="flex items-center gap-6 text-xl text-white/80">

        <button className="hover:text-white transition">
          <FiShare2 />
        </button>

        <button className="hover:text-white transition">
          <FiSettings />
        </button>

        <button className="hover:text-white transition">
          <FiUser />
        </button>

      </div>
    </div>
  );
}
