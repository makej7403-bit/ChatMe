import React from 'react'

export default function Sidebar({ features, onSelect, search, setSearch }) {
  return (
    <div className="sidebar">
      <div className="mb-3">
        <input
          placeholder="Search features..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full p-2 rounded-md border"
        />
      </div>
      <div className="text-sm text-gray-500 mb-3">All features</div>
      <div style={{maxHeight: '62vh', overflow: 'auto', display: 'grid', gap: 8}}>
        {features.map(f => (
          <button key={f.id} onClick={() => onSelect(f)} className="feature-item text-left p-3 rounded-md">
            <div className="font-medium">{f.title || f.id}</div>
            <div className="text-xs text-gray-500 truncate">{f.defaultPrompt || ''}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
