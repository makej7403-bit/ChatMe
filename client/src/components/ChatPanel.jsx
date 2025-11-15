import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'

export default function ChatPanel({ user }) {
  const [messages, setMessages] = useState([]) // {role:'user'|'assistant', text}
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  useEffect(() => {
    function handler(e) {
      const feature = e.detail
      runFeature(feature)
    }
    window.addEventListener('chatme:runFeature', handler)
    return () => window.removeEventListener('chatme:runFeature', handler)
  }, [user])

  function pushMessage(msg) {
    setMessages(m => [...m, msg])
  }

  async function runFeature(feature) {
    const prompt = feature.defaultPrompt || ''
    pushMessage({ role: 'system', text: `Running: ${feature.title || feature.id}` })
    await streamRequest(`/api/ai/${feature.id}`, { prompt }, feature.title)
  }

  async function sendChat() {
    if (!input) return
    const text = input
    setInput('')
    pushMessage({ role: 'user', text })
    await streamRequest('/api/ai/chat', { prompt: text }, 'Chat')
  }

  async function streamRequest(url, body, label) {
    setLoading(true)
    // optimistic streaming placeholder
    pushMessage({ role: 'assistant', text: '', streaming: true, label })

    const headers = { 'Content-Type': 'application/json' }
    if (user) headers['x-user-uid'] = user.uid

    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })

    // if server returns JSON (creator quick reply), handle that
    const ctype = res.headers.get('content-type') || ''
    if (ctype.includes('application/json')) {
      const j = await res.json()
      // replace streaming placeholder
      setMessages(m => m.map(msg => msg.streaming ? { role: 'assistant', text: j.result || j.answer || '' } : msg))
      setLoading(false)
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      if (!chunk) continue
      if (chunk.includes('[DONE]')) break

      // remove leading "data:" markers (server sends `data: <chunk>\n\n`)
      const cleaned = chunk.replace(/data:\s*/g, '')
      buffer += cleaned
      // update streaming message
      setMessages(m => m.map(msg => msg.streaming ? { role: 'assistant', text: buffer } : msg))
    }

    // finalize: replace streaming with final message
    setMessages(m => m.map(msg => msg.streaming ? { role: 'assistant', text: buffer } : msg))
    setLoading(false)
  }

  return (
    <div className="chat-card flex flex-col" style={{height:'72vh'}}>
      <div className="px-4 py-3 border-b">
        <div className="text-lg font-semibold">Chat</div>
        <div className="text-xs text-gray-500">Live streaming responses</div>
      </div>

      <div ref={scrollRef} className="flex-1 p-4 overflow-auto">
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`message ${m.role === 'user' ? 'user' : 'ai'} p-3 rounded-md`} style={{maxWidth:'78%'}}>
              <div style={{whiteSpace:'pre-wrap'}}>{m.text || (m.streaming ? '...' : '')}</div>
              {m.label && <div className="text-xs text-gray-400 mt-1">{m.label}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 p-3 border rounded-md"
          placeholder="Send a message..."
          onKeyDown={e => { if (e.key === 'Enter') sendChat() }}
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md" onClick={sendChat} disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
