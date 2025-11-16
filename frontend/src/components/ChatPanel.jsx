// frontend/src/components/ChatPanel.jsx
import Chat from "./Chat";

export default function ChatPanel() {
  return (
    <div className="w-full h-full flex flex-col items-center overflow-y-auto relative">

      {/* Chat Container */}
      <div className="w-full max-w-3xl px-6 py-6 flex-1 overflow-y-auto">
        <Chat />
      </div>

      {/* Message Input Bar */}
      <div className="w-full flex justify-center p-4 bg-white border-t shadow-lg">
        <div className="max-w-3xl w-full">
          <input
            id="messageInput"
            type="text"
            placeholder="Ask anything..."
            className="w-full px-4 py-3 rounded-xl border bg-[#f2f2f2] outline-none"
          />
        </div>
      </div>
    </div>
  );
}
