import React from "react";

const Header = () => {
  return (
    <div style={{
      width: "100%",
      padding: "18px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #ddd",
      background: "#f7f7f2"
    }}>
      <img src="/user-icon.svg" alt="user" width={26} />

      <h1 style={{ fontSize: 22, fontWeight: 600, color: "#0d2b4c" }}>
        FullTask AI Tutor Pro
      </h1>

      <img src="/share.svg" alt="share" width={26} />
    </div>
  );
};

export default Header;
