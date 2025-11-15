import React, { useState } from "react";
import ChatBox from "./components/ChatBox";
import MainMenu from "./components/MainMenu";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-container">
      <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      {menuOpen && <MainMenu />}

      <ChatBox />
    </div>
  );
}
