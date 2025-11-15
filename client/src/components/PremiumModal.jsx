import React from 'react'

export default function PremiumModal({ onClose = () => {} }) {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.5)' }}>
      <div className="chat-card" style={{ width: 520 }}>
        <h3 className="text-lg font-semibold">Premium feature locked</h3>
        <p className="text-sm text-gray-600">This feature requires premium access. Use the free trial or ask the admin to enable premium for your account for testing.</p>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-md border">Close</button>
        </div>
      </div>
    </div>
  )
}
