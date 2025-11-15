import React from 'react';

export default function Sidebar({ features, onSelect, search, setSearch }){
  return (
    <div className="p-4 bg-white rounded-lg shadow sidebar">
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search features..." className="w-full p-2 border rounded mb-3" />
      <div style={{maxHeight: '68vh', overflow: 'auto', display: 'grid', gap: 8}}>
        {features.map(f => (
          <button key={f.id} onClick={() => onSelect(f)} className="text-left p-3 rounded hover:bg-slate-50">
            <div className="font-medium">{f.title}</div>
            <div className="text-xs text-gray-500 truncate">{f.defaultPrompt}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
