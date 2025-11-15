// ImageUploader.jsx
import React, { useState } from "react";

export default function ImageUploader({ apiBase = "" }) {
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState(null);

  async function upload() {
    if (!file) return alert("Choose an image");
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch(`${apiBase}/api/upload-image`, { method: "POST", body: fd });
    const j = await res.json();
    setMeta(j.meta || j);
  }

  return (
    <div className="p-3 bg-white rounded shadow">
      <h3 className="font-semibold mb-2">Upload Image</h3>
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} />
      <div className="mt-2">
        <button onClick={upload} className="px-3 py-1 bg-blue-600 text-white rounded">Upload</button>
      </div>
      {meta && <pre className="mt-2 text-sm bg-slate-50 p-2 rounded">{JSON.stringify(meta, null, 2)}</pre>}
    </div>
  );
}
