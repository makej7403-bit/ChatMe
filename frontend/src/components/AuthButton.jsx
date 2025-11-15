import { useEffect, useState } from "react";
import { loginGoogle, logoutGoogle, authListener } from "../firebase";

export default function AuthButton({ onAuthChange }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    return authListener((u) => {
      setUser(u);
      onAuthChange(u);
    });
  }, []);

  return (
    <div>
      {user ? (
        <button
          onClick={logoutGoogle}
          className="bg-red-500 px-4 py-2 text-white rounded-lg"
        >
          Logout ({user.displayName})
        </button>
      ) : (
        <button
          onClick={loginGoogle}
          className="bg-blue-600 px-4 py-2 text-white rounded-lg"
        >
          Login with Google
        </button>
      )}
    </div>
  );
}
