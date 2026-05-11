import Link from "next/link";

function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "28px 24px",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 24 }}>{icon}</span>
        <h2
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "var(--text-1)",
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Step({ n, text, sub }: { n: number; text: string; sub?: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        marginBottom: 14,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          backgroundColor: "var(--accent)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {n}
      </div>
      <div>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-1)",
            fontWeight: 600,
            margin: 0,
          }}
        >
          {text}
        </p>
        {sub && (
          <p
            style={{ fontSize: 13, color: "var(--text-3)", margin: "4px 0 0" }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function Tag({
  color,
  label,
  desc,
}: {
  color: string;
  label: string;
  desc: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
      }}
    >
      <span
        style={{
          padding: "3px 12px",
          borderRadius: 99,
          fontSize: 12,
          fontWeight: 700,
          backgroundColor: color + "22",
          color: color,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 13, color: "var(--text-2)" }}>{desc}</span>
    </div>
  );
}

export default function GuidePage() {
  return (
    <main
      style={{ maxWidth: 780, margin: "0 auto", padding: "40px 16px 64px" }}
    >
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <Link
          href="/"
          style={{
            color: "var(--text-3)",
            textDecoration: "none",
            fontSize: 13,
            display: "inline-block",
            marginBottom: 20,
          }}
        >
          ← Back
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: "var(--accent-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            🐋
          </div>
          <div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "var(--text-1)",
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              WhalePath — How It Works
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-3)",
                margin: "4px 0 0",
              }}
            >
              Track large on-chain capital moves on Solana in real time
            </p>
          </div>
        </div>
      </div>

      {/* 1. What is WhalePath */}
      <Section icon="🔭" title="What is WhalePath?">
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            lineHeight: 1.7,
            marginBottom: 12,
          }}
        >
          WhalePath is a real-time on-chain analytics platform for Solana. It
          tracks wallets that move large amounts of capital — known as
          "whales" — and surfaces their transactions as they happen.
        </p>
        <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>
          Built for:
        </p>
        <ul
          style={{
            paddingLeft: 20,
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {[
            "Traders — get ahead of big moves before the market reacts",
            "Researchers — analyze on-chain behavior and wallet patterns",
            "Portfolio watchers — monitor your own wallets alongside top whales",
          ].map((t) => (
            <li key={t} style={{ fontSize: 14, color: "var(--text-2)" }}>
              {t}
            </li>
          ))}
        </ul>
      </Section>

      {/* 2. Dashboard */}
      <Section icon="📊" title="Dashboard">
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            lineHeight: 1.7,
            marginBottom: 16,
          }}
        >
          The dashboard has two panels:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 8,
              backgroundColor: "var(--surface-2)",
              border: "1px solid var(--border)",
            }}
          >
            <p
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "var(--text-1)",
                marginBottom: 4,
              }}
            >
              📡 Live Feed (left panel)
            </p>
            <p
              style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.6 }}
            >
              Shows the latest transactions from tracked whale wallets. Updates
              every 15 minutes on Free, every 1 minute on Pro/Enterprise. Use
              the USD range filter to show only transactions above a certain
              threshold ($50–$5K, $5K–$50K, $50K+, etc.).
            </p>
          </div>
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 8,
              backgroundColor: "var(--surface-2)",
              border: "1px solid var(--border)",
            }}
          >
            <p
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "var(--text-1)",
                marginBottom: 4,
              }}
            >
              🐳 Whale List (right panel)
            </p>
            <p
              style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.6 }}
            >
              All wallets currently tracked by WhalePath. Click any whale to
              open its detail page. Hit ★ to add it to your favorites (requires
              login).
            </p>
          </div>
        </div>
      </Section>

      {/* 3. Transaction tags */}
      <Section icon="🏷️" title="Transaction Tags">
        <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 14 }}>
          Each transaction card shows a colored tag:
        </p>
        <Tag color="#2a9d8f" label="BUY" desc="Token purchased — bullish signal" />
        <Tag color="#d62828" label="SELL" desc="Token sold — bearish signal" />
        <Tag color="#e9c46a" label="SWAP" desc="Token exchanged for another token" />
        <Tag color="#e76f51" label="TRANSFER" desc="Wallet-to-wallet transfer" />
        <Tag color="#e9c46a" label="⚡ ALERT" desc="Transaction exceeds $100K — high priority" />
        <p
          style={{
            fontSize: 13,
            color: "var(--text-3)",
            marginTop: 8,
            lineHeight: 1.6,
          }}
        >
          Click any transaction card to open the full details on Solscan.
        </p>
      </Section>

      {/* 4. Whale detail */}
      <Section icon="🔍" title="Whale Detail Page">
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            lineHeight: 1.7,
            marginBottom: 16,
          }}
        >
          Click any whale to open its detail page. You'll see:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["Total Volume", "Total USD traded in the selected period"],
            ["PNL", "Estimated 7-day profit/loss"],
            ["Win Rate", "Buy/sell ratio — how often the whale is on the right side"],
            ["Big Alerts", "Number of transactions that crossed $100K"],
            ["24h Chart", "Hourly volume breakdown for the last 24 hours"],
            ["History", "Last 20 transactions with full detail"],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                gap: 12,
                padding: "10px 14px",
                backgroundColor: "var(--surface-2)",
                borderRadius: 8,
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--accent)",
                  whiteSpace: "nowrap",
                  minWidth: 110,
                }}
              >
                {k}
              </span>
              <span style={{ fontSize: 13, color: "var(--text-2)" }}>{v}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* 5. Account */}
      <Section icon="👤" title="Account & Profile">
        <Step
          n={1}
          text="Register"
          sub="Pick a username (3–20 alphanumeric chars) and a password (min 8 chars, uppercase + number required)"
        />
        <Step
          n={2}
          text="Log in"
          sub="Your profile and favorites become active after login"
        />
        <Step
          n={3}
          text="Open your profile"
          sub="Click your username in the top-right corner. On mobile: burger menu → Profile"
        />
        <Step
          n={4}
          text="Add your own wallets"
          sub="In the 'Track Your Own Wallets' section, paste any Solana address to monitor it alongside whales"
        />
        <Step
          n={5}
          text="Save favorite whales"
          sub="Hit ★ on any whale in the dashboard — access them instantly from your profile"
        />
      </Section>

      {/* 6. Add Wallet */}
      <Section icon="➕" title="Adding a Wallet">
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            lineHeight: 1.7,
            marginBottom: 12,
          }}
        >
          Click <strong>"+ Add Wallet"</strong> in the right panel of the
          dashboard. Paste a valid Solana address (32–44 Base58 characters).
        </p>
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            backgroundColor: "var(--amber-bg)",
            border: "1px solid var(--amber)",
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "var(--text-2)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            ⚠️ <strong>Note:</strong> Adding wallets requires login. If you're
            not logged in, the login modal will open. If you've hit your plan
            limit, an upgrade prompt will appear instead.
          </p>
        </div>
      </Section>

      {/* 7. Heat Map */}
      <Section icon="🔥" title="Token Heat Map">
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            lineHeight: 1.7,
            marginBottom: 12,
          }}
        >
          The <strong>🔥 Heat Map</strong> page shows which tokens are seeing
          the most whale activity in the last 24 hours.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["Ranking", "Tokens sorted by total USD volume — highest on top"],
            ["Color intensity", "Darker = higher activity"],
            ["Wallet count", "How many tracked whales touched this token"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 8, fontSize: 13 }}>
              <span
                style={{
                  fontWeight: 700,
                  color: "var(--accent)",
                  minWidth: 120,
                }}
              >
                {k}
              </span>
              <span style={{ color: "var(--text-2)" }}>{v}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* 8. Plans */}
      <Section icon="💎" title="Plans">
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            lineHeight: 1.7,
            marginBottom: 14,
          }}
        >
          WhalePath has three tiers:
        </p>
        {[
          {
            name: "Free",
            price: "$0",
            color: "var(--text-2)",
            features: ["Up to 5 wallets", "Live feed (15 min)", "Whale detail pages"],
          },
          {
            name: "Pro",
            price: "$9/mo",
            color: "var(--accent)",
            features: ["Up to 25 wallets", "1-min live feed", "All Free features"],
          },
          {
            name: "Enterprise",
            price: "$19/mo",
            color: "#f4a261",
            features: ["Unlimited wallets", "1-min live feed", "Telegram alerts (soon)", "All Pro features"],
          },
        ].map((p) => (
          <div
            key={p.name}
            style={{
              padding: "14px 16px",
              borderRadius: 8,
              backgroundColor: "var(--surface-2)",
              border: "1px solid var(--border)",
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <span style={{ fontWeight: 700, color: p.color, fontSize: 15 }}>
                {p.name}
              </span>
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 13,
                  color: "var(--text-3)",
                }}
              >
                {p.price}
              </span>
              <div
                style={{
                  marginTop: 6,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                {p.features.map((f) => (
                  <span
                    key={f}
                    style={{
                      fontSize: 12,
                      color: "var(--text-2)",
                      backgroundColor: "var(--surface-3)",
                      padding: "2px 10px",
                      borderRadius: 99,
                    }}
                  >
                    ✓ {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 8 }}>
          To change your plan, visit{" "}
          <Link
            href="/plans"
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            /plans
          </Link>
          .
        </p>
      </Section>

      {/* 9. FAQ */}
      <Section icon="❓" title="FAQ">
        {[
          {
            q: "How often does the live feed update?",
            a: "Free plan: every 15 minutes. Pro & Enterprise: every 1 minute — near real-time.",
          },
          {
            q: "Where does the whale list come from?",
            a: "Wallets are manually curated by the WhalePath team — only addresses with a verified track record of large on-chain moves are included.",
          },
          {
            q: "What's the difference between a Favorite and a Personal wallet?",
            a: "Favorite = you follow a WhalePath-tracked whale. Personal = you add your own Solana wallet to monitor your own activity.",
          },
          {
            q: "Can I track any wallet, not just listed whales?",
            a: "Yes. Use '+ Add Wallet' on the dashboard to track any Solana address. The number of wallets you can track depends on your plan.",
          },
          {
            q: "What do the transaction tags mean?",
            a: "BUY / SELL = token bought or sold. SWAP = exchanged for another token. TRANSFER = moved between wallets. ⚡ ALERT = over $100K.",
          },
        ].map(({ q, a }) => (
          <div
            key={q}
            style={{
              borderBottom: "1px solid var(--border)",
              paddingBottom: 14,
              marginBottom: 14,
            }}
          >
            <p
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "var(--text-1)",
                marginBottom: 4,
              }}
            >
              {q}
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-3)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {a}
            </p>
          </div>
        ))}
      </Section>

      {/* Footer CTA */}
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 32px",
            backgroundColor: "var(--accent)",
            color: "#fff",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          Go to Dashboard →
        </Link>
      </div>
    </main>
  );
}
