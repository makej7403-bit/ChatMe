import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function ChatPanel({ user }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [backendBase, setBackendBase] = useState('') // optionally set to absolute URL when deployed

  useEffect(() => {
    // If your backend is on a different domain, set backendBase e.g. https://your-backend.onrender.com
    // setBackendBase('https://your-backend.onrender.com')

    function handler(e) {
      const feature = e.detail
      runFeature(feature)
    }
    window.addEventListener('chatme:runFeature', handler)
    return () => window.removeEventListener('chatme:runFeature', handler)
  }, [])

  async function runFeature(feature) {
    setMessages(m => [...m, { role: 'system', text: `Running feature: ${feature.title}` }])
    try {
      const res = await axios.post(`${backendBase}/api/ai/${feature.id}`, { prompt: feature.defaultPrompt || '' })
      setMessages(m => [...m, { role: 'assistant', text: res.data.result }])
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', text: 'Error: ' + (err.response?.data?.error || err.message || 'unknown') }])
    }
  }

  async function handleSend() {
    if (!input) return
    setMessages(m => [...m, { role: 'user', text: input }])
    try {
      const res = await axios.post(`${backendBase}/api/ai/chat`, { prompt: input })
      setMessages(m => [...m, { role: 'assistant', text: res.data.result }])
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', text: 'Error: ' + (err.response?.data?.error || err.message || 'unknown') }])
    }
    setInput('')
  }

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
            <div className={`inline-block p-2 rounded ${m.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input className="flex-1 p-2 border rounded" value={input} onChange={e => setInput(e.target.value)} />
        <button onClick={handleSend} className="px-4 py-2 bg-green-600 text-white rounded">Send</button>
      </div>
    </div>
  )
}
