import React, { useEffect, useState } from 'react'

export default function FeatureList({ user, userMeta, onShowPremium }) {
  const [features, setFeatures] = useState([])

  useEffect(() => {
    fetch('/api/features').then(r => r.json()).then(setFeatures).catch(() => {})
  }, [])

  function handleClick(f) {
    // If user not signed and feature premium — prompt sign in
    const PREMIUM_FEATURES = new Set(['image-gen','image-edit','text-to-speech','speech-to-text','summarize-audio','meeting-notes','codegen','unit-tests','sql-gen','data-clean','excel-formula','music-lyrics','chord-prog'])
    const isPremium = PREMIUM_FEATURES.has(f.id)
    if (isPremium && (!userMeta || (!userMeta.user?.isPremium && !(userMeta.trial && userMeta.trial.trialRemainingDays > 0)))) {
      // show modal or prompt
      onShowPremium()
      return
    }
    window.dispatchEvent(new CustomEvent('chatme:runFeature', { detail: f }))
  }

  return (
    <div>
      <h2 className="font-semibold mb-3">AI Features</h2>
      <ul className="space-y-2 max-h-[65vh] overflow-auto">
        {features.map(f => (
          <li key={f.id}>
            <button
              className="w-full text-left p-2 rounded hover:bg-gray-100 flex justify-between items-center"
              onClick={() => handleClick(f)}
            >
              <span>{f.title || f.id}</span>
              <small className="text-xs text-gray-500">{f.defaultPrompt ? '' : ''}</small>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
