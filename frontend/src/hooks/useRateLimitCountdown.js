import { useEffect, useState } from "react";

export default function useRateLimitCountdown() {
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    if (secondsRemaining <= 0) return undefined;

    const timer = window.setTimeout(() => {
      setSecondsRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [secondsRemaining]);

  return [secondsRemaining, setSecondsRemaining];
}
