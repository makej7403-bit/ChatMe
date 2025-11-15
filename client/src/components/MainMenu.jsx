import React from 'react'

export default function MainMenu({ open, onClose, features, onSelect }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', left: 24, top: 90, width: 320, zIndex: 80 }}>
      <div className="sidebar">
        <div className="flex justify-between items-center mb-2">
          <strong>Main Menu</strong>
          <button onClick={onClose} className="text-sm text-gray-500">Close</button>
        </div>
        <div style={{ maxHeight: 420, overflow: 'auto' }}>
          {features.map(f => (
            <div key={f.id} className="feature-item p-3 rounded-md" onClick={() => onSelect(f)} style={{cursor:'pointer'}}>
              <div className="font-medium">{f.title || f.id}</div>
              <div className="text-xs text-gray-500">{f.defaultPrompt || ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
