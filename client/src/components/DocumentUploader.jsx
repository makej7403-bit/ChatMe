import React, { useState } from "react";

export default function DocumentUploader({ apiBase = "" }) {
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState(null);

  async function upload(){
    if (!file) return alert("Choose a document");
    const fd = new FormData();
    fd.append("doc", file);
    const res = await fetch(`${apiBase}/api/upload-doc`, { method: "POST", body: fd });
    const j = await res.json();
    setMeta(j.meta || j);
    alert("Document uploaded. You can now ask about it in chat.");
  }

  return (
    <div className="uploader">
      <div style={{fontWeight:600}}>Document</div>
      <input type="file" accept=".pdf,.txt" onChange={e=>setFile(e.target.files?.[0])} />
      <div style={{marginTop:6}}><button onClick={upload} className="primary">Upload Document</button></div>
      {meta && <pre style={{marginTop:6, fontSize:12}}>{JSON.stringify(meta, null, 2)}</pre>}
    </div>
  );
}
