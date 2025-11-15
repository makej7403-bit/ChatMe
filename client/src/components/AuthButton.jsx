import React from 'react'
import { signInWithGoogle, signOutUser } from '../firebase'

export default function AuthButton({ user }) {
  return user ? (
    <div className="flex items-center gap-3">
      {user.photoURL && <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />}
      <span>{user.displayName}</span>
      <button
        className="ml-2 px-3 py-1 bg-red-500 text-white rounded"
        onClick={() => signOutUser()}
      >
        Sign out
      </button>
    </div>
  ) : (
    <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => signInWithGoogle()}>
      Sign in with Google
    </button>
  )
}
