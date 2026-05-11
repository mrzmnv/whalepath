export default function SettingsAdminPage() {
  const envVars = [
    { key: 'DATABASE_URL', desc: 'PostgreSQL connection string' },
    { key: 'SESSION_SECRET', desc: 'JWT signing secret (min 32 chars)' },
    { key: 'HELIUS_API_KEY', desc: 'Helius API key for Solana data' },
    { key: 'SIGNAL_API_KEY', desc: 'Signal analysis API key' },
  ];

  const row = (label: string, value: string, ok: boolean) => (
    <tr key={label} style={{ borderBottom: '1px solid var(--border-strong)' }}>
      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 13 }}>{label}</td>
      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-3)' }}>{value}</td>
      <td style={{ padding: '12px 16px' }}>
        <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
          backgroundColor: ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          color: ok ? '#22c55e' : '#ef4444' }}>
          {ok ? 'Set' : 'Missing'}
        </span>
      </td>
    </tr>
  );

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>System Settings</h1>
      <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 24 }}>Environment variable status. Edit values in your deployment environment (Coolify).</p>

      <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 32 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-2)' }}>Variable</th>
              <th style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-2)' }}>Description</th>
              <th style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-2)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {envVars.map(v => row(v.key, v.desc, !!process.env[v.key]))}
          </tbody>
        </table>
      </div>

      <div style={{ backgroundColor: 'var(--surface-2)', padding: 24, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }}>Deployment Info</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { label: 'Node ENV', value: process.env.NODE_ENV || 'development' },
            { label: 'Next.js', value: '15+' },
            { label: 'Database', value: 'PostgreSQL (Prisma)' },
            { label: 'Auth', value: 'JWT (jose)' },
          ].map(item => (
            <div key={item.label} style={{ backgroundColor: 'var(--surface)', padding: 16, borderRadius: 8, border: '1px solid var(--border-strong)' }}>
              <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{item.label}</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

