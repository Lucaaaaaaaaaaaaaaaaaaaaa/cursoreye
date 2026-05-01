"use client";

import { useEffect, useState } from "react";

export default function LiveCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        setCount(data.activeScreens);
      } catch {
        setCount(null);
      }
    }
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const display = count !== null ? count.toLocaleString() : "—";

  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-secondary)] mb-8">
      <span className="w-2 h-2 rounded-full bg-[var(--success)] pulse-dot" />
      AI is watching {display} screens right now
    </div>
  );
}
