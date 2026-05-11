import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.HELIUS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "HELIUS_API_KEY not set" }, { status: 500 });
  }

  // Test with a known active Solana wallet (Raydium AMM)
  const testAddress = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";
  const url = `https://api-mainnet.helius-rpc.com/v0/addresses/${testAddress}/transactions?api-key=${apiKey}&limit=3`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const status = res.status;
    const text = await res.text();

    let parsed: unknown = null;
    try { parsed = JSON.parse(text); } catch { parsed = text; }

    return NextResponse.json({
      helius_status: status,
      helius_ok: res.ok,
      api_key_prefix: apiKey.slice(0, 8),
      result_preview: Array.isArray(parsed)
        ? `${parsed.length} transactions`
        : parsed,
    });
  } catch (e) {
    return NextResponse.json({
      error: "fetch threw exception",
      message: (e as Error).message,
    }, { status: 500 });
  }
}
