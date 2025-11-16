import React from "react";

export default function AIMessage({ text, sources = [] }) {
  return (
    <div className="bg-[#131821] border border-[#1e2433] p-5 rounded-xl my-4 w-full">

      {/* AI Text */}
      <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
        {text}
      </div>

      {/* Sources Section */}
      {sources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#2a3142]">
          <h3 className="text-sm text-gray-400 mb-2">Sources</h3>
          <ul className="text-sm text-blue-400 space-y-1">
            {sources.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
