"use client";

import { useState, useEffect, useCallback } from "react";
import { WhaleWallet, WatchlistEntry, StatsData } from "@/lib/types";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "@/lib/storage";

import StatsBar from "@/components/StatsBar";
import TransactionFeed from "@/components/TransactionFeed";
import WhaleTable from "@/components/WhaleTable";
import AddWalletModal from "@/components/AddWalletModal";
import WhaleLoader from "@/components/WhaleLoader";

export default function Dashboard() {
  // User ID will be fetched client side later if needed
  const [whales, setWhales] = useState<WhaleWallet[]>([]);
  const [pageReady, setPageReady] = useState(false);

  // Fetch dynamic whales from DB on mount
  useEffect(() => {
    fetch("/api/whales")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setWhales(data);
          setStats((s) => ({ ...s, totalWhales: data.length }));
        }
      })
      .catch(() => {})
      .finally(() => setPageReady(true));
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [planModal, setPlanModal] = useState<"login" | "upgrade" | null>(null);
  const [userPlan, setUserPlan] = useState<string>("free");

  useEffect(() => {
    reloadWatchlist();
  }, []);

  const reloadWatchlist = useCallback(() => {
    fetch("/api/watchlist")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.items) {
          setIsAuthenticated(true);
          const formatted = data.items.map((item: any) => ({
            id: item.id,
            address: item.address,
            label: item.label,
            type: item.type,
            addedAt: new Date(item.createdAt).getTime(),
          }));
          setWatchlist(formatted);
        } else {
          setWatchlist(getWatchlist());
        }
      })
      .catch(() => {
        setWatchlist(getWatchlist());
      });
    // Also fetch user plan
    fetch("/api/user/plan")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.authenticated) {
          setIsAuthenticated(true);
          setUserPlan(d.plan ?? "free");
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleFavorite = useCallback(
    async (address: string, label: string) => {
      // Must be logged in to add/remove
      if (!isAuthenticated) {
        setPlanModal("login");
        return;
      }

      try {
        const res = await fetch("/api/watchlist/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, label }),
        });
        if (res.ok) {
          reloadWatchlist();
        } else if (res.status === 403) {
          setPlanModal("upgrade");
        }
      } catch (e) {
        console.error(e);
      }
    },
    [isAuthenticated, reloadWatchlist],
  );

  const handleAddWallet = useCallback(
    async (entry: WatchlistEntry) => {
      try {
        const res = await fetch("/api/watchlist/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: entry.address,
            label: entry.label,
            type: entry.type || "personal",
          }),
        });
        if (res.ok) {
          reloadWatchlist();
        } else if (res.status === 401) {
          setPlanModal("login");
        } else if (res.status === 403) {
          setPlanModal("upgrade");
        }
      } catch (e) {
        console.error(e);
      }
    },
    [reloadWatchlist],
  );

  const handleRemoveWatchlist = useCallback((address: string) => {
    setWatchlist(removeFromWatchlist(address));
  }, []);

  const handleStatsUpdate = useCallback(
    (
      txCount: number,
      largestMove: number,
      largestToken: string,
      largestAddress: string,
      largestLabel: string,
    ) => {
      setStats((s) => ({
        ...s,
        transactions24h: s.transactions24h + txCount,
        largestMoveToday: Math.max(s.largestMoveToday, largestMove),
        largestMoveToken:
          largestMove > s.largestMoveToday ? largestToken : s.largestMoveToken,
        largestMoveAddress:
          largestMove > s.largestMoveToday
            ? largestAddress
            : s.largestMoveAddress,
        largestMoveLabel:
          largestMove > s.largestMoveToday ? largestLabel : s.largestMoveLabel,
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
      <WhaleLoader visible={!pageReady} />
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
              onAddWallet={() => {
                if (!isAuthenticated) {
                  setPlanModal("login");
                  return;
                }
                setModalOpen(true);
              }}
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
          textTransform: "uppercase",
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

      {/* Login gate modal */}
      {planModal === "login" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setPlanModal(null)}
        >
          <div
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "32px",
              maxWidth: 360,
              width: "90%",
              boxShadow: "var(--shadow)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className="mono"
              style={{
                fontSize: 12,
                color: "var(--text-3)",
                letterSpacing: "0.08em",
              }}
            >
              SIGN IN REQUIRED
            </p>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--text-1)",
                margin: 0,
              }}
            >
              Create a free account to track wallets
            </p>
            <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
              Log in to add wallets to your watchlist and get personalized
              alerts.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <a
                href="/login"
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "10px 0",
                  backgroundColor: "var(--accent)",
                  borderRadius: 8,
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Log in
              </a>
              <a
                href="/register"
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "10px 0",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--text-1)",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Register
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade modal */}
      {planModal === "upgrade" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setPlanModal(null)}
        >
          <div
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--accent)",
              borderRadius: "var(--radius)",
              padding: "32px",
              maxWidth: 380,
              width: "90%",
              boxShadow: "0 0 0 1px var(--accent), var(--shadow)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className="mono"
              style={{
                fontSize: 12,
                color: "var(--accent)",
                letterSpacing: "0.08em",
              }}
            >
              PLAN LIMIT REACHED
            </p>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--text-1)",
                margin: 0,
              }}
            >
              {userPlan === "free"
                ? "Free plan: 5 wallet limit"
                : "Pro plan: 25 wallet limit"}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
              Upgrade to track more wallets and unlock advanced features like
              Telegram alerts.
            </p>
            <a
              href="/plans"
              style={{
                textAlign: "center",
                padding: "10px 0",
                backgroundColor: "var(--accent)",
                borderRadius: 8,
                color: "#fff",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              View plans
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
