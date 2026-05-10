import Link from "next/link";
import AuthNav from "@/app/components/AuthNav";

export default function Header() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="mx-auto flex items-center justify-between mobile-px"
        style={{ maxWidth: 1400, height: 56, padding: "0 24px" }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 14, height: 14, backgroundColor: "var(--accent)", borderRadius: 3 }} />
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: "var(--text-1)",
            }}
          >
            WhalePath
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="pulse-green" style={{ width: 6, height: 6, backgroundColor: "var(--green)", borderRadius: "50%" }} />
            <span className="mono hide-on-mobile" style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500 }}>
              Updates every 60s
            </span>
          </div>
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
