import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: 260, backgroundColor: 'var(--surface-2)', borderRight: '1px solid var(--border)', padding: 24, display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{color: 'var(--accent)'}}>🐳</span> WhalePath Admin
        </h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link href="/admin" style={{ textDecoration: 'none', color: 'var(--text-2)', fontWeight: 600, padding: '8px 12px', borderRadius: 8, transition: 'background-color 0.2s' }}>
            Dashboard
          </Link>
          <Link href="/admin/whales" style={{ textDecoration: 'none', color: 'var(--text-2)', fontWeight: 600, padding: '8px 12px', borderRadius: 8, transition: 'background-color 0.2s' }}>
            Manage Whales
          </Link>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-3)', fontWeight: 600, padding: '8px 12px', borderRadius: 8, marginTop: 'auto' }}>
            ← Back to App
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
