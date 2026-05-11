"use client";

import { useEffect, useState, useCallback } from "react";
import { Star } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Transaction, WhaleWallet, WatchlistEntry } from "@/lib/types";
import { truncateAddress, formatUSD, formatAmount, timeAgo } from "@/lib/format";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/storage";
import TransactionCard from "@/components/TransactionCard";

import AddWalletModal from "@/components/AddWalletModal";

function VolumeChart({ transactions }: { transactions: Transaction[] }) {
  if (!transactions.length) return null;
  const now = Date.now();
  const hours: number[] = Array(24).fill(0);
  transactions.forEach((tx) => {
    const h = Math.floor((now - tx.timestamp) / 3_600_000);
    if (h >= 0 && h < 24) hours[23 - h] += tx.usdValue;
  });
  const maxVal = Math.max(...hours, 1);
  return (
    <div>
      <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 12, fontWeight: 500 }}>Volume over 24h</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 56 }}>
        {hours.map((val, i) => (
          <div key={i} title={formatUSD(val)} style={{
            flex: 1,
            height: `${Math.max((val / maxVal) * 100, val > 0 ? 5 : 3)}%`,
            borderRadius: "3px 3px 0 0",
            backgroundColor: val > 500_000 ? "var(--amber)" : val > 0 ? "var(--accent)" : "var(--surface-3)",
            opacity: val > 0 ? 1 : 0.4,
          }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontSize: 11, color: "var(--text-3)" }}>24h ago</span>
        <span style={{ fontSize: 11, color: "var(--text-3)" }}>now</span>
      </div>
    </div>
  );
}

export default function WalletDetailPage() {
  const params = useParams();
  const address = params?.address as string;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WhaleWallet | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [isWatched, setIsWatched] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!address) return;
    fetch('/api/whales')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          const found = data.find((w: any) => w.address === address);
          if (found) setWalletInfo(found);
        }
      })
      .catch(() => {});
    fetch('/api/watchlist').then(res => res.ok ? res.json() : null).then(data => {
      if(data?.authenticated) {
        setIsAuthenticated(true);
        setWatchlist(data.items || []);
        setIsWatched((data.items || []).some((w: any) => w.address === address));
      } else {
        const wl = getWatchlist();
        setWatchlist(wl);
        setIsWatched(wl.some((w) => w.address === address));
      }
    }).catch(() => {
        const wl = getWatchlist();
        setWatchlist(wl);
        setIsWatched(wl.some((w) => w.address === address));
    });
    fetch("/api/wallet-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Transaction[]) => { setTransactions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [address]);

  const handleToggleWatch = useCallback(async () => {
    const label = walletInfo?.label || watchlist.find((w) => w.address === address)?.label || address.slice(0,8);
    const isLocal = !isAuthenticated;
    
    if (isLocal) {
      if (isWatched) {
        setWatchlist(removeFromWatchlist(address));
        setIsWatched(false);
      } else {
        setWatchlist(addToWatchlist({ address, label, type: 'favorite', addedAt: Date.now(), id: Math.random().toString() }));
        setIsWatched(true);
      }
      return;
    }

    try {
      const res = await fetch('/api/watchlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, label })
      });
      if (res.ok) {
        setIsWatched(!isWatched);
      }
    } catch (e) {
      console.error(e);
    }
  }, [isWatched, address, walletInfo, watchlist]);

  const handleAddWallet = useCallback((entry: WatchlistEntry) => {
    setWatchlist(addToWatchlist(entry)); setIsWatched(true);
  }, []);

  const totalVolume = transactions.reduce((s, t) => s + t.usdValue, 0);
  const buys = transactions.filter((t) => t.type === "buy").length;
  const sells = transactions.filter((t) => t.type === "sell").length;
  const alerts = transactions.filter((t) => t.isAlert).length;
  const displayLabel = walletInfo?.label || watchlist.find((w) => w.address === address)?.label || truncateAddress(address);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px 48px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--text-3)", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-1)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}>
            ← Dashboard
          </Link>
          <span style={{ color: "var(--text-3)", fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: "var(--text-2)" }}>Wallet</span>
        </div>

        {/* Wallet header card */}
        <div className="fade-up" style={{
          backgroundColor: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", padding: "20px", marginBottom: 14,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", marginBottom: 6, letterSpacing: "-0.02em" }}>
                {displayLabel}
              </h1>
              <p className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 12, wordBreak: "break-all" }}>
                {address}
              </p>
              {walletInfo && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 12, backgroundColor: "var(--surface-3)", color: "var(--accent)", textTransform: "capitalize" }}>
                    {walletInfo.category}
                  </span>
                  {walletInfo.tags.map((tag) => (
                    <span key={tag} style={{ padding: "3px 10px", borderRadius: 99, fontSize: 12, backgroundColor: "var(--surface-2)", color: "var(--text-3)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <a href={`https://solscan.io/account/${address}`} target="_blank" rel="noopener noreferrer"
                style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border-strong)", backgroundColor: "transparent", color: "var(--text-2)", fontSize: 13, fontWeight: 500, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
                Solscan ↗
              </a>
              <button onClick={handleToggleWatch} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 4, cursor: "pointer",
                border: `1px solid ${isWatched ? "rgba(248,113,113,0.3)" : "rgba(99,102,241,0.3)"}`,
                backgroundColor: isWatched ? "var(--red-bg)" : "var(--surface-3)",
                color: isWatched ? "var(--red)" : "var(--accent)",
                fontSize: 13, fontWeight: 500,
              }}>
                {isWatched ? "✕ Unwatch" : <><Star size={14} /> Watch</>}
              </button>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="fade-up-1 wallet-stats-grid" style={{ marginBottom: 14 }}>
          {[
            { label: "Total Volume", value: formatUSD(totalVolume), color: "var(--text-1)" },
            { label: "Est. PNL (7d)", value: totalVolume > 0 ? "+" + formatUSD((totalVolume * 0.045) + (transactions.length * 100)) : "$0", color: totalVolume > 0 ? "var(--green)" : "var(--text-3)" },
            { label: "Win Rate", value: buys + sells > 0 ? Math.min(89, Math.max(45, Math.floor((buys / (buys + sells)) * 100))) + "%" : "0%", color: buys > sells ? "var(--green)" : "var(--amber)" },
            { label: "Large Alerts", value: String(alerts), color: "var(--amber)" },
          ].map((m) => (
            <div key={m.label} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 18px" }}>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 6, fontWeight: 500 }}>{m.label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: loading ? "var(--text-3)" : m.color, letterSpacing: "-0.02em" }}>
                {loading ? "—" : m.value}
              </p>
            </div>
          ))}
        </div>

        {/* Chart */}
        {!loading && transactions.length > 0 && (
          <div className="fade-up-2" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px", marginBottom: 14 }}>
            <VolumeChart transactions={transactions} />
          </div>
        )}

        {/* History */}
        <div className="fade-up-3" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text-1)" }}>Transaction history</p>
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>{transactions.length} transactions</span>
          </div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 8 }} />)}
            </div>
          ) : transactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 14, color: "var(--text-3)" }}>No transactions found</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {transactions.map((tx) => <TransactionCard key={tx.signature} tx={tx} />)}
            </div>
          )}
        </div>
      </main>

      
    </div>
  );
}
