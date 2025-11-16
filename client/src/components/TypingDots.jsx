import React from "react";

export default function TypingDots() {
  return (
    <div className="flex gap-2 mt-4">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
      <span
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "0.15s" }}
      ></span>
      <span
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "0.3s" }}
      ></span>
    </div>
  );
}
