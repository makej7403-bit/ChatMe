// DocumentUploader.jsx
import React, { useState } from "react";

export default function DocumentUploader({ apiBase = "" }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  async function upload() {
    if (!file) return alert("Choose a document (PDF or text)");
    const fd = new FormData();
    fd.append("doc", file);
    const res = await fetch(`${apiBase}/api/upload-doc`, { method: "POST", body: fd });
    const j = await res.json();
    setPreview(j);
  }

  return (
    <div className="p-3 bg-white rounded shadow">
      <h3 className="font-semibold mb-2">Upload Document</h3>
      <input type="file" accept=".pdf,.txt" onChange={(e) => setFile(e.target.files?.[0])} />
      <div className="mt-2">
        <button onClick={upload} className="px-3 py-1 bg-blue-600 text-white rounded">Upload</button>
      </div>
      {preview && <pre className="mt-2 text-sm bg-slate-50 p-2 rounded">{JSON.stringify(preview, null, 2)}</pre>}
    </div>
  );
}
