"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Activity, 
  Settings, 
  UserCircle, 
  ArrowLeft 
} from "lucide-react";
import LogoutButton from './LogoutButton';

const links = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/whales", icon: Wallet, label: "Manage Whales" },
  { href: "/admin/users", icon: Users, label: "User Management" },
  { href: "/admin/alerts", icon: Activity, label: "System Alerts" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: 280, 
        backgroundColor: 'var(--surface)', 
        borderRight: '1px solid var(--border)', 
        padding: "24px 16px", 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 10, padding: "0 12px" }}>
          <div style={{ width: 14, height: 14, backgroundColor: "var(--accent)", borderRadius: 3 }} />
          WhalePath <span style={{ color: "var(--text-3)", fontWeight: 400 }}>Admin</span>
        </h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <p className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8, padding: "0 12px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Main Menu</p>
          
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                style={{ 
                  textDecoration: 'none', 
                  color: active ? 'var(--accent)' : 'var(--text-2)', 
                  fontWeight: 600, 
                  fontSize: 14,
                  padding: '10px 12px', 
                  borderRadius: 8, 
                  backgroundColor: active ? 'var(--surface-3)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = "var(--surface-2)"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            )
          })}

          <div style={{ marginTop: "auto" }}>
            <div style={{ borderTop: "1px dashed var(--border)", margin: "16px 0" }} />
            
            <Link 
              href="/admin/profile" 
              style={{ 
                textDecoration: 'none', 
                color: pathname === '/admin/profile' ? 'var(--accent)' : 'var(--text-2)', 
                fontWeight: 600, 
                fontSize: 14,
                padding: '10px 12px', 
                borderRadius: 8, 
                backgroundColor: pathname === '/admin/profile' ? 'var(--surface-3)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 4,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { if (pathname !== '/admin/profile') e.currentTarget.style.backgroundColor = "var(--surface-2)"; }}
              onMouseLeave={(e) => { if (pathname !== '/admin/profile') e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <UserCircle size={18} />
              Admin Profile
            </Link>

            <Link 
              href="/" 
              style={{ 
                textDecoration: 'none', 
                color: 'var(--text-3)', 
                fontWeight: 600, 
                fontSize: 14,
                padding: '10px 12px', 
                borderRadius: 8, 
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.2s ease',
                marginBottom: 8
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-1)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>
            
            <div style={{ padding: "0 12px" }}>
              <LogoutButton />
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "40px 48px", overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
