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
  ) => void;
}

const POLL_INTERVAL = 60_000;

export default function TransactionFeed({
  preloadedWhales,
  watchlist,
  onStatsUpdate,
}: TransactionFeedProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [newSigs, setNewSigs] = useState<Set<string>>(new Set());
  const [isDemo, setIsDemo] = useState(false);

const fallbackMockData = [
    {
      signature: "mock_fail_1",
      timestamp: Date.now() - 2 * 60 * 1000,
      walletAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
      walletLabel: "Jump Trading Fallback",
      type: "buy",
      tokenSymbol: "SOL",
      tokenName: "Solana",
      amount: 15000,
      usdValue: 2250000,
      isAlert: true,
      source: "preloaded"
    },
    {
      signature: "mock_fail_2",
      timestamp: Date.now() - 8 * 60 * 1000,
      walletAddress: "GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ",
      walletLabel: "Wintermute Fallback",
      type: "sell",
      tokenSymbol: "JUP",
      tokenName: "Jupiter",
      amount: 4500000,
      usdValue: 810000,
      isAlert: true,
      source: "preloaded"
    }
  ];

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);

  const fetchTransactions = useCallback(async () => {
    const wallets = [
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
    if (wallets.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallets }),
      });
      if (!res.ok || !isMounted.current) {
        if (!res.ok && transactions.length === 0) {
            setIsDemo(true);
            setTransactions(fallbackMockData as Transaction[]);
        }
        return;
      }

      const payload: { transactions: Transaction[]; demo: boolean } =
        await res.json();
      const data = payload.transactions ?? [];
      const isDemoResponse = payload.demo ?? false;
      console.log('transactions API returned:', payload.transactions?.length, 'demo:', isDemoResponse);
      if (isMounted.current) setIsDemo(isDemoResponse);

      const seen = getSeenTxs();
      const fresh = isDemoResponse
        ? data
        : data.filter((tx) => !seen.has(tx.signature));

      if (isDemoResponse) {
        setTransactions(data);
      } else {
        if (fresh.length > 0) markTxsSeen(fresh.map((t) => t.signature));
        setTransactions((prev) => {
          if (prev.length === 0) return data;
          const merged = [...fresh, ...prev];
          return Array.from(
            new Map(merged.map((t) => [t.signature, t])).values(),
          ).slice(0, 100);
        });
      }

      // Always trigger stats setup if it's fresh or first load
      // But only blink the new specific ones in fresh
      // Bypass the entire state logic if it's the very first render and we have data
      if (transactions.length === 0 && data.length > 0) {
        setTransactions(data);
        if (onStatsUpdate) {
            const biggest = data.reduce(
              (m, t) => (t.usdValue > m.usdValue ? t : m),
              data[0],
            );
            // On first load, we don't just pass the length, because the initial length could be
            // huge, but passing length is fine for a 24h count mock.
            onStatsUpdate(data.length, biggest.usdValue, biggest.tokenSymbol);
        }
      } else if (fresh.length > 0) {
        // Normal polling when already loaded
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
          onStatsUpdate(fresh.length, biggest.usdValue, biggest.tokenSymbol);
        }
      }
    } catch (err) {
      console.error('fetchTransactions error:', err);
      // Fallback to mock data if fetch fails entirely
      if (transactions.length === 0) {
        setIsDemo(true);
        setTransactions(fallbackMockData as Transaction[]);
        if (onStatsUpdate) {
            onStatsUpdate(fallbackMockData.length, fallbackMockData[0].usdValue, fallbackMockData[0].tokenSymbol);
        }
      }
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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className="mono"
            style={{ fontWeight: 700, fontSize: 13, color: "var(--text-1)", letterSpacing: "0.05em" }}
          >
            LIVE FEED
          </span>
          {transactions.length > 0 && (
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
              {transactions.length}
            </span>
          )}
          {isDemo && (
            <span
              className="mono"
              style={{
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
                backgroundColor: "var(--amber-bg)",
                color: "var(--amber)",
                border: "1px solid var(--amber)",
              }}
            >
              DEMO
            </span>
          )}
        </div>
        {lastUpdated && (
          <span className="mono" style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.05em" }}>
            SYNC {" "}
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
              <div
                className="skeleton"
                style={{ height: 14, width: "30%" }}
              />
              <div
                className="skeleton"
                style={{ height: 20, width: "70%" }}
              />
              <div
                className="skeleton"
                style={{ height: 12, width: "40%" }}
              />
            </div>
          ))
        ) : transactions.length === 0 ? (
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
            <div style={{ width: 16, height: 16, border: "2px solid var(--border-strong)", borderRadius: 4, marginBottom: 8 }} />
            <p
              className="mono"
              style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", letterSpacing: "0.05em" }}
            >
              SCANNING MEMPOOL
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-3)",
                textAlign: "center",
                maxWidth: 260,
              }}
            >
              No high-net transfers detected.
            </p>
          </div>
        ) : (
          transactions.map((tx) => (
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
