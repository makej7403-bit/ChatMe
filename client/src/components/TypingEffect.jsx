import React, { useState, useEffect } from "react";

export default function TypingEffect({ message }) {
  const [text, setText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(message.text.slice(0, i));
      i++;
      if (i > message.text.length) clearInterval(interval);
    }, 15); // ultra-speed typing

    return () => clearInterval(interval);
  }, [message.text]);

  return (
    <p className={message.from === "you" ? "msg-you" : "msg-ai"}>
      {text}
    </p>
  );
}
