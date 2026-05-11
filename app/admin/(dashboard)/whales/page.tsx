import prisma from "@/lib/db";
import {
  addWhale,
  deleteWhale,
  bulkAddWhales,
} from "../../actions/whale";
import Link from "next/link";
import WhaleActionButtons from "./WhaleActionButtons";

export const revalidate = 0;

export default async function AdminWhales() {
  let whales: Awaited<ReturnType<typeof prisma.whale.findMany>> = [];
  let fetchError: string | null = null;

  try {
    whales = await prisma.whale.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (e: any) {
    fetchError = e?.message ?? String(e);
  }

  if (fetchError) {
    return (
      <div style={{ padding: 32 }}>
        <h1 style={{ color: "var(--red)", marginBottom: 16 }}>⚠ Database Error</h1>
        <pre style={{ backgroundColor: "var(--surface-2)", padding: 20, borderRadius: 8, color: "var(--red)", fontSize: 13, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {fetchError}
        </pre>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--text-1)",
            margin: 0,
          }}
        >
          Manage Tracked Whales
        </h1>
        <WhaleActionButtons />
      </div>

      <div
        style={{
          backgroundColor: "var(--surface-2)",
          padding: 24,
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          marginBottom: 32,
        }}
      >
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text-1)",
            marginBottom: 16,
          }}
        >
          Add New Whale
        </h3>
        <form
          action={addWhale}
          style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
        >
          <input
            name="address"
            placeholder="Solana Address"
            required
            style={{
              flex: "1 1 300px",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid var(--border-strong)",
              fontSize: 14,
            }}
            className="mono"
          />
          <input
            name="label"
            placeholder="Display Label (e.g. Binance Hot Wallet)"
            required
            style={{
              flex: "1 1 200px",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid var(--border-strong)",
              fontSize: 14,
            }}
          />
          <select
            name="category"
            style={{
              flex: "1 1 150px",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid var(--border-strong)",
              fontSize: 14,
              backgroundColor: "var(--bg)",
            }}
          >
            <option value="">Select Category</option>
            <option value="DEX">DEX</option>
            <option value="CEX">CEX</option>
            <option value="Whale">Whale</option>
            <option value="Fund">Fund/VC</option>
            <option value="Bot">Bot/MEV</option>
          </select>
          <input
            name="tags"
            placeholder="Tags (e.g. solana, memecoin, holder)"
            style={{
              flex: "1 1 150px",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid var(--border-strong)",
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: "var(--accent)",
              color: "white",
              padding: "10px 24px",
              borderRadius: 8,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            Add Whale
          </button>
        </form>
      </div>

      {/* Bulk Import */}
      <div
        style={{
          backgroundColor: "var(--surface-2)",
          padding: 24,
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          marginBottom: 32,
        }}
      >
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text-1)",
            marginBottom: 8,
          }}
        >
          Bulk Import
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 16 }}>
          One entry per line. Supports both formats:{" "}
          <code style={{ backgroundColor: "var(--surface-3)", padding: "2px 6px", borderRadius: 4 }}>ADDRESS Label</code>{" "}
          or Solscan style{" "}
          <code style={{ backgroundColor: "var(--surface-3)", padding: "2px 6px", borderRadius: 4 }}>Label Name ADDRESS</code>{" "}
          — the Solana address is auto-detected.
        </p>
        <form
          action={bulkAddWhales}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <textarea
            name="bulk"
            rows={8}
            required
            placeholder={
              "5xG...abc Binance Hot Wallet\n7kP...xyz,Alameda Research\nDez...mnp"
            }
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid var(--border-strong)",
              fontSize: 13,
              fontFamily: "monospace",
              backgroundColor: "var(--bg)",
              color: "var(--text-1)",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <select
              name="category"
              style={{
                flex: "1 1 150px",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid var(--border-strong)",
                fontSize: 14,
                backgroundColor: "var(--bg)",
              }}
            >
              <option value="">Select Category</option>
              <option value="DEX">DEX</option>
              <option value="CEX">CEX</option>
              <option value="Whale">Whale</option>
              <option value="Fund">Fund/VC</option>
              <option value="Bot">Bot/MEV</option>
            </select>
            <input
              name="tags"
              placeholder="Tags (e.g. solana, memecoin)"
              style={{
                flex: "2 1 200px",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid var(--border-strong)",
                fontSize: 14,
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: "var(--accent)",
                color: "white",
                padding: "10px 24px",
                borderRadius: 8,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Import All
            </button>
          </div>
        </form>
      </div>

      <div
        style={{
          backgroundColor: "var(--surface)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "var(--surface-2)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <th
                style={{
                  padding: "12px 16px",
                  fontSize: 12,
                  color: "var(--text-2)",
                }}
              >
                Label
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  fontSize: 12,
                  color: "var(--text-2)",
                }}
              >
                Address
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  fontSize: 12,
                  color: "var(--text-2)",
                }}
              >
                Category
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  fontSize: 12,
                  color: "var(--text-2)",
                  textAlign: "right",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {whales.map((w) => (
              <tr
                key={w.id}
                style={{ borderBottom: "1px solid var(--border-strong)" }}
              >
                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {w.label}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 13,
                    color: "var(--text-2)",
                  }}
                  className="mono"
                >
                  {w.address}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 14,
                    color: "var(--text-2)",
                  }}
                >
                  {w.category || "-"}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <form action={deleteWhale}>
                    <input type="hidden" name="address" value={w.address} />
                    <Link
                      href={`/admin/whales/${w.id}`}
                      style={{
                        display: "inline-block",
                        marginRight: 8,
                        color: "var(--accent)",
                        textDecoration: "none",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Edit
                    </Link>
                    <button
                      type="submit"
                      style={{
                        color: "var(--red)",
                        background: "var(--red-bg)",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
