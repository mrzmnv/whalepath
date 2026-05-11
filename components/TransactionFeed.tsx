"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Transaction, WhaleWallet, WatchlistEntry } from "@/lib/types";
import { getSeenTxs, markTxsSeen } from "@/lib/storage";
import TransactionCard from "./TransactionCard";

interface TransactionFeedProps {
  preloadedWhales: WhaleWallet[];
  watchlist: WatchlistEntry[];
  onStatsUpdate?: (
    txCount: number,
    largestMove: number,
    largestToken: string,
    largestAddress: string,
    largestLabel: string,
  ) => void;
}

const POLL_INTERVAL = 15 * 60_000; // 15 minutes — preserve Helius quota
const WALLETS_PER_POLL = 5; // rotate 5 wallets per poll

const RANGE_OPTIONS = [
  { label: "$50 – $5K", min: 50, max: 5_000 },
  { label: "$5K – $50K", min: 5_000, max: 50_000 },
  { label: "$50K – $500K", min: 50_000, max: 500_000 },
  { label: "$500K+", min: 500_000, max: Infinity },
  { label: "All", min: 0, max: Infinity },
] as const;

type RangeOption = (typeof RANGE_OPTIONS)[number];

export default function TransactionFeed({
  preloadedWhales,
  watchlist,
  onStatsUpdate,
}: TransactionFeedProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [newSigs, setNewSigs] = useState<Set<string>>(new Set());
  const [range, setRange] = useState<RangeOption>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wp_range_filter");
      if (saved) {
        const found = RANGE_OPTIONS.find((r) => r.label === saved);
        if (found) return found;
      }
    }
    return RANGE_OPTIONS[4]; // All
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);

  const filtered = transactions.filter(
    (tx) => tx.usdValue >= range.min && tx.usdValue < range.max,
  );

  const pollOffsetRef = useRef(0);

  const fetchTransactions = useCallback(async () => {
    const allWallets = [
      ...preloadedWhales.map((w) => ({
        address: w.address,
        label: w.label,
        source: "preloaded" as const,
      })),
      ...watchlist.map((w) => ({
        address: w.address,
        label: w.label || w.address.slice(0, 8),
        source: "watchlist" as const,
      })),
    ];
    if (allWallets.length === 0) {
      setLoading(false);
      return;
    }

    // Rotate through wallets to stay within API quota
    const offset = pollOffsetRef.current % allWallets.length;
    const wallets = allWallets.slice(offset, offset + WALLETS_PER_POLL);
    pollOffsetRef.current = (offset + WALLETS_PER_POLL) % allWallets.length;

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallets }),
      });
      if (!res.ok || !isMounted.current) {
        return;
      }

      const payload: { transactions: Transaction[]; demo: boolean } =
        await res.json();
      const data = payload.transactions ?? [];

      const seen = getSeenTxs();
      const fresh = data.filter((tx) => !seen.has(tx.signature));

      if (fresh.length > 0) markTxsSeen(fresh.map((t) => t.signature));
      setTransactions((prev) => {
        if (prev.length === 0) return data;
        const merged = [...fresh, ...prev];
        return Array.from(
          new Map(merged.map((t) => [t.signature, t])).values(),
        ).slice(0, 100);
      });

      if (transactions.length === 0 && data.length > 0) {
        setTransactions(data);
        if (onStatsUpdate) {
          const biggest = data.reduce(
            (m, t) => (t.usdValue > m.usdValue ? t : m),
            data[0],
          );
          onStatsUpdate(
            data.length,
            biggest.usdValue,
            biggest.tokenSymbol,
            biggest.walletAddress,
            biggest.walletLabel,
          );
        }
      } else if (fresh.length > 0) {
        const sigs = new Set(fresh.map((t) => t.signature));
        setNewSigs(sigs);
        setTimeout(() => {
          if (isMounted.current) setNewSigs(new Set());
        }, 1500);

        if (onStatsUpdate) {
          const biggest = fresh.reduce(
            (m, t) => (t.usdValue > m.usdValue ? t : m),
            fresh[0],
          );
          onStatsUpdate(
            fresh.length,
            biggest.usdValue,
            biggest.tokenSymbol,
            biggest.walletAddress,
            biggest.walletLabel,
          );
        }
      }
    } catch (err) {
      console.error("fetchTransactions error:", err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setLastUpdated(new Date());
      }
    }
  }, [preloadedWhales, watchlist, onStatsUpdate]);

  useEffect(() => {
    isMounted.current = true;
    fetchTransactions();
    intervalRef.current = setInterval(fetchTransactions, POLL_INTERVAL);
    return () => {
      isMounted.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchTransactions]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexShrink: 0,
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className="mono"
            style={{
              fontWeight: 700,
              fontSize: 13,
              color: "var(--text-1)",
              letterSpacing: "0.05em",
            }}
          >
            LIVE FEED
          </span>
          {filtered.length > 0 && (
            <span
              className="mono"
              style={{
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
                backgroundColor: "var(--surface-3)",
                color: "var(--text-2)",
                border: "1px solid var(--border)",
              }}
            >
              {filtered.length}
            </span>
          )}
        </div>

        {/* Range filter */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                setRange(opt);
                localStorage.setItem("wp_range_filter", opt.label);
              }}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                border: "1px solid",
                borderColor:
                  range.label === opt.label ? "var(--accent)" : "var(--border)",
                backgroundColor:
                  range.label === opt.label
                    ? "rgba(99,102,241,0.15)"
                    : "var(--surface-2)",
                color:
                  range.label === opt.label ? "var(--accent)" : "var(--text-3)",
                transition: "all 0.15s ease",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {lastUpdated && (
          <span
            className="mono"
            style={{
              fontSize: 10,
              color: "var(--text-3)",
              letterSpacing: "0.05em",
            }}
          >
            SYNC{" "}
            {lastUpdated.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        )}
      </div>

      {/* Body */}
      <div
        className="hide-scrollbar"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          paddingRight: 4,
        }}
      >
        {loading && transactions.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div className="skeleton" style={{ height: 14, width: "30%" }} />
              <div className="skeleton" style={{ height: 20, width: "70%" }} />
              <div className="skeleton" style={{ height: 12, width: "40%" }} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              paddingTop: 60,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                border: "2px solid var(--border-strong)",
                borderRadius: 4,
                marginBottom: 8,
              }}
            />
            <p
              className="mono"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-2)",
                letterSpacing: "0.05em",
              }}
            >
              {transactions.length > 0 ? "NO MATCHES" : "SCANNING MEMPOOL"}
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-3)",
                textAlign: "center",
                maxWidth: 260,
              }}
            >
              {transactions.length > 0
                ? `No transfers in the ${range.label} range.`
                : "No high-net transfers detected."}
            </p>
          </div>
        ) : (
          filtered.map((tx) => (
            <TransactionCard
              key={tx.signature}
              tx={tx}
              isNew={newSigs.has(tx.signature)}
            />
          ))
        )}
      </div>
    </div>
  );
}
