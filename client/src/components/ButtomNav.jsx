import React from "react";

const BottomNav = () => {
  return (
    <div style={{
      width: "100%",
      padding: "14px 0",
      background: "#f7f7f2",
      borderTop: "1px solid #ddd",
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center"
    }}>
      <img src="/nav-search.svg" width="26" />
      <img src="/nav-globe.svg" width="26" />
      <img src="/nav-spark.svg" width="26" />
      <img src="/nav-wave.svg" width="26" />
    </div>
  );
};

export default BottomNav;
