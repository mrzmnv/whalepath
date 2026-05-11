import prisma from "@/lib/db";
import Link from "next/link";
import CompareForm from "./CompareForm";

export const revalidate = 0;

function formatUSD(v: number) {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function truncate(addr: string, chars = 5) {
  if (addr.length <= chars * 2 + 3) return addr;
  return `${addr.slice(0, chars)}…${addr.slice(-chars)}`;
}

async function getWalletStats(address: string) {
  const [txStats, tokenStats, whaleRecord] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type"],
      where: { walletAddress: address },
      _sum: { usdValue: true },
      _count: { id: true },
    }),
    prisma.transaction.groupBy({
      by: ["tokenSymbol"],
      where: { walletAddress: address },
      _sum: { usdValue: true },
      _count: { id: true },
      orderBy: { _sum: { usdValue: "desc" } },
      take: 5,
    }),
    prisma.whale.findUnique({ where: { address } }),
  ]);

  const buyStats = txStats.find((t) => t.type === "buy");
  const sellStats = txStats.find((t) => t.type === "sell");
  const totalBuyVol = buyStats?._sum.usdValue || 0;
  const totalSellVol = sellStats?._sum.usdValue || 0;
  const buyCount = buyStats?._count.id || 0;
  const sellCount = sellStats?._count.id || 0;
  const totalVol = totalBuyVol + totalSellVol;
  const txCount = buyCount + sellCount;
  const buyRatio = txCount > 0 ? Math.round((buyCount / txCount) * 100) : 0;

  return {
    address,
    label: whaleRecord?.label || truncate(address),
    category: whaleRecord?.category || null,
    totalVol,
    totalBuyVol,
    totalSellVol,
    txCount,
    buyCount,
    sellCount,
    buyRatio,
    topTokens: tokenStats,
    netFlow: totalBuyVol - totalSellVol,
  };
}

interface Props {
  searchParams: Promise<{ a?: string; b?: string }>;
}

export default async function ComparePage({ searchParams }: Props) {
  const { a, b } = await searchParams;

  const validA = a && /^[A-Za-z0-9]{32,44}$/.test(a) ? a : null;
  const validB = b && /^[A-Za-z0-9]{32,44}$/.test(b) ? b : null;

  const [statsA, statsB] = await Promise.all([
    validA ? getWalletStats(validA) : null,
    validB ? getWalletStats(validB) : null,
  ]);

  const rows: { label: string; key: keyof ReturnType<typeof getWalletStats> extends Promise<infer T> ? T : never; format?: (v: unknown) => string }[] = [];

  type Stats = Awaited<ReturnType<typeof getWalletStats>>;

  const compareRows: { label: string; getValue: (s: Stats) => string; colorValue?: (s: Stats) => string }[] = [
    { label: "LABEL", getValue: (s) => s.label },
    { label: "CATEGORY", getValue: (s) => s.category || "—" },
    {
      label: "TOTAL VOLUME",
      getValue: (s) => formatUSD(s.totalVol),
      colorValue: (s) => s.totalVol > 0 ? "var(--text-1)" : "var(--text-3)",
    },
    {
      label: "BUY VOLUME",
      getValue: (s) => formatUSD(s.totalBuyVol),
      colorValue: () => "var(--green)",
    },
    {
      label: "SELL VOLUME",
      getValue: (s) => formatUSD(s.totalSellVol),
      colorValue: () => "var(--red)",
    },
    {
      label: "NET FLOW",
      getValue: (s) => `${s.netFlow >= 0 ? "+" : ""}${formatUSD(s.netFlow)}`,
      colorValue: (s) => s.netFlow >= 0 ? "var(--green)" : "var(--red)",
    },
    { label: "TOTAL TXS", getValue: (s) => s.txCount.toString() },
    { label: "BUY TXS", getValue: (s) => s.buyCount.toString() },
    { label: "SELL TXS", getValue: (s) => s.sellCount.toString() },
    {
      label: "BUY RATIO",
      getValue: (s) => `${s.buyRatio}%`,
      colorValue: (s) => s.buyRatio >= 60 ? "var(--green)" : s.buyRatio <= 40 ? "var(--red)" : "var(--amber)",
    },
  ];

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      {/* Back */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/" style={{ color: "var(--text-3)", textDecoration: "none", fontSize: 12, fontWeight: 600 }}>
          ← Back to Dashboard
        </Link>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 32 }}>
        <h1
          className="mono"
          style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0, marginBottom: 8, color: "var(--text-1)" }}
        >
          WALLET COMPARE
        </h1>
        <p style={{ color: "var(--text-3)", fontSize: 14, margin: 0 }}>
          Enter two wallet addresses to compare their activity side by side
        </p>
      </div>

      {/* Input form */}
      <CompareForm initialA={a || ""} initialB={b || ""} />

      {/* Results */}
      {statsA && statsB && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            overflow: "hidden",
            marginTop: 32,
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "180px 1fr 1fr",
              borderBottom: "2px solid var(--border-strong)",
            }}
          >
            <div style={{ padding: "16px 20px" }} />
            {[statsA, statsB].map((s) => (
              <div
                key={s.address}
                style={{
                  padding: "16px 20px",
                  borderLeft: "1px solid var(--border)",
                  textAlign: "center",
                }}
              >
                <Link
                  href={`/wallet/${s.address}`}
                  style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}
                >
                  {s.label}
                </Link>
                <div className="mono" style={{ fontSize: 10, color: "var(--text-3)", marginTop: 4 }}>
                  {truncate(s.address)}
                </div>
              </div>
            ))}
          </div>

          {/* Data rows */}
          {compareRows.map((row) => (
            <div
              key={row.label}
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr 1fr",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                className="mono"
                style={{
                  padding: "12px 20px",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-3)",
                  letterSpacing: "0.08em",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {row.label}
              </div>
              {[statsA, statsB].map((s) => (
                <div
                  key={s.address}
                  className="mono"
                  style={{
                    padding: "12px 20px",
                    borderLeft: "1px solid var(--border)",
                    fontSize: 13,
                    fontWeight: 700,
                    color: row.colorValue ? row.colorValue(s) : "var(--text-1)",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {row.getValue(s)}
                </div>
              ))}
            </div>
          ))}

          {/* Top tokens */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "180px 1fr 1fr",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div
              className="mono"
              style={{
                padding: "12px 20px",
                fontSize: 10,
                fontWeight: 700,
                color: "var(--text-3)",
                letterSpacing: "0.08em",
              }}
            >
              TOP TOKENS
            </div>
            {[statsA, statsB].map((s) => (
              <div
                key={s.address}
                style={{
                  padding: "12px 20px",
                  borderLeft: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {s.topTokens.map((t) => (
                  <div key={t.tokenSymbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Link
                      href={`/tokens/${encodeURIComponent(t.tokenSymbol)}`}
                      className="mono"
                      style={{ fontSize: 12, fontWeight: 700, color: "var(--amber)", textDecoration: "none" }}
                    >
                      {t.tokenSymbol}
                    </Link>
                    <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
                      {formatUSD(t._sum.usdValue || 0)}
                    </span>
                  </div>
                ))}
                {s.topTokens.length === 0 && (
                  <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>—</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partial state messages */}
      {(validA || validB) && !(statsA && statsB) && (
        <div
          style={{
            marginTop: 24,
            padding: "16px 20px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text-3)",
            fontSize: 14,
          }}
        >
          {!validA && a ? "❌ Wallet A: invalid address format." : ""}
          {!validB && b ? "❌ Wallet B: invalid address format." : ""}
          {validA && !statsA ? "No data found for wallet A." : ""}
          {validB && !statsB ? "No data found for wallet B." : ""}
          {(!a || !b) && "Enter both wallet addresses to compare."}
        </div>
      )}
    </main>
  );
}
