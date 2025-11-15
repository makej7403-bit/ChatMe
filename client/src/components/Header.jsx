import React from 'react'
import AuthButton from './AuthButton'

export default function Header({ onOpenMenu, user }) {
  return (
    <div className="header-card flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold">CM</div>
        <div>
          <div className="text-lg font-semibold">ChatMe Pro</div>
          <div className="text-sm text-gray-500">v15.0.0 · Powered by OpenAI</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="version-badge">PRO</div>
        <button className="px-3 py-1 rounded-md border" onClick={onOpenMenu}>Main Menu</button>
        <AuthButton user={user} />
      </div>
    </div>
  )
}
