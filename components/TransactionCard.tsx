"use client";

import { useState, useCallback } from "react";
import { Transaction } from "@/lib/types";
import {
  truncateAddress,
  formatUSD,
  formatAmount,
  timeAgo,
} from "@/lib/format";

interface TransactionCardProps {
  tx: Transaction;
  isNew?: boolean;
}

function IconArrowUp() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 12V2M2 7l5-5 5 5" />
    </svg>
  );
}
function IconArrowDown() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 2v10M2 7l5 5 5-5" />
    </svg>
  );
}
function IconArrowRight() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 7h10M7 2l5 5-5 5" />
    </svg>
  );
}
function IconSparkle() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1c-.3 1.2-.8 2.8-2 4-1.2 1.2-2.8 1.7-4 2 1.2.3 2.8.8 4 2 1.2 1.2 1.7 2.8 2 4 .3-1.2.8-2.8 2-4 1.2-1.2 2.8-1.7 4-2-1.2-.3-2.8-.8-4-2-1.2-1.2-1.7-2.8-2-4z" />
    </svg>
  );
}
function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0)",
        transition: "transform 0.2s ease",
      }}
    >
      <path d="M2 4.5L6 8l4-3.5" />
    </svg>
  );
}
function IconExternal() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7M8 1h3v3M5.5 6.5L11 1" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 1L1 12h12L7 1zM7 5v3M7 10.5v.1" />
    </svg>
  );
}

const typeConfig = {
  buy: {
    label: "BUY",
    color: "var(--green)",
    bg: "var(--green-bg)",
    border: "var(--green)",
    Icon: IconArrowUp,
  },
  sell: {
    label: "SELL",
    color: "var(--red)",
    bg: "var(--red-bg)",
    border: "var(--red)",
    Icon: IconArrowDown,
  },
  transfer: {
    label: "TRANSFER",
    color: "var(--text-2)",
    bg: "var(--surface-3)",
    border: "var(--border-strong)",
    Icon: IconArrowRight,
  },
  unknown: {
    label: "TX",
    color: "var(--text-2)",
    bg: "var(--surface-3)",
    border: "var(--border-strong)",
    Icon: IconArrowRight,
  },
};

function getExtraTag(label: string | null | undefined) {
  if (!label) return null;
  const l = label.toLowerCase();
  if (l.includes("raydium") || l.includes("orca") || l.includes("jupiter"))
    return { text: "DEX", color: "var(--amber)" };
  if (l.includes("binance") || l.includes("coinbase") || l.includes("kraken"))
    return { text: "CEX", color: "var(--blue)" };
  if (l.includes("MEV") || l.includes("jared"))
    return { text: "MEV Bot", color: "var(--red)" };
  // Default to a deterministic web3 tag
  const tags = [
    { text: "KOL", color: "var(--purple, #9333ea)" },
    { text: "Early Buyer", color: "var(--green)" },
    { text: "Sniper", color: "var(--red)" },
    { text: "Smart Money", color: "var(--amber)" },
  ];
  const idx = label.length % tags.length;
  return tags[idx];
}

export default function TransactionCard({ tx, isNew }: TransactionCardProps) {
  const [open, setOpen] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(
    tx.explanation ?? null,
  );
  const [loading, setLoading] = useState(false);

  const cfg = typeConfig[tx.type] ?? typeConfig.unknown;
  const TypeIcon = cfg.Icon;

  const handleExplain = useCallback(async () => {
    const next = !open;
    setOpen(next);
    if (!next || explanation) return;
    setLoading(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletLabel: tx.walletLabel,
          walletAddress: tx.walletAddress,
          type: tx.type,
          tokenSymbol: tx.tokenSymbol,
          tokenName: tx.tokenName,
          amount: tx.amount,
          usdValue: tx.usdValue,
          timestamp: tx.timestamp,
          isAlert: tx.isAlert,
          fromAddress: tx.fromAddress,
          toAddress: tx.toAddress,
        }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { explanation: string };
      setExplanation(data.explanation);
    } catch {
      setExplanation("Analysis unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [open, explanation, tx]);

  return (
    <div
      className={isNew ? "slide-in" : ""}
      style={{
        backgroundColor: "var(--surface)",
        border: `1px solid ${tx.isAlert ? "var(--amber)" : "var(--border)"}`,
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "16px" }}>
        {/* Row 1: Header - Label, Alert, Time */}
        <div
          className="tx-card-row1"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: "var(--text-1)",
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {tx.walletLabel}
          </span>

          {tx.isAlert && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 700,
                backgroundColor: "var(--amber-bg)",
                color: "var(--amber)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <IconAlert /> System Alert
            </span>
          )}

          <span
            className="mono"
            style={{ fontSize: 11, color: "var(--text-3)", flexShrink: 0 }}
          >
            {timeAgo(tx.timestamp)}
          </span>
        </div>

        {/* Row 2: Crucial Data Array */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "80px 1fr",
            rowGap: 8,
            marginBottom: 16,
          }}
        >
          <span
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--text-3)",
              letterSpacing: "0.05em",
              alignSelf: "center",
            }}
          >
            ACTION
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.05em",
              backgroundColor: "transparent",
              color: cfg.color,
              border: `1px solid ${cfg.border}`,
              justifySelf: "flex-start",
            }}
          >
            <TypeIcon />
            {cfg.label}
          </span>

          <span
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--text-3)",
              letterSpacing: "0.05em",
              alignSelf: "baseline",
              paddingTop: 2,
            }}
          >
            VOLUME
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span
              className="mono"
              style={{
                fontSize: tx.usdValue > 500000 ? 20 : 18,
                fontWeight: tx.usdValue > 250000 ? 800 : 700,
                color:
                  tx.usdValue >= 500000
                    ? "var(--amber)"
                    : tx.usdValue >= 50000
                      ? "var(--text-1)"
                      : "var(--text-2)",
                letterSpacing: "-0.04em",
                lineHeight: 1,
                transition: "color 0.2s ease",
              }}
            >
              {formatAmount(tx.amount)}
              <span
                style={{
                  color: cfg.color,
                  marginLeft: 6,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {tx.tokenSymbol}
              </span>
            </span>
            <span
              className="mono"
              style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)" }}
            >
              {formatUSD(tx.usdValue)}
            </span>
          </div>
        </div>

        {/* Row 3: Utility Footbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            borderTop: "1px dashed var(--border)",
            paddingTop: 12,
          }}
        >
          <span
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--text-2)",
              backgroundColor: "var(--surface-3)",
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid var(--border)",
              flexShrink: 0,
            }}
          >
            Addr: {truncateAddress(tx.walletAddress, 5)}
          </span>

          <a
            href={`https://solscan.io/tx/${tx.signature}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-2)",
              textDecoration: "none",
              padding: "4px 8px",
              borderRadius: 4,
              backgroundColor: "transparent",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--accent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-2)")
            }
          >
            <IconExternal /> Solscan
          </a>


          <div style={{ flex: 1 }} />

          <button
            onClick={handleExplain}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 6,
              border: `1px solid ${open ? "var(--accent)" : "var(--border-strong)"}`,
              backgroundColor: open ? "var(--accent)" : "var(--surface)",
              color: open ? "var(--surface)" : "var(--text-1)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
              flexShrink: 0,
            }}
          >
            <IconSparkle />
            {loading ? "Analyzing…" : "Scan"}
            <IconChevron open={open} />
          </button>
        </div>
      </div>

      {/* AI Explanation panel */}
      <div className={`explain-body ${open ? "open" : ""}`}>
        <div>
          <div
            style={{
              margin: "0 16px 16px",
              padding: "16px",
              borderRadius: 6,
              backgroundColor: "var(--surface-2)",
              border: "1px solid var(--border-strong)",
              borderLeft: "3px solid var(--accent)",
            }}
          >
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  className="skeleton"
                  style={{ height: 14, width: "88%" }}
                />
                <div
                  className="skeleton"
                  style={{ height: 14, width: "72%" }}
                />
                <div
                  className="skeleton"
                  style={{ height: 14, width: "56%" }}
                />
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 10,
                  }}
                >
                  <span style={{ color: "var(--accent)", display: "flex" }}>
                    <IconSparkle />
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--text-2)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Signal Analysis
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-1)",
                    lineHeight: 1.6,
                    margin: 0,
                    whiteSpace: "pre-line",
                  }}
                >
                  {explanation}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
