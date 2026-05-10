"use client";

import { useState, useEffect, useCallback } from "react";
import { WhaleWallet, WatchlistEntry, StatsData } from "@/lib/types";
import whalesData from "../../public/whales.json";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "@/lib/storage";

import StatsBar from "@/components/StatsBar";
import TransactionFeed from "@/components/TransactionFeed";
import WhaleTable from "@/components/WhaleTable";
import AddWalletModal from "@/components/AddWalletModal";

export default function Dashboard() {
  // User ID will be fetched client side later if needed
  const [whales, setWhales] = useState<WhaleWallet[]>(whalesData as WhaleWallet[]);
  
  // Fetch dynamic whales from DB on mount
  useEffect(() => {
    fetch('/api/whales')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setWhales(data);
          setStats((s) => ({ ...s, totalWhales: data.length }));
        }
      })
      .catch(() => {});
  }, []);
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalWhales: 0,
    transactions24h: 0,
    largestMoveToday: 0,
    largestMoveToken: "",
  });
  const [lastActivity, setLastActivity] = useState<Record<string, number>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    setStats((s) => ({ ...s, totalWhales: whalesData.length }));
    
    reloadWatchlist();
  }, []);

  const reloadWatchlist = useCallback(() => {
    fetch('/api/watchlist')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.authenticated && data?.items) {
          const formatted = data.items.map((item: any) => ({
            id: item.id,
            address: item.address,
            label: item.label,
            type: item.type,
            addedAt: new Date(item.createdAt).getTime()
          }));
          setWatchlist(formatted);
        } else {
          setWatchlist(getWatchlist());
        }
      })
      .catch(() => {
        setWatchlist(getWatchlist());
      });
  }, []);

  const handleToggleFavorite = useCallback(async (address: string, label: string) => {
    const isLocal = !document.cookie.includes('session');
    if (isLocal) {
      // Local storage fallback
      const current = getWatchlist();
      const existing = current.find(w => w.address === address && w.type === 'favorite');
      if (existing) {
        setWatchlist(removeFromWatchlist(address));
      } else {
        setWatchlist(addToWatchlist({ address, label, type: 'favorite', addedAt: Date.now(), id: Math.random().toString() }));
      }
      return;
    }

    try {
      const res = await fetch('/api/watchlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, label })
      });
      if (res.ok) reloadWatchlist();
    } catch (e) {
      console.error(e);
    }
  }, [reloadWatchlist]);

  const handleAddWallet = useCallback((entry: WatchlistEntry) => {
    setWatchlist(addToWatchlist(entry));
  }, []);

  const handleRemoveWatchlist = useCallback((address: string) => {
    setWatchlist(removeFromWatchlist(address));
  }, []);

  const handleStatsUpdate = useCallback(
    (txCount: number, largestMove: number, largestToken: string) => {
      setStats((s) => ({
        ...s,
        transactions24h: s.transactions24h + txCount,
        largestMoveToday: Math.max(s.largestMoveToday, largestMove),
        largestMoveToken:
          largestMove > s.largestMoveToday ? largestToken : s.largestMoveToken,
      }));
      setLastActivity((prev) => ({ ...prev, _lastPoll: Date.now() }));
    },
    [],
  );

  const allAddresses = [
    ...whales.map((w) => w.address),
    ...watchlist.map((w) => w.address),
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      

      <main
        style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 24px 48px" }}
      >
        {/* Stats */}
        <div style={{ marginBottom: 24 }} className="fade-up">
          <StatsBar stats={stats} loading={statsLoading} />
        </div>

        {/* Two-column layout */}
        <div className="fade-up-1 dashboard-grid">
          {/* Feed */}
          <div
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              boxShadow: "var(--shadow)",
              maxHeight: "calc(100vh - 200px)",
              overflow: "hidden",
            }}
          >
            <TransactionFeed
              preloadedWhales={whales}
              watchlist={watchlist}
              onStatsUpdate={handleStatsUpdate}
            />
          </div>

          {/* Whale list */}
          <div
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              boxShadow: "var(--shadow)",
              maxHeight: "calc(100vh - 200px)",
              overflow: "hidden",
            }}
          >
            <WhaleTable
              whales={whales}
              watchlist={watchlist}
              onAddWallet={() => setModalOpen(true)}
              onRemoveWatchlist={handleRemoveWatchlist}
              onToggleFavorite={handleToggleFavorite}
              lastActivity={lastActivity}
            />
          </div>
        </div>
      </main>

      <footer
        className="mono"
        style={{
          borderTop: "1px solid var(--border)",
          padding: "24px",
          textAlign: "center",
          color: "var(--text-3)",
          fontSize: 10,
          letterSpacing: "0.05em",
          textTransform: "uppercase"
        }}
      >
        WhalePath · Solana Frontier Hackathon 2026 · Built by Hajikhalaf Zamanov
      </footer>

      <AddWalletModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddWallet}
        existingAddresses={allAddresses}
      />
    </div>
  );
}
