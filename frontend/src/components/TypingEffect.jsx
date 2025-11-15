import { useEffect, useState } from "react";

export default function TypingEffect({ text }) {
  const [out, setOut] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setOut(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{out}</span>;
}
