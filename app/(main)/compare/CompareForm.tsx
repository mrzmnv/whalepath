"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  initialA: string;
  initialB: string;
}

export default function CompareForm({ initialA, initialB }: Props) {
  const [addrA, setAddrA] = useState(initialA);
  const [addrB, setAddrB] = useState(initialB);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (addrA.trim()) params.set("a", addrA.trim());
    if (addrB.trim()) params.set("b", addrB.trim());
    router.push(`/compare?${params.toString()}`);
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: "10px 14px",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    color: "var(--text-1)",
    fontSize: 13,
    fontFamily: "var(--font-mono, monospace)",
    outline: "none",
    minWidth: 0,
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <input
          type="text"
          value={addrA}
          onChange={(e) => setAddrA(e.target.value)}
          placeholder="Wallet A address…"
          style={inputStyle}
          spellCheck={false}
          autoComplete="off"
        />
        <input
          type="text"
          value={addrB}
          onChange={(e) => setAddrB(e.target.value)}
          placeholder="Wallet B address…"
          style={inputStyle}
          spellCheck={false}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!addrA.trim() || !addrB.trim()}
          style={{
            padding: "10px 24px",
            borderRadius: 6,
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: addrA.trim() && addrB.trim() ? "pointer" : "not-allowed",
            opacity: addrA.trim() && addrB.trim() ? 1 : 0.5,
            fontFamily: "var(--font-mono, monospace)",
            letterSpacing: "0.04em",
            flexShrink: 0,
          }}
        >
          COMPARE
        </button>
      </div>
    </form>
  );
}
