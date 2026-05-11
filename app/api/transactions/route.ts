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
  const apiKey = process.env.HELIUS_API_KEY;

  if (!apiKey) {
    console.error("[transactions] HELIUS_API_KEY is not set!");
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

  let wallets: WalletInput[] = [];
  try {
    const body = await req.json();
    wallets = body.wallets ?? [];
  } catch {
    // empty body is ok
  }

  if (!Array.isArray(wallets) || wallets.length === 0) {
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

  // Fetch fresh from Helius in parallel batches of 10
  const BATCH = 10;
  const allTxs: Transaction[] = [];
  for (let i = 0; i < wallets.length; i += BATCH) {
    const batch = wallets.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map((w) =>
        fetchWalletTransactions(w.address, w.label, w.source, apiKey),
      ),
    );
    results.forEach((r) => {
      if (r.status === "fulfilled") allTxs.push(...r.value);
      else console.error("[transactions] batch error:", r.reason);
    });
  }

  // Dedupe and sort
  const uniqueTxs = Array.from(
    new Map(allTxs.map((tx) => [tx.signature, tx])).values(),
  ).sort((a, b) => b.timestamp - a.timestamp);

  // Write to DB in background
  (async () => {
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
      } catch {
        // ignore duplicate key
      }
    }
  })();

  // Return fresh Helius data directly
  if (uniqueTxs.length > 0) {
    return NextResponse.json({
      transactions: uniqueTxs.slice(0, 100),
      demo: false,
    });
  }

  // Helius returned nothing — fall back to DB cache
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
