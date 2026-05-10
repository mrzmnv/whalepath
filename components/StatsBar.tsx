"use client";

import { StatsData } from "@/lib/types";
import { formatUSD, formatNumber } from "@/lib/format";

interface StatsBarProps {
  stats: StatsData;
  loading?: boolean;
}

export default function StatsBar({ stats, loading }: StatsBarProps) {
  const items = [
    {
      label: "TRACKED WALLETS",
      value: formatNumber(stats.totalWhales),
      sub: "Known signatures in cache",
      delay: "fade-up",
    },
    {
      label: "24H HIGH-NET FLOW",
      value: formatNumber(stats.transactions24h),
      sub: "Over $50k threshold",
      delay: "fade-up-1",
    },
    {
      label: "PEAK TRANSFER",
      value: formatUSD(stats.largestMoveToday),
      sub: stats.largestMoveToken ? `Asset: ${stats.largestMoveToken}` : "—",
      delay: "fade-up-2",
      highlight: true,
    },
  ];

  return (
    <div className="stats-bar-grid">
      {items.map((item) => (
        <div
          key={item.label}
          className={`${item.delay} card-hover`}
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)", /* Sharper 8px */
            padding: "20px 24px",
            boxShadow: "var(--shadow)",
          }}
        >
          <p className="mono" style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 12, fontWeight: 600, letterSpacing: "0.05em" }}>
            {item.label}
          </p>
          {loading ? (
            <div className="skeleton" style={{ height: 32, width: "55%", marginBottom: 8 }} />
          ) : (
            <p
              style={{
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: item.highlight ? "var(--amber)" : "var(--text-1)",
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              {item.value}
            </p>
          )}
          <p style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500 }}>{item.sub}</p>
        </div>
      ))}
    </div>
  );
}
