import React from "react";
import { 
  FiMessageCircle, 
  FiImage, 
  FiMic, 
  FiFileText, 
  FiSearch, 
  FiCode, 
  FiBookOpen,
  FiMoreHorizontal
} from "react-icons/fi";

export default function ModeToolbar() {
  const modes = [
    { name: "Chat", icon: <FiMessageCircle /> },
    { name: "Image", icon: <FiImage /> },
    { name: "Document", icon: <FiFileText /> },
    { name: "Voice", icon: <FiMic /> },
    { name: "Web Search", icon: <FiSearch /> },
    { name: "Code", icon: <FiCode /> },
    { name: "Tutor", icon: <FiBookOpen /> },
    { name: "More", icon: <FiMoreHorizontal /> },
  ];

  return (
    <div className="
      w-full mt-4 mb-4
      flex items-center gap-3 
      overflow-x-auto no-scrollbar
      py-2 px-2
    ">
      {modes.map((m) => (
        <button
          key={m.name}
          className="
            flex items-center gap-2 
            px-4 py-2
            rounded-xl bg-white/5 border border-white/10
            text-white/80 hover:text-white hover:bg-white/10 transition
            min-w-fit
          "
        >
          <span className="text-lg">{m.icon}</span>
          <span className="text-sm font-medium">{m.name}</span>
        </button>
      ))}
    </div>
  );
}
