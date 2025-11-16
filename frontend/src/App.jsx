// frontend/src/App.jsx
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";

export default function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f7f7f8]">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Chat Panel */}
      <div className="flex flex-col flex-1 h-full">
        <ChatPanel />
      </div>
    </div>
  );
}
