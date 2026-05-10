import { NextRequest, NextResponse } from "next/server";
import { fetchWalletTransactionHistory } from "@/lib/helius";
import { Transaction } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.HELIUS_API_KEY;
    const { address } = await req.json();

    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Missing wallet address" },
        { status: 400 },
      );
    }

    // Validate address format
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
      return NextResponse.json(
        { error: "Invalid Solana address" },
        { status: 400 },
      );
    }

    if (!apiKey) {
      // Return mock data for demo
      return NextResponse.json(getMockHistory(address));
    }

    // Fetch whale label from static list
    let walletLabel = address.slice(0, 8);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/whales.json`);
      if (res.ok) {
        const whales = await res.json();
        const found = whales.find(
          (w: { address: string; label: string }) => w.address === address,
        );
        if (found) walletLabel = found.label;
      }
    } catch {
      // Use fallback label
    }

    const transactions = await fetchWalletTransactionHistory(
      address,
      walletLabel,
      apiKey,
      50,
    );

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Wallet history API error:", error);
    return NextResponse.json([]);
  }
}

function getMockHistory(address: string): Transaction[] {
  const now = Date.now();
  const tokens = ["SOL", "JUP", "WIF", "BONK", "RAY", "USDC", "PYTH"];
  const types: Array<"buy" | "sell" | "transfer"> = ["buy", "sell", "transfer"];

  return Array.from({ length: 20 }, (_, i) => {
    const token = tokens[i % tokens.length];
    const type = types[i % types.length];
    const usdValue = Math.random() * 2_000_000 + 10_000;

    return {
      signature: `mock_history_${address.slice(0, 6)}_${i}`,
      timestamp: now - i * 3 * 60 * 60 * 1000, // every 3 hours
      walletAddress: address,
      walletLabel: truncateAddr(address),
      type,
      tokenSymbol: token,
      tokenName: token,
      amount: Math.random() * 100_000,
      usdValue,
      isAlert: usdValue >= 500_000,
      source: "preloaded" as const,
    };
  });
}

function truncateAddr(addr: string): string {
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}
