import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import features from './features/aiFeatureTemplates';

export default function App(){
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState(features);

  useEffect(()=> setFiltered(features.filter(f => f.title.toLowerCase().includes(search.toLowerCase()) || f.id.toLowerCase().includes(search.toLowerCase()))), [search]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Header onOpenMenu={() => {}} user={user} />
      <div className="mt-6 grid grid-cols-[300px_1fr] gap-6">
        <Sidebar features={filtered} onSelect={(f) => window.dispatchEvent(new CustomEvent('chatme:runFeature',{detail:f}))} search={search} setSearch={setSearch} />
        <ChatPanel user={user} />
      </div>
    </div>
  );
}
