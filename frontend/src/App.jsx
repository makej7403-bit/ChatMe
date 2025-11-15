import { useEffect, useState } from "react";
import AuthButton from "./components/AuthButton";
import ChatPanel from "./components/ChatPanel";
import { SERVER_URL } from "./config";
import { auth } from "./firebase";

export default function App() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onIdTokenChanged(async (u) => {
      setUser(u);
      if (u) {
        const t = await u.getIdToken();
        setToken(t);
      } else {
        setToken("");
      }
    });
  }, []);

  return (
    <div className="p-4">
      <AuthButton
        onAuthChange={async () => {
          if (auth.currentUser) {
            setToken(await auth.currentUser.getIdToken());
          }
        }}
      />

      {user ? (
        <ChatPanel token={token} />
      ) : (
        <p className="mt-4 text-gray-600">
          Login to start chatting with AI.
        </p>
      )}
    </div>
  );
}
