import React from 'react'

export default function PremiumModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow max-w-lg w-full">
        <h3 className="text-xl font-semibold mb-3">Premium feature</h3>
        <p className="mb-4">This feature is locked behind premium. You can:</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Use the free trial (available for new users).</li>
          <li>Ask admin to mark your account premium (for testing).</li>
          <li>Contact the developer to enable premium for your account.</li>
        </ul>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
