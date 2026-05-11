import Link from "next/link";
import { PLANS } from "@/lib/plans";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8l3.5 3.5L13 4.5" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4l8 8M12 4l-8 8" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function PlansPage() {
  const plans = [PLANS.free, PLANS.pro, PLANS.enterprise];

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <Link
          href="/"
          style={{ color: "var(--text-3)", textDecoration: "none", fontSize: 13, display: "inline-block", marginBottom: 24 }}
        >
          ← Back
        </Link>
        <h1
          className="mono"
          style={{ fontSize: 28, fontWeight: 700, color: "var(--text-1)", letterSpacing: "0.04em", margin: 0 }}
        >
          PLANS
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: 12, fontSize: 15 }}>
          Track whale wallets and detect large on-chain moves
        </p>
      </div>

      {/* Plan cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 24,
        }}
      >
        {plans.map((plan) => {
          const isPopular = plan.id === "pro";
          const isEnterprise = plan.id === "enterprise";
          return (
            <div
              key={plan.id}
              style={{
                backgroundColor: "var(--surface)",
                border: `1px solid ${isPopular ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "var(--radius)",
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                position: "relative",
                boxShadow: isPopular ? "0 0 0 1px var(--accent), var(--shadow)" : "var(--shadow)",
              }}
            >
              {isPopular && (
                <div
                  className="mono"
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "var(--accent)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "3px 12px",
                    borderRadius: 20,
                    letterSpacing: "0.08em",
                    whiteSpace: "nowrap",
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              {/* Plan name + price */}
              <div>
                <p
                  className="mono"
                  style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.1em", marginBottom: 6 }}
                >
                  {plan.name.toUpperCase()}
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, color: "var(--text-1)" }}>
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span style={{ fontSize: 13, color: "var(--text-3)" }}>/mo</span>
                  )}
                </div>
              </div>

              {/* Limit highlight */}
              <div
                style={{
                  backgroundColor: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 22, fontWeight: 700, color: isEnterprise ? "var(--accent)" : "var(--text-1)" }}>
                  {plan.watchlistLimit === Infinity ? "∞" : plan.watchlistLimit}
                </span>
                <span style={{ fontSize: 13, color: "var(--text-2)" }}>wallet watchlist</span>
              </div>

              {/* Features */}
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckIcon />
                    <span style={{ fontSize: 13, color: "var(--text-2)" }}>{f}</span>
                  </li>
                ))}
                {!plan.telegramAlerts && (
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <XIcon />
                    <span style={{ fontSize: 13, color: "var(--text-3)" }}>Telegram alerts</span>
                  </li>
                )}
              </ul>

              {/* CTA */}
              <div style={{ marginTop: "auto" }}>
                {plan.id === "free" ? (
                  <Link
                    href="/register"
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "10px 0",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      color: "var(--text-2)",
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Get started free
                  </Link>
                ) : (
                  <a
                    href="mailto:contact@whalepath.online"
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "10px 0",
                      borderRadius: 8,
                      backgroundColor: isPopular ? "var(--accent)" : "var(--surface-3)",
                      border: `1px solid ${isPopular ? "var(--accent)" : "var(--border)"}`,
                      color: isPopular ? "#fff" : "var(--text-1)",
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Contact to upgrade
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ note */}
      <p style={{ textAlign: "center", color: "var(--text-3)", fontSize: 13, marginTop: 40 }}>
        To upgrade your plan, contact{" "}
        <a href="mailto:contact@whalepath.online" style={{ color: "var(--accent)" }}>
          contact@whalepath.online
        </a>
      </p>
    </main>
  );
}
