import React, { useRef, useState } from "react";

export default function LiveCall({ apiBase = "" }) {
  const wsRef = useRef(null);
  const recorderRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [log, setLog] = useState([]);

  function addLog(t){ setLog(s=>[...s, t].slice(-40)); }

  async function startCall(){
    const url = (apiBase || "") + "/ws";
    const socket = new WebSocket(url.replace(/\/\//,"/"));
    wsRef.current = socket;

    socket.onopen = ()=>{ setConnected(true); addLog("WS open"); };
    socket.onmessage = (ev)=> {
      try {
        const m = JSON.parse(ev.data);
        if (m.type === "reply") { addLog("AI: "+ m.payload.text); speak(m.payload.text); }
        else if (m.type === "transcript") addLog("Transcribed: "+ (m.payload.text||""));
        else if (m.type === "error") addLog("Error: "+m.payload.message);
      } catch(e){ addLog("Msg: "+ev.data); }
    };
    socket.onclose = ()=>{ setConnected(false); addLog("WS closed"); };

    // start mic
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
    recorderRef.current = mr;
    mr.ondataavailable = (e)=>{
      if (socket.readyState !== WebSocket.OPEN) return;
      const reader = new FileReader();
      reader.onload = ()=> {
        const base64 = reader.result.split(",")[1];
        socket.send(JSON.stringify({ type: "audio-chunk", payload: { audioBase64: base64, mime: "audio/webm" } }));
        addLog("Sent chunk");
      };
      reader.readAsDataURL(e.data);
    };
    mr.start(900); // chunk ~900ms
    addLog("Started streaming audio");
  }

  function stopCall(){
    if (recorderRef.current) recorderRef.current.stop();
    if (wsRef.current) wsRef.current.close();
    setConnected(false);
    addLog("Call stopped");
  }

  function speak(text){
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  return (
    <div className="uploader">
      <div style={{fontWeight:600}}>Live Call</div>
      <div style={{display:"flex", gap:8}}>
        <button onClick={startCall} className="primary" disabled={connected}>Start Call</button>
        <button onClick={stopCall} style={{background:"#ef4444", color:"#fff", border:"none", padding:"8px 10px", borderRadius:6}} disabled={!connected}>Stop</button>
      </div>
      <div style={{marginTop:8, maxHeight:160, overflow:"auto"}}>
        {log.map((l,i)=><div key={i} style={{fontSize:12}}>{l}</div>)}
      </div>
    </div>
  );
}
