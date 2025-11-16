import React from "react";

const DocumentUpload = ({ onSend }) => {
  const handleDoc = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("document", file);

    const res = await fetch(import.meta.env.VITE_API_URL + "/document", {
      method: "POST",
      body: form
    });

    const data = await res.json();
    onSend(data.reply);
  };

  return (
    <>
      <input
        type="file"
        id="doc-upload"
        hidden
        onChange={handleDoc}
      />

      <label
        htmlFor="doc-upload"
        style={{
          background: "#0d2b4c",
          color: "white",
          padding: "12px 18px",
          borderRadius: 40,
        }}
      >
        📄 Document
      </label>
    </>
  );
};

export default DocumentUpload;
