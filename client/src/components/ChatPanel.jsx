import React, { useEffect, useRef, useState } from 'react';

export default function ChatPanel({ user }){
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  useEffect(()=> { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [messages]);

  useEffect(()=> {
    function handler(e){ runFeature(e.detail) }
    window.addEventListener('chatme:runFeature', handler);
    return () => window.removeEventListener('chatme:runFeature', handler);
  }, [user]);

  async function runFeature(feature){
    const prompt = feature.defaultPrompt || '';
    await streamRequest(`/api/ai/${feature.id}`, { prompt }, feature.title || feature.id);
  }

  async function sendChat(){
    if (!input) return;
    const text = input; setInput('');
    setMessages(m => [...m, { role: 'user', text }]);
    await streamRequest('/api/ai/chat', { prompt: text }, 'Chat');
  }

  async function streamRequest(url, body, label){
    setLoading(true);
    setMessages(m => [...m, { role: 'assistant', text: '', streaming: true, label }]);
    const headers = { 'Content-Type': 'application/json' };
    if (user) headers['x-user-uid'] = user.uid;
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });

    const ctype = res.headers.get('content-type') || '';
    if (ctype.includes('application/json')) {
      const j = await res.json();
      setMessages(m => m.map(msg => msg.streaming ? { role:'assistant', text: j.result || j.answer || '' } : msg));
      setLoading(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const raw = decoder.decode(value);
      if (!raw) continue;
      if (raw.includes('[DONE]')) break;
      const cleaned = raw.replace(/data:\s*/g, '');
      buffer += cleaned;
      setMessages(m => m.map(msg => msg.streaming ? { role: 'assistant', text: buffer } : msg ));
    }

    setMessages(m => m.map(msg => msg.streaming ? { role: 'assistant', text: buffer } : msg ));
    setLoading(false);
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow chat-card" style={{height:'72vh', display:'flex', flexDirection:'column'}}>
      <div className="flex-1 overflow-auto" ref={scrollRef}>
        {messages.map((m,i)=>(
          <div key={i} className={`mb-3 flex ${m.role==='user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-md`} style={{background: m.role==='user' ? '#daf1ff' : '#f3f0ff', maxWidth:'78%'}}>{m.text || (m.streaming ? '...' : '')}</div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendChat() }} className="flex-1 p-3 border rounded" placeholder="Type your message..." />
        <button onClick={sendChat} className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{loading ? '...' : 'Send'}</button>
      </div>
    </div>
  );
}
