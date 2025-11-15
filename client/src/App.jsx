import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'
import MainMenu from './components/MainMenu'
import PremiumModal from './components/PremiumModal'
import { auth } from './firebase'

export default function App() {
  const [features, setFeatures] = useState([])
  const [selected, setSelected] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/features').then(r => r.json()).then(setFeatures).catch(() => {
      // fallback: import local features if API fails
      import('./features/aiFeatureTemplates').then(m => setFeatures(m.default || m))
    })

    const unsub = auth.onAuthStateChanged(u => {
      setUser(u)
      if (u) {
        fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL })
        }).catch(() => {})
      }
    })
    return () => unsub()
  }, [])

  const filtered = features.filter(f => f.title?.toLowerCase().includes(search.toLowerCase()) || f.id?.toLowerCase().includes(search.toLowerCase()))

  function handleSelect(f) {
    setSelected(f)
    // dispatch global event to ChatPanel (it listens)
    window.dispatchEvent(new CustomEvent('chatme:runFeature', { detail: f }))
  }

  return (
    <div className="app-shell px-4">
      <Header onOpenMenu={() => setMenuOpen(true)} user={user} />
      <div className="mt-4 grid grid-cols-[300px_1fr] gap-6">
        <div>
          <Sidebar features={filtered} onSelect={handleSelect} search={search} setSearch={setSearch} />
        </div>

        <div>
          <ChatPanel user={user} />
        </div>
      </div>

      <MainMenu open={menuOpen} onClose={() => setMenuOpen(false)} features={features} onSelect={(f) => { handleSelect(f); setMenuOpen(false) }} />
      <PremiumModal />
    </div>
  )
}
