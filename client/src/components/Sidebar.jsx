import { useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  History,
  Bookmark,
  Settings,
  Menu,
  X,
} from "lucide-react";

export function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <motion.div
      animate={{ width: open ? 260 : 80 }}
      transition={{ duration: 0.25 }}
      className="h-full bg-[#131417] border-r border-[#1f2024] flex flex-col"
    >
      {/* Top */}
      <div className="flex items-center justify-between p-4">
        {open && (
          <h1 className="text-lg font-semibold tracking-wide">
            FullTask AI  
          </h1>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="p-2 hover:bg-[#1f2024] rounded-xl"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-1 px-3 mt-2">
        <SidebarButton icon={<Home size={18} />} label="Home" open={open} />
        <SidebarButton icon={<History size={18} />} label="History" open={open} />
        <SidebarButton icon={<Bookmark size={18} />} label="Saved" open={open} />
        <SidebarButton icon={<Settings size={18} />} label="Settings" open={open} />
      </div>

      {/* Bottom */}
      <div className="mt-auto p-4 text-xs opacity-50">
        {open && "v1.0 — FullTask AI Tutor Pro"}
      </div>
    </motion.div>
  );
}

function SidebarButton({ icon, label, open }) {
  return (
    <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1f2024] w-full text-left">
      {icon}
      {open && <span className="text-sm">{label}</span>}
    </button>
  );
}
