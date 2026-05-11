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
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, padding: "6px 20px", backgroundColor: "rgba(0, 255, 128, 0.03)", borderRadius: 99, border: "1px solid rgba(0, 255, 128, 0.15)", backdropFilter: "blur(4px)" }}>
          <div style={{ position: 'relative', width: 10, height: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Core dot */}
            <div style={{ width: 6, height: 6, backgroundColor: "var(--green)", borderRadius: "50%", zIndex: 2, boxShadow: "0 0 10px var(--green)" }} />
            {/* Ripples */}
            <div className="sonar-wave" style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: "50%", zIndex: 1 }} />
            <div className="sonar-wave" style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: "50%", zIndex: 1, animationDelay: '0.75s' }} />
          </div>
          <span className="mono hide-on-mobile text-glow" style={{ fontSize: 11, color: "var(--green)", fontWeight: 800, letterSpacing: "0.15em", transform: "translateY(1px)" }}>
            WHALE SONAR
          </span>
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
