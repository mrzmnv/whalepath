const fs = require('fs');
const file = 'components/StatsBar.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  'import { formatUSD, formatNumber } from "@/lib/format";',
  'import { formatUSD, formatNumber, truncateAddress } from "@/lib/format";\nimport Link from "next/link";'
);

const newItemsLogic = `  const items = [
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
      sub: stats.largestMoveToken ? \`Asset: \${stats.largestMoveToken}\` : "—",
      delay: "fade-up-2",
      highlight: true,
      address: stats.largestMoveAddress,
      walletLabel: stats.largestMoveLabel
    },
  ];`;

data = data.replace(/  const items = \[\s*\{[\s\S]*?\},?\s*\];/, newItemsLogic);

const renderLogic = `    <div className="stats-bar-grid">
      {items.map((item) => {
        const content = (
          <div
            className={\`\${item.delay} card-hover\`}
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "20px 24px",
              boxShadow: "var(--shadow)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <p className="mono" style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.05em" }}>
                  {item.label}
                </p>
                {item.address && (
                   <span className="mono" style={{ fontSize: 9, padding: "2px 6px", background: "var(--surface-3)", borderRadius: 4, color: "var(--text-2)" }}>
                    {item.walletLabel || truncateAddress(item.address)} ↗
                   </span>
                )}
              </div>
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
            </div>
            <p style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500 }}>{item.sub}</p>
          </div>
        );

        return item.address ? (
          <Link key={item.label} href={\`/wallet/\${item.address}\`} style={{ textDecoration: 'none' }}>
            {content}
          </Link>
        ) : (
          <div key={item.label} style={{ height: "100%" }}>{content}</div>
        );
      })}
    </div>`;

data = data.replace(/    <div className="stats-bar-grid">[\s\S]*?<\/div>/, renderLogic);

fs.writeFileSync(file, data);
