import prisma from '@/lib/db';

export const revalidate = 0;

export default async function AlertsAdminPage() {
  const alertTxs = await prisma.transaction.findMany({
    where: { isAlert: true },
    orderBy: { timestamp: 'desc' },
    take: 50,
  });

  const totalAlerts = await prisma.transaction.count({ where: { isAlert: true } });

  function formatUsd(v: number) {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
    return `$${v.toFixed(2)}`;
  }

  const cell = { padding: '12px 16px', fontSize: 13 };
  const typeColor: Record<string, string> = {
    buy: '#22c55e',
    sell: '#ef4444',
    transfer: '#a78bfa',
    unknown: 'var(--text-3)',
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>System Alerts</h1>
      <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 24 }}>Large transactions flagged as alerts. Total: <strong style={{ color: 'var(--text-1)' }}>{totalAlerts}</strong></p>

      {alertTxs.length === 0 ? (
        <div style={{ backgroundColor: 'var(--surface-2)', padding: 32, borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-3)' }}>
          No alerts yet.
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ ...cell, fontSize: 12, color: 'var(--text-2)' }}>Wallet</th>
                <th style={{ ...cell, fontSize: 12, color: 'var(--text-2)' }}>Type</th>
                <th style={{ ...cell, fontSize: 12, color: 'var(--text-2)' }}>Token</th>
                <th style={{ ...cell, fontSize: 12, color: 'var(--text-2)' }}>USD Value</th>
                <th style={{ ...cell, fontSize: 12, color: 'var(--text-2)' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {alertTxs.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-strong)' }}>
                  <td style={{ ...cell, fontFamily: 'monospace', fontSize: 12, color: 'var(--text-2)' }}>
                    {tx.walletLabel || tx.walletAddress.slice(0, 8) + '...'}
                  </td>
                  <td style={{ ...cell }}>
                    <span style={{ color: typeColor[tx.type] || 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', fontSize: 12 }}>{tx.type}</span>
                  </td>
                  <td style={cell}>{tx.tokenSymbol}</td>
                  <td style={{ ...cell, fontWeight: 600, color: 'var(--text-1)' }}>{formatUsd(tx.usdValue)}</td>
                  <td style={{ ...cell, color: 'var(--text-3)' }}>{new Date(Number(tx.timestamp)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

