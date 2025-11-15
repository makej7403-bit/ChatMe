// inside App.jsx (replace Upload function)
function Upload({ kind }) {
  const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  async function onFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const token = await (await import("firebase/auth")).getAuth().currentUser.getIdToken();
    const fd = new FormData();
    fd.append("file", file);
    const route = kind === "image" ? "/api/upload/image" : "/api/upload/doc";
    const r = await fetch(`${BACKEND}${route}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });
    const data = await r.json();
    if (data.analysis) {
      alert("Analysis result:\n\n" + data.analysis.substring(0, 2000));
    } else {
      alert(JSON.stringify(data));
    }
  }
  return <input type="file" onChange={onFile} />;
}
