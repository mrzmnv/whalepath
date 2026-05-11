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
      // No API key — return whatever is already in DB
      const dbTxs = await prisma.transaction.findMany({
        orderBy: { timestamp: "desc" },
        take: 100,
      });
      const parsed: Transaction[] = dbTxs.map((t) => ({
        ...t,
        type: t.type as any,
        source: t.source as any,
        walletLabel: t.walletLabel || "",
        timestamp: Number(t.timestamp),
      }));
      return NextResponse.json({ transactions: parsed, demo: false });
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
        batch.map((w) =>
          fetchWalletTransactions(w.address, w.label, w.source, apiKey),
        ),
      );
      batchResults.forEach((r) => {
        if (r.status === "fulfilled") allTxs.push(...r.value);
      });
    }

    // Sort by timestamp descending
    const uniqueTxs = Array.from(
      new Map(allTxs.map((tx) => [tx.signature, tx])).values(),
    );
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
          },
        });
      } catch (e) {
        console.error("TX upsert failed:", (e as Error).message);
      }
    }

    // Fetch latest 100 from DB
    const dbTxs = await prisma.transaction.findMany({
      orderBy: { timestamp: "desc" },
      take: 100,
    });

    const parsedTxs: Transaction[] = dbTxs.map((t) => ({
      ...t,
      type: t.type as any,
      source: t.source as any,
      walletLabel: t.walletLabel || "",
      timestamp: Number(t.timestamp),
    }));

    if (parsedTxs.length === 0) {
      return NextResponse.json({ transactions: [], demo: false });
    }

    return NextResponse.json({ transactions: parsedTxs, demo: false });
  } catch (error) {
    console.error("Transactions API CRITICAL ERROR:", error);
    try {
      const dbTxs = await prisma.transaction.findMany({
        orderBy: { timestamp: "desc" },
        take: 100,
      });
      const parsed: Transaction[] = dbTxs.map((t) => ({
        ...t,
        type: t.type as any,
        source: t.source as any,
        walletLabel: t.walletLabel || "",
        timestamp: Number(t.timestamp),
      }));
      return NextResponse.json({ transactions: parsed, demo: false });
    } catch {
      return NextResponse.json({ transactions: [], demo: false });
    }
  }
}
