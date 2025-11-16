import { Search, Mic, Image } from "lucide-react";

export function Header({ onSearch }) {
  return (
    <div className="flex items-center justify-between w-full border-b border-[#1f2024] px-6 py-4 bg-[#131417]">
      
      {/* Search bar */}
      <div className="flex items-center gap-3 bg-[#1c1d21] px-4 py-3 rounded-2xl w-full max-w-3xl">
        <Search size={18} className="opacity-60" />
        <input
          type="text"
          placeholder="Ask anything…"
          onKeyDown={(e) => e.key === "Enter" && onSearch(e.target.value)}
          className="bg-transparent w-full outline-none"
        />
        <Mic size={18} className="opacity-60" />
        <Image size={18} className="opacity-60" />
      </div>

      {/* Right buttons */}
      <div className="flex items-center gap-4 ml-4">
        <button className="px-4 py-2 bg-[#1c1d21] rounded-xl text-sm hover:bg-[#25262b]">
          Upgrade
        </button>
      </div>
    </div>
  );
}
