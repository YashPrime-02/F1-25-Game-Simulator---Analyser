import { useEffect, useState } from "react";

export default function useRevealSequence(steps = [], delay = 800) {
  const [visibleSteps, setVisibleSteps] = useState([]);

  useEffect(() => {
    let i = 0;

    const interval = setInterval(() => {
      setVisibleSteps(prev => [...prev, steps[i]]);
      i++;

      if (i >= steps.length) clearInterval(interval);
    }, delay);

    return () => clearInterval(interval);
  }, []);

  return visibleSteps;
}