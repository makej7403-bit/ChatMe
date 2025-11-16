import React from "react";
import { Lightbulb, FileSearch, Brain, ImageIcon, BookOpen } from "lucide-react";

const suggestions = [
  {
    icon: <Lightbulb size={22} />,
    title: "Generate New Ideas",
    prompt: "Give me creative ideas about..."
  },
  {
    icon: <FileSearch size={22} />,
    title: "Explain Something",
    prompt: "Explain this topic in simple terms..."
  },
  {
    icon: <Brain size={22} />,
    title: "Analyze Anything",
    prompt: "Analyze the following situation..."
  },
  {
    icon: <ImageIcon size={22} />,
    title: "Describe an Image",
    prompt: "Upload an image and ask anything about it."
  },
  {
    icon: <BookOpen size={22} />,
    title: "Summarize a Document",
    prompt: "Upload a document and summarize it."
  },
];

export default function SmartSuggestions({ onSelect }) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3 text-gray-200">
        Try asking me:
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((item, i) => (
          <button
            key={i}
            onClick={() => onSelect(item.prompt)}
            className="p-4 rounded-2xl bg-[#141a28] border border-[#222b3d] hover:border-blue-400 hover:bg-[#1a2235] transition-all flex items-start gap-3 text-left group"
          >
            <div className="text-blue-300 group-hover:text-blue-400">
              {item.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">{item.title}</h3>
              <p className="text-gray-400 text-sm mt-1">{item.prompt}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
