import Link from "next/link";
import AuthNav from "@/app/components/AuthNav";
import LiveTxCounter from "@/components/LiveTxCounter";

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

        {/* Center: Live TX Counter */}
        <div className="hide-on-mobile">
          <LiveTxCounter />
        </div>

        {/* Right: Auth */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
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
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
