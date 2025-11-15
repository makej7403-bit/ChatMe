import React from "react";

export default function MainMenu({ features, onSelect }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
      {features.map((f) => (
        <button
          key={f.id}
          onClick={() => onSelect(f.id)}
          style={{
            padding: 16,
            borderRadius: 12,
            background: "linear-gradient(135deg,#7b1fa2,#03a9f4)",
            color: "#fff",
            border: "none",
            boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
            cursor: "pointer"
          }}
        >
          <div style={{ fontWeight: 700 }}>{f.title}</div>
        </button>
      ))}
    </div>
  );
}
