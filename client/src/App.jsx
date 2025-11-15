import React, { useEffect, useState } from "react";
import features from "./features/aiFeatureTemplates";
import ImageUploader from "./components/ImageUploader";
import DocumentUploader from "./components/DocumentUploader";
import VoiceRecorder from "./components/VoiceRecorder";
import LiveCall from "./components/LiveCall";

const API_BASE = ""; // empty means relative paths to your Render service

export default function App(){
  const [active, setActive] = useState(features[0].id);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(()=> {
    // default welcome
    setMessages([{ role: "ai", text: "Hello — ChatMe v15.0.0. Ask me anything or upload files. (Ask 'who created you?')" }]);
  }, []);

  async function sendText(){
    if (!input) return;
    const text = input; setInput("");
    setMessages(m => [...m, { role: "user", text }]);
    setLoading(true);
    const res = await fetch("/api/ai/chat", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ message: text }) });
    const j = await res.json();
    setMessages(m => [...m, { role: "ai", text: j.reply || j.error || "No reply" }]);
    setLoading(false);
  }

  return (
    <div className="container">
      <div className="header">
        <div style={{display:"flex", gap:12, alignItems:"center"}}>
          <div style={{width:48,height:48,borderRadius:10,background:"linear-gradient(45deg,#2563eb,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700}}>CM</div>
          <div>
            <div style={{fontSize:18,fontWeight:600}}>ChatMe Pro</div>
            <div className="small">v15.0.0 — Created by Akin S. Sokpah (Liberia)</div>
          </div>
        </div>
        <div className="small">Live audio call & multimodal Q&A enabled</div>
      </div>

      <div className="grid">
        <div className="sidebar">
          <input placeholder="Search features..." style={{width:"100%",padding:8,marginBottom:8,borderRadius:6,border:"1px solid #e6e9ee"}} />
          {features.map(f => (
            <button key={f.id} className="feature-btn" onClick={() => setActive(f.id)}>
              <div style={{fontWeight:600}}>{f.title}</div>
              <div className="small">{f.defaultPrompt}</div>
            </button>
          ))}
          <hr style={{margin:"10px 0"}} />
          <div className="small">Upload / Call tools</div>
          <div style={{marginTop:8}}><ImageUploader apiBase={API_BASE} /></div>
          <div style={{marginTop:8}}><DocumentUploader apiBase={API_BASE} /></div>
          <div style={{marginTop:8}}><VoiceRecorder apiBase={API_BASE} /></div>
          <div style={{marginTop:8}}><LiveCall apiBase={API_BASE} /></div>
        </div>

        <div className="panel">
          <div style={{fontWeight:600, marginBottom:8}}>{features.find(x=>x.id===active)?.title || "Chat"}</div>
          <div className="messages">
            {messages.map((m,i)=>(
              <div key={i} className={`msg ${m.role==='user' ? 'user':'ai'}`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="controls">
            <input type="text" value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Type a message..." onKeyDown={(e)=>{ if (e.key==='Enter') sendText() }} />
            <button className="primary" onClick={sendText} disabled={loading}>{loading ? "..." : "Send"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
