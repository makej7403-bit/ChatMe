import React from 'react'
import features from '../features/aiFeatureTemplates'

export default function FeatureList({ user }) {
  return (
    <div>
      <h2 className="font-semibold mb-3">AI Features</h2>
      <ul className="space-y-2 max-h-[65vh] overflow-auto">
        {features.map(f => (
          <li key={f.id}>
            <button
              className="w-full text-left p-2 rounded hover:bg-gray-100"
              onClick={() => window.dispatchEvent(new CustomEvent('chatme:runFeature', { detail: f }))}
            >
              {f.id} — {f.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
