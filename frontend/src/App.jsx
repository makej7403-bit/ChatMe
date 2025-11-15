import React, { useEffect, useState } from 'react'
import AuthButton from './components/AuthButton'
import FeatureList from './components/FeatureList'
import ChatPanel from './components/ChatPanel'
import { auth } from './firebase'

export default function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u))
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
          <FeatureList user={user} />
        </aside>
        <section className="col-span-3 bg-white p-4 rounded shadow">
          <ChatPanel user={user} />
        </section>
      </main>
    </div>
  )
}
