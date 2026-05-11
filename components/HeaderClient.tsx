"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LiveTxCounter from "@/components/LiveTxCounter";
import { User, LogIn, UserPlus, Shield, Menu, X } from "lucide-react";

interface HeaderClientProps {
  userId?: string;
  username?: string;
  role?: string;
}

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/tokens", label: "🔥 Heat Map" },
];

export default function HeaderClient({
  userId,
  username,
  role,
}: HeaderClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          backgroundColor: "var(--surface)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          className="header-inner"
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            height: 64,
            padding: "0 24px",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
          }}
        >
          {/* Left: Logo */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: "var(--accent)",
                  borderRadius: 4,
                }}
              />
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: "var(--text-1)",
                }}
              >
                WhalePath
              </span>
            </Link>
          </div>

          {/* Center: Live TX Counter (desktop only) */}
          <div className="hide-on-mobile">
            <LiveTxCounter />
          </div>

          {/* Right: Nav + Auth (desktop) + Burger (mobile) */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* Desktop nav */}
            <Link
              href="/tokens"
              className="mono hide-on-mobile heatmap-nav-link"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-3)",
                textDecoration: "none",
                letterSpacing: "0.06em",
                padding: "4px 8px",
                borderRadius: 4,
                border: "1px solid transparent",
                transition: "all 0.15s",
              }}
            >
              🔥 HEAT MAP
            </Link>

            {/* Desktop auth */}
            <div
              className="hide-on-mobile"
              style={{ display: "flex", gap: 12, alignItems: "center" }}
            >
              {userId ? (
                <>
                  {role === "admin" && (
                    <Link
                      href="/admin"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "var(--accent)",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      <Shield size={16} />
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 16px",
                      background: "var(--surface-2)",
                      borderRadius: 4,
                      color: "var(--text-1)",
                      textDecoration: "none",
                      border: "1px solid var(--border)",
                      fontWeight: 600,
                    }}
                  >
                    <User size={16} />
                    {username}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 16px",
                      color: "var(--text-1)",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    <LogIn size={16} />
                    Login
                  </Link>
                  <Link
                    href="/register"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 16px",
                      background: "var(--accent)",
                      color: "black",
                      borderRadius: 4,
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    <UserPlus size={16} />
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Burger button (mobile only) */}
            <button
              className="show-on-mobile"
              onClick={() => setMenuOpen((v) => !v)}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "8px",
                cursor: "pointer",
                color: "var(--text-1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 49,
            backgroundColor: "var(--bg)",
            display: "flex",
            flexDirection: "column",
            padding: "80px 24px 40px",
            overflow: "auto",
          }}
        >
          {/* Nav links */}
          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              marginBottom: 32,
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color:
                    pathname === link.href ? "var(--accent)" : "var(--text-1)",
                  textDecoration: "none",
                  padding: "14px 0",
                  borderBottom: "1px solid var(--border)",
                  transition: "color 0.15s",
                }}
              >
                {link.label}
              </Link>
            ))}
            {userId && role === "admin" && (
              <Link
                href="/admin"
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: pathname?.startsWith("/admin")
                    ? "var(--accent)"
                    : "var(--text-1)",
                  textDecoration: "none",
                  padding: "14px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                ⚙️ Admin Panel
              </Link>
            )}
          </nav>

          {/* Live counter */}
          <div style={{ marginBottom: 32 }}>
            <LiveTxCounter />
          </div>

          {/* Auth buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: "auto",
            }}
          >
            {userId ? (
              <>
                <Link
                  href="/profile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "14px",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    color: "var(--text-1)",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                >
                  <User size={18} />
                  {username}
                </Link>
                <Link
                  href="/api/auth/logout"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "14px",
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: 10,
                    color: "#ef4444",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                >
                  Logout
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "14px",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    color: "var(--text-1)",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                >
                  <LogIn size={18} />
                  Login
                </Link>
                <Link
                  href="/register"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "14px",
                    background: "var(--accent)",
                    borderRadius: 10,
                    color: "black",
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: 16,
                    border: "none",
                  }}
                >
                  <UserPlus size={18} />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
