"use client";

import { useState, useRef, useEffect } from "react";
import { isValidSolanaAddress } from "@/lib/format";
import { WatchlistEntry } from "@/lib/types";

interface AddWalletModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: WatchlistEntry) => Promise<void>;
  existingAddresses: string[];
}

export default function AddWalletModal({ open, onClose, onAdd, existingAddresses }: AddWalletModalProps) {
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setAddress(""); setLabel(""); setError(""); setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) { setError("PLEASE ENTER A WALLET ADDRESS"); return; }
    if (!isValidSolanaAddress(trimmed)) { setError("INVALID SOLANA ADDRESS FORMAT"); return; }
    if (existingAddresses.includes(trimmed)) { setError("WALLET ALREADY IN WATCHLIST"); return; }
    setLoading(true);
    await onAdd({ address: trimmed, label: label.trim() || trimmed.slice(0, 8), addedAt: Date.now() });
    setLoading(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backgroundColor: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="fade-up"
        style={{
          width: "100%",
          maxWidth: 440,
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 24,
          boxShadow: "var(--shadow)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 className="mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 4, letterSpacing: "0.05em" }}>
              ADD WALLET
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>
              Track any Solana wallet in the mempool
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 4,
              border: "1px solid var(--border)",
              backgroundColor: "transparent",
              color: "var(--text-2)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="mono" style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-2)", marginBottom: 8, letterSpacing: "0.05em" }}>
              WALLET ADDRESS
            </label>
            <input
              ref={inputRef}
              type="text"
              value={address}
              onChange={(e) => { setAddress(e.target.value); setError(""); }}
              placeholder="e.g. 9WzDXw..."
              className="mono"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 4,
                border: `1px solid ${error ? "var(--red)" : "var(--border-strong)"}`,
                backgroundColor: "transparent",
                color: "var(--text-1)",
                fontSize: 13,
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = error ? "var(--red)" : "var(--border-focus)")}
              onBlur={(e) => (e.target.style.borderColor = error ? "var(--red)" : "var(--border-strong)")}
              spellCheck={false}
              autoComplete="off"
            />
            {error && (
              <p className="mono" style={{ fontSize: 10, fontWeight: 600, color: "var(--red)", marginTop: 8 }}>{error}</p>
            )}
          </div>

          <div>
            <label className="mono" style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-2)", marginBottom: 8, letterSpacing: "0.05em" }}>
              LABEL <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(OPTIONAL)</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='e.g. "KOL Beta"'
              className="mono"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 4,
                border: "1px solid var(--border-strong)",
                backgroundColor: "transparent",
                color: "var(--text-1)",
                fontSize: 13,
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-strong)")}
              maxLength={50}
            />
          </div>

          <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
            <button
              type="button"
              className="mono"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 4,
                border: "1px solid var(--border)",
                backgroundColor: "transparent",
                color: "var(--text-2)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.05em",
                cursor: "pointer",
              }}
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="mono"
              disabled={loading}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 4,
                border: "1px solid var(--border-focus)",
                backgroundColor: loading ? "var(--border)" : "var(--accent)",
                color: "var(--surface)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.05em",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "ADDING..." : "ADD TO LIST"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
