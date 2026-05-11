"use client";

import { useEffect, useRef, useState } from "react";

export default function LiveTxCounter({ counterOnly }: { counterOnly?: boolean }) {
  const [count, setCount] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const prevCount = useRef<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/tx-count");
        if (!res.ok) return;
        const { count: c } = await res.json();
        if (prevCount.current !== null && c !== prevCount.current) {
          setFlash(true);
          setTimeout(() => setFlash(false), 600);
        }
        prevCount.current = c;
        setCount(c);
      } catch {
        // silent — header should never crash
      }
    };

    fetchCount();
    const id = setInterval(fetchCount, 15000);
    return () => clearInterval(id);
  }, []);

  if (counterOnly) {
    return (
      <span
        className="mono"
        style={{
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "0.04em",
          color: flash ? "var(--green)" : "var(--text-1)",
          transition: "color 0.3s",
          lineHeight: 1,
        }}
      >
        {count === null ? "—" : count.toLocaleString()}
      </span>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 16px",
        backgroundColor: "rgba(0,255,128,0.03)",
        borderRadius: 99,
        border: "1px solid rgba(0,255,128,0.12)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <span
          className="mono"
          style={{
            fontSize: 9,
            color: "var(--text-3)",
            fontWeight: 700,
            letterSpacing: "0.1em",
            lineHeight: 1,
            marginBottom: 2,
          }}
        >
          TRACKED TXS
        </span>
        <span
          className="mono"
          style={{
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "0.04em",
            color: flash ? "var(--green)" : "var(--text-1)",
            transition: "color 0.3s",
            lineHeight: 1,
          }}
        >
          {count === null ? "—" : count.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
