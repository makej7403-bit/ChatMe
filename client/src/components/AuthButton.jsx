import React from 'react';
import { signInWithPopup, getAuth, GoogleAuthProvider, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyC7cAN-mrE2PvmlQ11zLKAdHBhN7nUFjHw",
  authDomain: "fir-u-c-students-web.firebaseapp.com",
  databaseURL: "https://fir-u-c-students-web-default-rtdb.firebaseio.com",
  projectId: "fir-u-c-students-web",
  storageBucket: "fir-u-c-students-web.firebasestorage.app",
  messagingSenderId: "113569186739",
  appId: "1:113569186739:web:d8daf21059f43a79e841c6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function AuthButton({ user }) {
  const signIn = async () => {
    await signInWithPopup(auth, provider);
  };
  const signOutUser = async () => {
    await signOut(auth);
  };

  return user ? (
    <div className="flex items-center gap-3">
      <img src={user.photoURL} alt="a" className="w-8 h-8 rounded-full" />
      <span>{user.displayName}</span>
      <button onClick={signOutUser} className="px-3 py-1 bg-red-500 text-white rounded">Sign out</button>
    </div>
  ) : (
    <button onClick={signIn} className="px-3 py-1 bg-blue-600 text-white rounded">Sign in</button>
  );
}
