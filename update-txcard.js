const fs = require('fs');
const file = 'components/TransactionCard.tsx';
let data = fs.readFileSync(file, 'utf8');

// Function to generate a random or deterministic tag based on the address/label
const generateBadgeLogic = `function getExtraTag(label) {
  if (!label) return null;
  const l = label.toLowerCase();
  if (l.includes('raydium') || l.includes('orca') || l.includes('jupiter')) return { text: 'DEX', color: 'var(--amber)' };
  if (l.includes('binance') || l.includes('coinbase') || l.includes('kraken')) return { text: 'CEX', color: 'var(--blue)' };
  if (l.includes('MEV') || l.includes('jared')) return { text: 'MEV Bot', color: 'var(--red)' };
  // Default to a deterministic web3 tag
  const tags = [
    { text: 'KOL', color: 'var(--purple, #9333ea)' },
    { text: 'Early Buyer', color: 'var(--green)' },
    { text: 'Sniper', color: 'var(--red)' },
    { text: 'Smart Money', color: 'var(--amber)' }
  ];
  const idx = label.length % tags.length;
  return tags[idx];
}`;

// inject logic before default export
data = data.replace('export default function TransactionCard({ tx, isNew }: TransactionCardProps) {', generateBadgeLogic + '\n\nexport default function TransactionCard({ tx, isNew }: TransactionCardProps) {');

// In row 1:
// <span style={{
//   fontWeight: 600, fontSize: 14, color: "var(--text-1)",
//   flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
// }}>
//   {tx.walletLabel}
// </span>

data = data.replace(
  '            <span style={{\n              fontWeight: 600, fontSize: 14, color: "var(--text-1)",\n              flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",\n            }}>\n              {tx.walletLabel}\n            </span>',
  `            <span style={{
              fontWeight: 600, fontSize: 14, color: "var(--text-1)",
              minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {tx.walletLabel}
            </span>
            {(() => {
              const tag = getExtraTag(tx.walletLabel);
              return tag ? (
                <span className="mono" style={{
                  display: "inline-block", padding: "2px 6px", borderRadius: 4, 
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
                  border: \`1px solid \${tag.color}\`, color: tag.color,
                  flexShrink: 0
                }}>
                  {tag.text}
                </span>
              ) : null;
            })()}
            <div style={{ flex: 1 }} />`
);

// Scale coloring based on volume:
// <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.04em", lineHeight: 1 }}>
// ...
// <span className="mono" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)" }}>
//   {formatUSD(tx.usdValue)}
// </span>

data = data.replace(
  '<span className="mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.04em", lineHeight: 1 }}>',
  '<span className="mono" style={{ fontSize: tx.usdValue > 500000 ? 20 : 18, fontWeight: tx.usdValue > 250000 ? 800 : 700, color: tx.usdValue >= 500000 ? "var(--amber)" : tx.usdValue >= 50000 ? "var(--text-1)" : "var(--text-2)", letterSpacing: "-0.04em", lineHeight: 1, transition: "color 0.2s ease" }}>'
);
data = data.replace(
  '<span className="mono" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)" }}>\n                {formatUSD(tx.usdValue)}\n              </span>',
  '<span className="mono" style={{ fontSize: 13, fontWeight: tx.usdValue > 250000 ? 700 : 500, color: tx.usdValue >= 500000 ? "var(--amber)" : tx.usdValue >= 50000 ? "var(--text-2)" : "var(--text-3)", marginLeft: 4 }}>\n                {formatUSD(tx.usdValue)}\n              </span>'
);

fs.writeFileSync(file, data);
