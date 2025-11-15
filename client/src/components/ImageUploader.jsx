import React, { useState } from "react";

export default function ImageUploader({ apiBase = "" }) {
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState(null);

  async function upload(){
    if (!file) return alert("Choose an image");
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch(`${apiBase}/api/upload-image`, { method: "POST", body: fd });
    const j = await res.json();
    setMeta(j.meta || j);
    alert("Image uploaded. You can now ask about it in chat.");
  }

  return (
    <div className="uploader">
      <div style={{fontWeight:600}}>Image</div>
      <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0])} />
      <div style={{marginTop:6}}><button onClick={upload} className="primary">Upload Image</button></div>
      {meta && <pre style={{marginTop:6, fontSize:12}}>{JSON.stringify(meta, null, 2)}</pre>}
    </div>
  );
}
