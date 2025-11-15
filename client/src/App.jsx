import React, { useEffect, useState } from 'react'
import AuthButton from './components/AuthButton'
import FeatureList from './components/FeatureList'
import ChatPanel from './components/ChatPanel'
import PremiumModal from './components/PremiumModal'
import { auth } from './firebase'

export default function App() {
  const [user, setUser] = useState(null)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [userMeta, setUserMeta] = useState(null)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setUser(u)
      if (u) {
        // register with backend
        try {
          await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: u.uid,
              email: u.email,
              displayName: u.displayName,
              photoURL: u.photoURL
            })
          })
          const r = await fetch(`/api/users/${u.uid}`)
          const json = await r.json()
          setUserMeta(json)
        } catch (err) {
          console.error(err)
        }
      } else {
        setUserMeta(null)
      }
    })
    return () => unsub()
  }, [])

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ChatMe — AI Suite</h1>
        <AuthButton user={user} />
      </header>

      <main className="grid grid-cols-4 gap-6">
        <aside className="col-span-1 bg-white p-4 rounded shadow">
          <FeatureList user={user} userMeta={userMeta} onShowPremium={() => setShowPremiumModal(true)} />
        </aside>
        <section className="col-span-3 bg-white p-4 rounded shadow">
          <ChatPanel user={user} userMeta={userMeta} />
        </section>
      </main>

      {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} />}
    </div>
  )
}
