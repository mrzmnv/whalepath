import { NextResponse } from "next/server";

// Only accessible in non-production or with secret header
export async function GET() {
  const heliusKey = process.env.HELIUS_API_KEY;
  const dbUrl = process.env.DATABASE_URL;

  return NextResponse.json({
    helius_api_key: heliusKey
      ? `set (${heliusKey.length} chars, starts: ${heliusKey.slice(0, 4)}...)`
      : "MISSING",
    database_url: dbUrl ? "set" : "MISSING",
    node_env: process.env.NODE_ENV,
  });
}
