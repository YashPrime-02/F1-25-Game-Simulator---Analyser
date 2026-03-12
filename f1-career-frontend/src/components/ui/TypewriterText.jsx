import { useEffect, useState } from "react";

export default function TypewriterText({ text, speed = 18 }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let index = 0;

    const timer = setInterval(() => {
      setDisplayed(text.slice(0, index));
      index++;

      if (index > text.length) clearInterval(timer);
    }, speed);

    return () => clearInterval(timer);
  }, [text]);

  return <p className="typewriter">{displayed}</p>;
}