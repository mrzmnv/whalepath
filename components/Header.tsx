import Link from "next/link";
import AuthNav from "@/app/components/AuthNav";

export default function Header() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        backgroundColor: "var(--surface)", // rgba(255, 255, 255, 0.8) replaced if dark mode
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{ 
          maxWidth: 1400, 
          margin: "0 auto", 
          height: 64, 
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center"
        }}
      >
        {/* Left: Logo */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 16, height: 16, backgroundColor: "var(--accent)", borderRadius: 4 }} />
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

        {/* Center: Live Signal */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: "6px 14px", backgroundColor: "var(--surface-3)", borderRadius: 99, border: "1px solid var(--border-strong)" }}>
          <div className="pulse-green" style={{ width: 8, height: 8, backgroundColor: "var(--green)", borderRadius: "50%", boxShadow: "0 0 8px var(--green)" }} />
          <span className="mono hide-on-mobile" style={{ fontSize: 11, color: "var(--green)", fontWeight: 700, letterSpacing: "0.05em", transform: "translateY(1px)" }}>
            LIVE SIGNAL
          </span>
        </div>

        {/* Right: Auth */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
