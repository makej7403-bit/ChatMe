import React from "react";

export default function Header() {
  return (
    <div className="w-full">

      {/* Search Input Box */}
      <input
        type="text"
        placeholder="Ask anything…"
        className="w-full h-11 px-4 text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-white/30 transition"
      />

    </div>
  );
}
