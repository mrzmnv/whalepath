import prisma from '@/lib/db';

export const revalidate = 0; // Prevent caching

export default async function AdminDashboard() {
  const transactionCount = await prisma.transaction.count();
  const whaleCount = await prisma.whale.count();
  const watchlistCount = await prisma.watchlist.count();
  const latestTransactions = await prisma.transaction.findMany({
    orderBy: { timestamp: 'desc' },
    take: 5
  });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', marginBottom: 24 }}>System Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 40 }}>
        {/* Card 1 */}
        <div style={{ backgroundColor: 'var(--surface)', padding: 24, borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Transactions</p>
          <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)', marginTop: 8 }}>{transactionCount}</p>
        </div>
        {/* Card 2 */}
        <div style={{ backgroundColor: 'var(--surface)', padding: 24, borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tracked Whales</p>
          <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-1)', marginTop: 8 }}>{whaleCount}</p>
        </div>
        {/* Card 3 */}
        <div style={{ backgroundColor: 'var(--surface)', padding: 24, borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Watchlists</p>
          <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-1)', marginTop: 8 }}>{watchlistCount}</p>
        </div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>Recent Synced Transactions</h2>
      <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-2)' }}>Type</th>
              <th style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-2)' }}>Token</th>
              <th style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-2)' }}>Value (USD)</th>
              <th style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-2)' }}>Wallet</th>
            </tr>
          </thead>
          <tbody>
            {latestTransactions.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 16, textAlign: 'center', color: 'var(--text-3)' }}>No transactions synced yet</td></tr>
            ) : (
              latestTransactions.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border-strong)' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>
                    <span style={{ backgroundColor: t.type === 'buy' ? 'var(--green-bg)' : t.type === 'sell' ? 'var(--red-bg)' : 'var(--surface-3)', color: t.type === 'buy' ? 'var(--green)' : t.type === 'sell' ? 'var(--red)' : 'var(--text-2)', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                      {t.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600 }}>{t.tokenSymbol}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: 'var(--text-2)' }}>${t.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: 'var(--text-2)' }} className="mono">{t.walletLabel || t.walletAddress.substring(0, 8)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
