import React from "react";

const ImageUpload = ({ onSend }) => {
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("image", file);

    const res = await fetch(import.meta.env.VITE_API_URL + "/image", {
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
        accept="image/*"
        id="img-upload"
        hidden
        onChange={handleFile}
      />
      <label
        htmlFor="img-upload"
        style={{
          background: "#0d2b4c",
          color: "white",
          padding: "12px 18px",
          borderRadius: 40,
        }}
      >
        📷 Image
      </label>
    </>
  );
};

export default ImageUpload;
