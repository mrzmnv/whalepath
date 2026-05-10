const fs = require('fs');
const file = 'app/(main)/(user)/profile/page.tsx';
let data = fs.readFileSync(file, 'utf8');

if (!data.includes('import { formatUSD } from "@/lib/format"')) {
  data = data.replace('import { logoutUser } from "@/app/actions/userAuth";', 'import { logoutUser } from "@/app/actions/userAuth";\nimport { formatUSD } from "@/lib/format";\nimport Link from "next/link";');
}

if (!data.includes('const txAggregations')) {
  const query = `  const favoriteWhales = watchlists.filter((w: any) => w.type === 'favorite');

  const favoriteAddresses = favoriteWhales.map((w: any) => w.address);
  const txAggregations = await prisma.transaction.groupBy({
    by: ['walletAddress'],
    where: { walletAddress: { in: favoriteAddresses } },
    _sum: { usdValue: true },
    _count: { id: true }
  });

  const txStats = txAggregations.reduce((acc: any, curr: any) => {
    acc[curr.walletAddress] = {
      volume: curr._sum.usdValue || 0,
      count: curr._count.id || 0
    };
    return acc;
  }, {});`;

  data = data.replace("  const favoriteWhales = watchlists.filter(w => w.type === 'favorite');", query);
}

const itemRender = `          {favoriteWhales.map((w: any) => {
            const stats = txStats[w.address] || { volume: 0, count: 0 };
            return (
            <Link href={ \`/wallet/\${w.address}\` } key={w.id} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', transition: 'border-color 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"} onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: 16, marginBottom: 4 }}>{w.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }} className="mono">{w.address}</div>
                </div>
                
                <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.05em' }}>VOLUME</span>
                    <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: stats.volume > 500000 ? 'var(--amber)' : 'var(--text-1)' }}>
                      {formatUSD(stats.volume)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.05em' }}>TXS</span>
                    <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-2)' }}>
                      {stats.count}
                    </span>
                  </div>

                  <form action={async (e) => { 'use server'; await removeWatchlistItem(w.id); }} onClick={(e) => e.stopPropagation()}>
                    <button type="submit" style={{ background: 'var(--surface-3)', padding: 8, borderRadius: 6, border: '1px solid var(--border-strong)', color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--red-bg)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--surface-3)"}>
                      <Trash2 size={16} />
                    </button>
                  </form>
                </div>
              </div>
            </Link>
          )})}
`;

data = data.replace(/          \{favoriteWhales\.map\([\s\S]*?\)\}\n/, itemRender);

fs.writeFileSync(file, data);
