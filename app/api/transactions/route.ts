import { NextRequest, NextResponse } from "next/server";
import { fetchWalletTransactions } from "@/lib/helius";
import { Transaction } from "@/lib/types";
import prisma from "@/lib/db";

interface WalletInput {
  address: string;
  label: string;
  source: "preloaded" | "watchlist";
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.HELIUS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        transactions: getMockTransactions(),
        demo: true,
      });
    }

    const { wallets } = (await req.json()) as { wallets: WalletInput[] };

    if (!Array.isArray(wallets) || wallets.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch all wallets in parallel batches of 20 to avoid rate limits
    const BATCH = 20;
    const allTxs: Transaction[] = [];
    for (let i = 0; i < wallets.length; i += BATCH) {
      const batch = wallets.slice(i, i + BATCH);
      const batchResults = await Promise.allSettled(
        batch.map((w) => fetchWalletTransactions(w.address, w.label, w.source, apiKey)),
      );
      batchResults.forEach((r) => {
        if (r.status === "fulfilled") allTxs.push(...r.value);
      });
    }

    // Sort by timestamp descending
    const uniqueTxs = Array.from(new Map(allTxs.map(tx => [tx.signature, tx])).values());
    uniqueTxs.sort((a, b) => b.timestamp - a.timestamp);

    // Save new ones to DB
    for (const tx of uniqueTxs) {
      try {
        await prisma.transaction.upsert({
          where: { signature: tx.signature },
          update: {},
          create: {
            signature: tx.signature,
            timestamp: BigInt(tx.timestamp),
            walletAddress: tx.walletAddress,
            walletLabel: tx.walletLabel,
            type: tx.type,
            tokenSymbol: tx.tokenSymbol,
            tokenName: tx.tokenName,
            amount: tx.amount,
            usdValue: tx.usdValue,
            isAlert: tx.isAlert,
            source: tx.source,
          }
        });
      } catch (e) {}
    }

    // Fetch latest 100 from DB
    const dbTxs = await prisma.transaction.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    const parsedTxs: Transaction[] = dbTxs.map(t => ({
      ...t,
      walletLabel: t.walletLabel || "",
      timestamp: Number(t.timestamp)
    }));

    if (parsedTxs.length === 0) {
      return NextResponse.json({ transactions: getMockTransactions(), demo: true });
    }

    return NextResponse.json({ transactions: parsedTxs, demo: false });
  } catch (error) {
    console.error("Transactions API CRITICAL ERROR:", error);
    return NextResponse.json({
      transactions: getMockTransactions(),
      demo: true,
    });
  }
}

function getMockTransactions(): Transaction[] {
  const now = Date.now();
  const mock: Transaction[] = [
    {
      signature: "mock_sig_1",
      timestamp: now - 2 * 60 * 1000,
      walletAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
      walletLabel: "Jump Trading",
      type: "buy",
      tokenSymbol: "SOL",
      tokenName: "Solana",
      amount: 15000,
      usdValue: 2_250_000,
      isAlert: true,
      source: "preloaded",
    },
    {
      signature: "mock_sig_2",
      timestamp: now - 8 * 60 * 1000,
      walletAddress: "GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ",
      walletLabel: "Wintermute Trading",
      type: "sell",
      tokenSymbol: "JUP",
      tokenName: "Jupiter",
      amount: 4_500_000,
      usdValue: 810_000,
      isAlert: true,
      source: "preloaded",
    },
    {
      signature: "mock_sig_3",
      timestamp: now - 15 * 60 * 1000,
      walletAddress: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
      walletLabel: "Jupiter Aggregator",
      type: "transfer",
      tokenSymbol: "USDC",
      tokenName: "USD Coin",
      amount: 850_000,
      usdValue: 850_000,
      isAlert: true,
      source: "preloaded",
    },
    {
      signature: "mock_sig_4",
      timestamp: now - 22 * 60 * 1000,
      walletAddress: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
      walletLabel: "Coinbase Prime",
      type: "buy",
      tokenSymbol: "WIF",
      tokenName: "dogwifhat",
      amount: 3_200_000,
      usdValue: 320_000,
      isAlert: false,
      source: "preloaded",
    },
    {
      signature: "mock_sig_5",
      timestamp: now - 35 * 60 * 1000,
      walletAddress: "3yFwqXBfZY4jBVUafQ1YEXWtSh7RJBGG6FSayt3MZQMR",
      walletLabel: "Multicoin Capital",
      type: "buy",
      tokenSymbol: "RAY",
      tokenName: "Raydium",
      amount: 250_000,
      usdValue: 675_000,
      isAlert: true,
      source: "preloaded",
    },
    {
      signature: "mock_sig_6",
      timestamp: now - 48 * 60 * 1000,
      walletAddress: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
      walletLabel: "Binance Hot Wallet",
      type: "transfer",
      tokenSymbol: "SOL",
      tokenName: "Solana",
      amount: 8_500,
      usdValue: 1_275_000,
      isAlert: true,
      source: "preloaded",
    },
    {
      signature: "mock_sig_7",
      timestamp: now - 62 * 60 * 1000,
      walletAddress: "AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2",
      walletLabel: "Alameda Research (Legacy)",
      type: "sell",
      tokenSymbol: "BONK",
      tokenName: "Bonk",
      amount: 500_000_000,
      usdValue: 75_000,
      isAlert: false,
      source: "preloaded",
    },
    {
      signature: "mock_sig_8",
      timestamp: now - 90 * 60 * 1000,
      walletAddress: "4mVfHBiMn5dgr1FaAjSLJXXiJRTkEkRFPkTDFLmDo4aG",
      walletLabel: "Galaxy Digital",
      type: "buy",
      tokenSymbol: "PYTH",
      tokenName: "Pyth Network",
      amount: 2_100_000,
      usdValue: 420_000,
      isAlert: false,
      source: "preloaded",
    },
  ];

  return mock;
}
