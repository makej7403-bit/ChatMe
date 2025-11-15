// frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import { onAuthStateChanged, getAuth } from "firebase/auth";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MainMenu from "./components/MainMenu";
import ChatPanel from "./components/ChatPanel";
import PremiumModal from "./components/PremiumModal";

export default function App() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("menu");
  const [premiumOpen, setPremiumOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
    });
    return () => unsub();
  }, []);

  if (!user) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">ChatMe</h1>
          <p className="mb-4">Login to get started</p>
          <a
            href="/google-login"
            className="px-4 py-2 bg-white text-black font-bold rounded"
          >
            Sign in with Google
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-white">
      <Sidebar setActivePage={setActivePage} openPremium={() => setPremiumOpen(true)} />
      <div className="flex flex-col flex-1">
        <Header user={user} />
        {activePage === "menu" && <MainMenu setActivePage={setActivePage} />}
        {activePage === "chat" && <ChatPanel />}
      </div>

      <PremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </div>
  );
}
