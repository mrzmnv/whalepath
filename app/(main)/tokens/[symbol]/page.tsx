import prisma from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 120;

function formatUSD(v: number) {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function truncate(addr: string, chars = 4) {
  if (addr.length <= chars * 2 + 3) return addr;
  return `${addr.slice(0, chars)}…${addr.slice(-chars)}`;
}

interface Props {
  params: Promise<{ symbol: string }>;
}

export default async function TokenDetailPage({ params }: Props) {
  const { symbol } = await params;
  const decodedSymbol = decodeURIComponent(symbol).toUpperCase();

  const transactions = await prisma.transaction.findMany({
    where: { tokenSymbol: { equals: decodedSymbol, mode: "insensitive" } },
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  if (transactions.length === 0) notFound();

  // Aggregate stats
  const buyTxs = transactions.filter((t) => t.type === "buy");
  const sellTxs = transactions.filter((t) => t.type === "sell");
  const totalBuyVol = buyTxs.reduce((s, t) => s + t.usdValue, 0);
  const totalSellVol = sellTxs.reduce((s, t) => s + t.usdValue, 0);
  const netFlow = totalBuyVol - totalSellVol;

  // Unique whales with per-whale stats
  const whaleMap: Record<
    string,
    { label: string; buys: number; sells: number; buyVol: number; sellVol: number; lastTs: number }
  > = {};
  for (const tx of transactions) {
    if (!whaleMap[tx.walletAddress]) {
      whaleMap[tx.walletAddress] = {
        label: tx.walletLabel ?? truncate(tx.walletAddress),
        buys: 0,
        sells: 0,
        buyVol: 0,
        sellVol: 0,
        lastTs: tx.timestamp,
      };
    }
    const entry = whaleMap[tx.walletAddress];
    if (tx.type === "buy") {
      entry.buys++;
      entry.buyVol += tx.usdValue;
    } else if (tx.type === "sell") {
      entry.sells++;
      entry.sellVol += tx.usdValue;
    }
    if (tx.timestamp > entry.lastTs) entry.lastTs = tx.timestamp;
  }

  const whaleSummary = Object.entries(whaleMap)
    .map(([address, s]) => ({ address, ...s }))
    .sort((a, b) => b.buyVol + b.sellVol - (a.buyVol + a.sellVol));

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      {/* Back link */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/tokens"
          style={{ color: "var(--text-3)", textDecoration: "none", fontSize: 12, fontWeight: 600 }}
        >
          ← Back to Heat Map
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          className="mono"
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            margin: 0,
            marginBottom: 8,
            color: "var(--text-1)",
          }}
        >
          {decodedSymbol}
        </h1>
        <p style={{ color: "var(--text-3)", fontSize: 14, margin: 0 }}>
          Whale activity breakdown — {transactions.length} transactions tracked
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[
          { label: "BUY VOLUME", value: formatUSD(totalBuyVol), color: "var(--green)" },
          { label: "SELL VOLUME", value: formatUSD(totalSellVol), color: "var(--red)" },
          {
            label: "NET FLOW",
            value: `${netFlow >= 0 ? "+" : ""}${formatUSD(netFlow)}`,
            color: netFlow >= 0 ? "var(--green)" : "var(--red)",
          },
          { label: "UNIQUE WHALES", value: whaleSummary.length.toString(), color: "var(--text-1)" },
          { label: "BUY TXS", value: buyTxs.length.toString(), color: "var(--green)" },
          { label: "SELL TXS", value: sellTxs.length.toString(), color: "var(--red)" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: "16px 20px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
            }}
          >
            <div
              className="mono"
              style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 6 }}
            >
              {stat.label}
            </div>
            <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: stat.color, letterSpacing: "-0.03em" }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Whale activity table */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "hidden",
          marginBottom: 32,
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", letterSpacing: "0.05em" }}>
            WHALE BREAKDOWN
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 80px 100px 100px 100px 80px",
            gap: 0,
            padding: "10px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {["WALLET", "BUYS", "SELL", "BUY VOL", "SELL VOL", "LAST"].map((h) => (
            <span key={h} className="mono" style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.08em" }}>
              {h}
            </span>
          ))}
        </div>
        {whaleSummary.map((w) => (
          <div
            key={w.address}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 100px 100px 100px 80px",
              gap: 0,
              padding: "12px 20px",
              borderBottom: "1px solid var(--border)",
              alignItems: "center",
            }}
          >
            <div>
              <Link
                href={`/wallet/${w.address}`}
                style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}
              >
                {w.label}
              </Link>
              <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", display: "block", marginTop: 2 }}>
                {truncate(w.address)}
              </span>
            </div>
            <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--green)" }}>
              {w.buys}
            </span>
            <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--red)" }}>
              {w.sells}
            </span>
            <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--green)" }}>
              {w.buyVol > 0 ? formatUSD(w.buyVol) : "—"}
            </span>
            <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--red)" }}>
              {w.sellVol > 0 ? formatUSD(w.sellVol) : "—"}
            </span>
            <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
              {timeAgo(w.lastTs * 1000)}
            </span>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", letterSpacing: "0.05em" }}>
            RECENT TRANSACTIONS
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 80px 120px 80px",
            gap: 0,
            padding: "10px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {["WALLET", "TYPE", "USD VALUE", "TIME"].map((h) => (
            <span key={h} className="mono" style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.08em" }}>
              {h}
            </span>
          ))}
        </div>
        {transactions.slice(0, 30).map((tx) => (
          <div
            key={tx.signature}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 120px 80px",
              gap: 0,
              padding: "10px 20px",
              borderBottom: "1px solid var(--border)",
              alignItems: "center",
            }}
          >
            <Link
              href={`/wallet/${tx.walletAddress}`}
              style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)", textDecoration: "none" }}
            >
              {tx.walletLabel}
            </Link>
            <span
              className="mono"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: tx.type === "buy" ? "var(--green)" : tx.type === "sell" ? "var(--red)" : "var(--text-3)",
                textTransform: "uppercase",
              }}
            >
              {tx.type}
            </span>
            <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--text-1)" }}>
              {formatUSD(tx.usdValue)}
            </span>
            <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
              {timeAgo(tx.timestamp * 1000)}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
