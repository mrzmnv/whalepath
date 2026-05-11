import prisma from "@/lib/db";
import Link from "next/link";

export const revalidate = 120;

function formatUSD(v: number) {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

export default async function TokensPage() {
  // Aggregate buy volume and count by tokenSymbol
  const buyAggs = await prisma.transaction.groupBy({
    by: ["tokenSymbol"],
    where: { type: "buy" },
    _sum: { usdValue: true },
    _count: { id: true },
    orderBy: { _sum: { usdValue: "desc" } },
    take: 20,
  });

  // Aggregate sell volume and count by tokenSymbol
  const sellAggs = await prisma.transaction.groupBy({
    by: ["tokenSymbol"],
    where: { type: "sell" },
    _sum: { usdValue: true },
    _count: { id: true },
  });

  const sellMap: Record<string, { volume: number; count: number }> = {};
  for (const s of sellAggs) {
    sellMap[s.tokenSymbol] = {
      volume: s._sum.usdValue || 0,
      count: s._count.id,
    };
  }

  // Get number of unique wallets buying each token
  const uniqueWalletRows = await Promise.all(
    buyAggs.map(async (row) => {
      const unique = await prisma.transaction.findMany({
        where: { tokenSymbol: row.tokenSymbol, type: "buy" },
        select: { walletAddress: true },
        distinct: ["walletAddress"],
      });
      return { tokenSymbol: row.tokenSymbol, uniqueWhales: unique.length };
    })
  );
  const uniqueMap: Record<string, number> = {};
  for (const u of uniqueWalletRows) {
    uniqueMap[u.tokenSymbol] = u.uniqueWhales;
  }

  const maxVolume = buyAggs[0]?._sum.usdValue || 1;

  const totalBuyVolume = buyAggs.reduce((s, r) => s + (r._sum.usdValue || 0), 0);
  const totalBuyTxs = buyAggs.reduce((s, r) => s + r._count.id, 0);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <Link
            href="/"
            style={{ color: "var(--text-3)", textDecoration: "none", fontSize: 12, fontWeight: 600 }}
          >
            ← Back
          </Link>
        </div>
        <h1
          className="mono"
          style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0, marginBottom: 8, color: "var(--text-1)" }}
        >
          TOKEN HEAT MAP
        </h1>
        <p style={{ color: "var(--text-3)", fontSize: 14, margin: 0 }}>
          Tokens being accumulated by tracked whales — ranked by total buy volume
        </p>
      </div>

      {/* Summary stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[
          { label: "TOKENS TRACKED", value: buyAggs.length.toString() },
          { label: "TOTAL BUY VOLUME", value: formatUSD(totalBuyVolume) },
          { label: "BUY TRANSACTIONS", value: totalBuyTxs.toLocaleString() },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: "20px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
            }}
          >
            <div
              className="mono"
              style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 8 }}
            >
              {stat.label}
            </div>
            <div
              className="mono"
              style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.03em" }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Token heatmap table */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40px 120px 1fr 120px 100px 100px 80px",
            gap: 0,
            padding: "10px 20px",
            borderBottom: "2px solid var(--border-strong)",
          }}
        >
          {["#", "TOKEN", "BUY PRESSURE", "BUY VOL", "SELL VOL", "NET FLOW", "WHALES"].map((h) => (
            <span
              key={h}
              className="mono"
              style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.08em" }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {buyAggs.map((row, i) => {
          const buyVol = row._sum.usdValue || 0;
          const buyCnt = row._count.id;
          const sellVol = sellMap[row.tokenSymbol]?.volume || 0;
          const netFlow = buyVol - sellVol;
          const barWidth = Math.round((buyVol / maxVolume) * 100);
          const whales = uniqueMap[row.tokenSymbol] || 0;

          return (
            <div
              key={row.tokenSymbol}
              className="token-row"
              style={{
                display: "grid",
                gridTemplateColumns: "40px 120px 1fr 120px 100px 100px 80px",
                gap: 0,
                padding: "14px 20px",
                borderBottom: "1px solid var(--border)",
                alignItems: "center",
              }}
            >
              {/* Rank */}
              <span
                className="mono"
                style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}
              >
                {i + 1}
              </span>

              {/* Token symbol */}
              <div>
                <span
                  className="mono"
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: i < 3 ? "var(--amber)" : "var(--text-1)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {row.tokenSymbol}
                </span>
                <span
                  className="mono"
                  style={{ fontSize: 10, color: "var(--text-3)", display: "block", marginTop: 2 }}
                >
                  {buyCnt} buys
                </span>
              </div>

              {/* Bar */}
              <div style={{ paddingRight: 24 }}>
                <div
                  style={{
                    height: 6,
                    background: "var(--surface-3)",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${barWidth}%`,
                      background:
                        barWidth > 70
                          ? "var(--amber)"
                          : barWidth > 40
                          ? "var(--green)"
                          : "var(--accent)",
                      borderRadius: 3,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>

              {/* Buy vol */}
              <span
                className="mono"
                style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}
              >
                {formatUSD(buyVol)}
              </span>

              {/* Sell vol */}
              <span
                className="mono"
                style={{ fontSize: 13, fontWeight: 700, color: "var(--red)" }}
              >
                {sellVol > 0 ? formatUSD(sellVol) : "—"}
              </span>

              {/* Net flow */}
              <span
                className="mono"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: netFlow > 0 ? "var(--green)" : "var(--red)",
                }}
              >
                {netFlow > 0 ? "+" : ""}
                {formatUSD(netFlow)}
              </span>

              {/* Unique whales */}
              <span
                className="mono"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--text-2)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                🐋 {whales}
              </span>
            </div>
          );
        })}
      </div>

      <p
        style={{
          textAlign: "center",
          color: "var(--text-3)",
          fontSize: 12,
          marginTop: 24,
          fontStyle: "italic",
        }}
      >
        Data sourced from tracked whale wallets via Helius RPC. Updates every 2 minutes.
      </p>
    </main>
  );
}
