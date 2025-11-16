import React from "react";
import Header from "./Header";
import BottomNav from "./BottomNav";

export default function HomeScreen() {
  return (
    <div className="ft-shell">
      <Header />

      <main className="ft-main">
        <div className="ft-hero">
          <div className="ft-hero-inner">
            <div className="ft-logo-mark" aria-hidden>
              {/* geometric mark — simple SVG */}
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7v10l9 4 9-4V7L12 3 3 7z"></path>
                <path d="M12 12v6"></path>
              </svg>
            </div>

            <h1 className="ft-tagline">Where knowledge begins</h1>
            <p className="ft-sub">FullTask AI Tutor Pro — Conversational, multimodal tutor built for deep learning.</p>

            <div className="ft-search-wrap">
              <button className="ft-upload-btn" title="Upload image">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="14" rx="2" ry="2"></rect>
                  <path d="M8 21h8"></path>
                  <path d="M12 8v6"></path>
                  <path d="M9 11l3-3 3 3"></path>
                </svg>
              </button>

              <input
                className="ft-search-input"
                placeholder="Ask anything..."
                aria-label="Ask anything"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // TODO: hook to your chat logic
                    alert("Send query: " + e.target.value);
                  }
                }}
              />

              <button className="ft-voice-btn" title="Voice">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1v11"></path>
                  <path d="M8 21h8"></path>
                  <path d="M19 11a7 7 0 0 1-14 0"></path>
                </svg>
              </button>
            </div>

            <div className="ft-feature-row">
              <div className="ft-feature">Image Analyzer</div>
              <div className="ft-feature">Document Q&A</div>
              <div className="ft-feature">Live Call</div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
