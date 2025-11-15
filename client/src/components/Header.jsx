import React from 'react';
import AuthButton from './AuthButton';

export default function Header({ onOpenMenu, user }){
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold">CM</div>
        <div>
          <div className="text-lg font-semibold">ChatMe Pro</div>
          <div className="text-sm text-gray-500">v15.0.0</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-100 to-white">PRO</div>
        <AuthButton user={user} />
      </div>
    </div>
  );
}
