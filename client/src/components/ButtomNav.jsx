import React from "react";

function Icon({ children, label }) {
  return (
    <button className="bottom-icon" aria-label={label}>
      {children}
    </button>
  );
}

export default function BottomNav() {
  return (
    <nav className="ft-bottom-nav">
      <Icon label="search">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="6"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </Icon>

      <Icon label="globe">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M2 12h20"></path>
          <path d="M12 2a15 15 0 0 0 0 20"></path>
        </svg>
      </Icon>

      <Icon label="explore">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 22 21 2 9 13 2"></polygon>
        </svg>
      </Icon>

      <Icon label="settings">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82L4.2 3.46A2 2 0 1 1 7 0l.06.06A1.65 1.65 0 0 0 8.88.39 1.65 1.65 0 0 0 10 1.9V2a2 2 0 1 1 4 0v.09c.2.67.72 1.21 1.39 1.45"/>
        </svg>
      </Icon>
    </nav>
  );
}
