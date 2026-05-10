"use client";

import { useState } from "react";
import Link from "next/link";
import { WhaleWallet, WatchlistEntry } from "@/lib/types";
import { truncateAddress, timeAgo } from "@/lib/format";

interface WhaleTableProps {
  whales: WhaleWallet[];
  watchlist: WatchlistEntry[];
  onAddWallet: () => void;
  onRemoveWatchlist: (address: string) => void;
  lastActivity: Record<string, number>;
}

const catColors: Record<string, { color: string; bg: string }> = {
  "market-maker": { color: "#818cf8", bg: "rgba(129,140,248,0.1)" },
  exchange: { color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  fund: { color: "var(--amber)", bg: "var(--amber-bg)" },
  insider: { color: "var(--green)", bg: "var(--green-bg)" },
  protocol: { color: "var(--text-2)", bg: "var(--surface-3)" },
  bridge: { color: "#fb923c", bg: "rgba(251,146,60,0.1)" },
  staking: { color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  whale: { color: "var(--red)", bg: "var(--red-bg)" },
};

export default function WhaleTable({
  whales,
  watchlist,
  onAddWallet,
  onRemoveWatchlist,
  lastActivity,
}: WhaleTableProps) {
  const [tab, setTab] = useState<"whales" | "watchlist">("whales");
  const [hoveredAddress, setHoveredAddress] = useState<string | null>(null);

  const isRecent = (address: string) => {
    const ts = lastActivity[address];
    return ts ? Date.now() - ts < 3_600_000 : false;
  };

  const tabBtn = (id: typeof tab, label: string, count: number) => (
    <button
      className="mono"
      onClick={() => setTab(id)}
      style={{
        padding: "6px 12px",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        cursor: "pointer",
        border: tab === id ? "1px solid var(--accent)" : "1px solid var(--border)",
        backgroundColor: tab === id ? "var(--surface-2)" : "transparent",
        color: tab === id ? "var(--text-1)" : "var(--text-2)",
        transition: "all 0.15s",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {label}
      <span
        style={{
          padding: "1px 6px",
          borderRadius: 4,
          fontSize: 9,
          backgroundColor: tab === id ? "var(--surface)" : "var(--surface-3)",
          color: "var(--text-2)",
        }}
      >
        {count}
      </span>
    </button>
  );

  const renderRow = (
    address: string,
    label: string,
    category?: string,
    isCustom?: boolean,
  ) => {
    const recent = isRecent(address);
    const cat = category ? catColors[category] : null;
    const isHovered = hoveredAddress === address;

    return (
      <div
        key={address}
        onMouseEnter={() => setHoveredAddress(address)}
        onMouseLeave={() => setHoveredAddress(null)}
        style={{
          display: "table-row",
          backgroundColor: isHovered ? "var(--surface-2)" : "transparent",
          transition: "background-color 0.12s",
        }}
      >
        {/* Activity dot cell */}
        <div style={{ display: "table-cell", padding: "12px 0 12px 12px", verticalAlign: "middle", width: 24, borderBottom: "1px solid var(--border)" }}>
          <div
            className={recent ? "pulse-green" : ""}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: recent ? "var(--green)" : "var(--border-strong)",
              transition: "background-color 0.2s",
            }}
          />
        </div>

        {/* Label + address cell */}
        <div style={{ display: "table-cell", padding: "12px 8px", verticalAlign: "middle", borderBottom: "1px solid var(--border)" }}>
          <Link
            href={`/wallet/${address}`}
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-1)",
              textDecoration: "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "200px"
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--accent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-1)")
            }
          >
            {label}
          </Link>
          <span
            className="mono"
            style={{ fontSize: 11, color: "var(--text-3)", display: "block", marginTop: 4 }}
          >
            {truncateAddress(address, 6)}
          </span>
        </div>

        {/* Badge cell */}
        <div style={{ display: "table-cell", padding: "12px 8px", verticalAlign: "middle", borderBottom: "1px solid var(--border)" }}>
          {isCustom ? (
             <span
             className="mono"
             style={{
               padding: "2px 6px",
               borderRadius: 4,
               fontSize: 10,
               fontWeight: 700,
               backgroundColor: "var(--accent-bg)",
               color: "var(--accent)",
               border: "1px solid var(--accent)",
               textTransform: "uppercase"
             }}
           >
             CUSTOM
           </span>
          ) : cat ? (
            <span
              className="mono"
              style={{
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 700,
                backgroundColor: "transparent",
                color: cat.color,
                border: `1px solid ${cat.color}`,
                textTransform: "uppercase",
              }}
            >
              {category}
            </span>
          ) : null}
        </div>

        {/* Last seen cell */}
        <div className="mono" style={{ display: "table-cell", padding: "12px 12px 12px 8px", verticalAlign: "middle", fontSize: 10, color: "var(--text-3)", textAlign: "right", borderBottom: "1px solid var(--border)", minWidth: 60 }}>
          {lastActivity[address] ? timeAgo(lastActivity[address]) : "—"}
          {isCustom && isHovered && (
            <button
              onClick={() => onRemoveWatchlist(address)}
              title="Remove"
              style={{
                float: "right",
                width: 20,
                height: 20,
                marginLeft: 8,
                borderRadius: 4,
                border: "none",
                backgroundColor: "var(--red-bg)",
                color: "var(--red)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  };

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
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {tabBtn("whales", "WHALES", whales.length)}
          {tabBtn("watchlist", "MY WATCHLIST", watchlist.length)}
        </div>
        <button
          className="mono"
          onClick={onAddWallet}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 4,
            border: "1px solid var(--accent)",
            backgroundColor: "var(--accent)",
            color: "var(--surface)",
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <span>+</span>
          ADD WALLET
        </button>
      </div>

      {/* Table */}
      <div
        className="hide-scrollbar"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        <div style={{ display: "table", width: "100%", borderCollapse: "collapse" }}>
          {/* Column headers */}
          <div style={{ display: "table-row", borderBottom: "2px solid var(--border-strong)" }}>
            <div style={{ display: "table-cell", padding: "0 0 8px 12px" }}></div>
            <div className="mono" style={{ display: "table-cell", padding: "0 8px 8px", fontSize: 10, color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.05em" }}>WALLET</div>
            <div className="mono" style={{ display: "table-cell", padding: "0 8px 8px", fontSize: 10, color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.05em" }}>TYPE</div>
            <div className="mono" style={{ display: "table-cell", padding: "0 12px 8px 8px", fontSize: 10, color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.05em", textAlign: "right" }}>LAST ACTIVE</div>
          </div>
          
          {tab === "whales" ? (
            whales.map((w) => renderRow(w.address, w.label, w.category, false))
          ) : watchlist.length === 0 ? (
            <div style={{ display: "table-row" }}>
              <div style={{ display: "table-cell",  padding: "40px", textAlign: "center" }}>
                <p className="mono" style={{ fontSize: 13, color: "var(--text-3)" }}>
                  YOUR WATCHLIST IS EMPTY
                </p>
              </div>
            </div>
          ) : (
            watchlist.map((w) =>
              renderRow(w.address, w.label || "Custom", undefined, true),
            )
          )}
        </div>
      </div>
    </div>
  );
}
