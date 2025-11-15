import React, { useRef, useState } from "react";

export default function VoiceRecorder({ apiBase = "" }) {
  const mediaRef = useRef(null);
  const recorderRef = useRef(null);
  const [transcript, setTranscript] = useState("");

  async function startRecording(){
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRef.current = stream;
    const mr = new MediaRecorder(stream);
    recorderRef.current = mr;
    const chunks = [];
    mr.ondataavailable = (e)=>chunks.push(e.data);
    mr.onstop = async ()=>{
      const blob = new Blob(chunks, { type: "audio/webm" });
      const fd = new FormData();
      fd.append("audio", blob, "rec.webm");
      const res = await fetch(`${apiBase}/api/transcribe`, { method: "POST", body: fd });
      const j = await res.json();
      setTranscript(j.text || JSON.stringify(j));
      alert("Transcription done. You can ask about it in chat.");
    };
    mr.start();
  }

  function stopRecording(){
    if (recorderRef.current) recorderRef.current.stop();
    if (mediaRef.current) mediaRef.current.getTracks().forEach(t=>t.stop());
  }

  return (
    <div className="uploader">
      <div style={{fontWeight:600}}>Voice</div>
      <div style={{display:"flex", gap:8}}>
        <button onClick={startRecording} className="primary">Start</button>
        <button onClick={stopRecording} style={{background:"#ef4444", color:"#fff", border:"none", padding:"8px 10px", borderRadius:6}}>Stop</button>
      </div>
      {transcript && <pre style={{marginTop:8, fontSize:12}}>{transcript}</pre>}
    </div>
  );
}
