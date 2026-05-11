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
          ← Geri
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
              WhalePath — Necə İstifadə Etmək
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-3)",
                margin: "4px 0 0",
              }}
            >
              Solana-da böyük kapital hərəkətlərini real-vaxtda izləyin
            </p>
          </div>
        </div>
      </div>

      {/* 1. Platform nədir */}
      <Section icon="🔭" title="WhalePath nədir?">
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            lineHeight: 1.7,
            marginBottom: 12,
          }}
        >
          WhalePath — Solana blockchain-ində böyük kapital hərəkəti edən
          "balina" adlandırılan cüzdanları real-vaxtda izləyən analitik
          platformdur. Bir balina böyük həcmli token alıb-satdıqda siz bunu
          dərhal görürsünüz.
        </p>
        <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>
          Platform aşağıdakı istifadəçilər üçün nəzərdə tutulub:
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
            "Kripto trader-lər — böyük oyunçuların hərəkətindən əvvəl mövqe almaq üçün",
            "Araşdırmacılar — on-chain data analizi üçün",
            "Portfel izləyicilər — öz və ya izlədikləri cüzdanları nəzarətdə saxlamaq üçün",
          ].map((t) => (
            <li key={t} style={{ fontSize: 14, color: "var(--text-2)" }}>
              {t}
            </li>
          ))}
        </ul>
      </Section>

      {/* 2. Dashboard */}
      <Section icon="📊" title="Ana Səhifə (Dashboard)">
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            lineHeight: 1.7,
            marginBottom: 16,
          }}
        >
          Ana səhifə iki hissədən ibarətdir:
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
              📡 Canlı Lent (Sol panel)
            </p>
            <p
              style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.6 }}
            >
              İzlənilən balinaların son əməliyyatları burada göstərilir. Hər 15
              dəqiqədə avtomatik yenilənir. USD filtrindən istifadə edərək
              yalnız müəyyən həcmli əməliyyatları görə bilərsiniz ($50–$5K,
              $5K–$50K, $50K+ və s.).
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
              🐳 Balina Siyahısı (Sağ panel)
            </p>
            <p
              style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.6 }}
            >
              Sistemdə qeydiyyatda olan bütün izlənilən balinaların siyahısı. ★
              düyməsi ilə öz seçkilərinizə əlavə edə bilərsiniz (giriş tələb
              olunur). Hər balinaya toxunaraq detaylı səhifəsinə keçə
              bilərsiniz.
            </p>
          </div>
        </div>
      </Section>

      {/* 3. İşarələr */}
      <Section icon="🏷️" title="Əməliyyat İşarələri">
        <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 14 }}>
          Hər əməliyyat kartında rəngli işarələr var:
        </p>
        <Tag color="#2a9d8f" label="BUY" desc="Token alınıb — bullish signal" />
        <Tag
          color="#d62828"
          label="SELL"
          desc="Token satılıb — bearish signal"
        />
        <Tag
          color="#e9c46a"
          label="SWAP"
          desc="Token dəyişdirilir (token A → token B)"
        />
        <Tag color="#e76f51" label="TRANSFER" desc="Cüzdanlar arası köçürmə" />
        <Tag
          color="#e9c46a"
          label="⚡ ALERT"
          desc="$100K+ həcmli böyük hərəkət — xüsusi diqqət"
        />
        <p
          style={{
            fontSize: 13,
            color: "var(--text-3)",
            marginTop: 8,
            lineHeight: 1.6,
          }}
        >
          Əməliyyat kartına toxunaraq Solscan-da tam detalları görə bilərsiniz.
        </p>
      </Section>

      {/* 4. Balina detayı */}
      <Section icon="🔍" title="Balina Detay Səhifəsi">
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            lineHeight: 1.7,
            marginBottom: 16,
          }}
        >
          Hər balinaya kliklədikdə onun detay səhifəsi açılır. Burada:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["Cəmi həcm", "Seçilmiş dövrdəki ümumi USD dövriyyəsi"],
            ["Qazanc (PNL)", "Təxmini 7 günlük qazanc hesablaması"],
            ["Qazanma faizi", "Alış/satış nisbətinə əsaslanan uğur dərəcəsi"],
            ["Böyük alertlər", "$100K+ keçən əməliyyatların sayı"],
            ["24s qrafik", "Son 24 saatda saatlıq həcm diaqramı"],
            ["Tarixçə", "Son 20 əməliyyatın tam siyahısı"],
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

      {/* 5. Hesab */}
      <Section icon="👤" title="Hesab Açmaq və Profil">
        <Step
          n={1}
          text="Register — Yeni hesab yaradın"
          sub="Username (3-20 hərf/rəqəm), şifrə (min 8, böyük hərf + rəqəm tələb olunur)"
        />
        <Step
          n={2}
          text="Login — Giriş edin"
          sub="Giriş etdikdən sonra profil səhifəniz aktivləşir"
        />
        <Step
          n={3}
          text="Profil səhifəsini açın"
          sub="Yuxarı sağ küncdən adınıza klikləyin (mobil: burger menü → profil düyməsi)"
        />
        <Step
          n={4}
          text="Öz cüzdanlarınızı əlavə edin"
          sub="'Track Your Own Wallets' bölməsindən Solana ünvanınızı daxil edin — aktivliyinizi izləyin"
        />
        <Step
          n={5}
          text="Seçki balinaları izləyin"
          sub="Dashboard-da ★ düyməsi ilə balinanı seçkilərə əlavə edin — profil səhifəsindən görə bilərsiniz"
        />
      </Section>

      {/* 6. ADD WALLET */}
      <Section icon="➕" title="Öz Cüzdanınızı Əlavə Etmək">
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            lineHeight: 1.7,
            marginBottom: 12,
          }}
        >
          Dashboard-da sağ paneldə <strong>"+ Add Wallet"</strong> düyməsinə
          klikləyin. Solana cüzdan ünvanınızı (32-44 simvol, Base58) daxil edin.
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
            ⚠️ <strong>Qeyd:</strong> ADD WALLET funksiyası yalnız giriş etmiş
            istifadəçilər üçün aktivdir. Giriş etmədən bu düyməyə basan kimi
            login modal açılır. Plan limitinizə çatdıqda isə Upgrade modal
            göstərilir.
          </p>
        </div>
      </Section>

      {/* 7. 🔥 Heat Map */}
      <Section icon="🔥" title="Token Heat Map">
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            lineHeight: 1.7,
            marginBottom: 12,
          }}
        >
          <strong>Heat Map</strong> səhifəsi (yuxarı menüdə "🔥 Heat Map") son
          24 saatda ən çox aktivlik göstərən tokenləri vizual olaraq göstərir.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            [
              "Sıra",
              "Token həcminə görə sıralanır — ən yuxarıdakı ən aktivdir",
            ],
            ["Rəng intensivliyi", "Daha tünd rəng = daha yüksək dövriyyə"],
            ["Cüzdan sayı", "Həmin tokeni neçə balina alıb/satıb"],
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

      {/* 8. Planlar */}
      <Section icon="💎" title="Planlar">
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            lineHeight: 1.7,
            marginBottom: 14,
          }}
        >
          WhalePath üç planda mövcuddur:
        </p>
        {[
          {
            name: "Free",
            price: "$0",
            color: "var(--text-2)",
            features: [
              "5 wallet izlənə bilər",
              "Canlı lent",
              "Balina detayları",
            ],
          },
          {
            name: "Pro",
            price: "$9/ay",
            color: "var(--accent)",
            features: [
              "25 wallet izlənə bilər",
              "Bütün Free xüsusiyyətlər",
              "Priority data",
            ],
          },
          {
            name: "Enterprise",
            price: "$19/ay",
            color: "#f4a261",
            features: [
              "Limitsiz wallet",
              "Telegram alertlər (tezliklə)",
              "Bütün Pro xüsusiyyətlər",
            ],
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
          Plan dəyişikliyi üçün{" "}
          <Link
            href="/plans"
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            /plans
          </Link>{" "}
          səhifəsinə keçin.
        </p>
      </Section>

      {/* 9. FAQ */}
      <Section icon="❓" title="FAQ">
        {[
          {
            q: "How often does the live feed update?",
            a: "Free plan: every 15 minutes. Pro & Enterprise plans: every 1 minute — near real-time whale tracking.",
          },
          {
            q: "Where does the whale list come from?",
            a: "Wallets are manually curated by the WhalePath team — only addresses with a verified history of large on-chain moves are added.",
          },
          {
            q: "What's the difference between Favorite and Personal wallet?",
            a: "'Favorite' — you follow a whale wallet that WhalePath tracks. 'Personal' — you add your own Solana wallet to monitor your own activity.",
          },
          {
            q: "Can I track any Solana wallet, not just listed whales?",
            a: "Yes. Use 'Add Wallet' from the dashboard to track any Solana address. Your plan determines how many you can add simultaneously.",
          },
          {
            q: "What do the transaction tags mean?",
            a: "BUY / SELL = token purchased or sold. SWAP = token exchanged for another. TRANSFER = wallet-to-wallet move. ⚡ ALERT = transaction exceeds $100K.",
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
          Dashboard-a qayıt →
        </Link>
      </div>
    </main>
  );
}
