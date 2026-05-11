import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { fetchWalletTransactionHistory } from "@/lib/helius";

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Missing wallet address" },
        { status: 400 },
      );
    }

    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
      return NextResponse.json(
        { error: "Invalid Solana address" },
        { status: 400 },
      );
    }

    const apiKey = process.env.HELIUS_API_KEY;

    // Try Helius first if API key exists
    if (apiKey) {
      try {
        const whale = await prisma.whale.findUnique({ where: { address } });
        const label = whale?.label ?? address.slice(0, 8);
        const hTxs = await fetchWalletTransactionHistory(address, label, apiKey, 50);

        // Upsert new txs into DB
        for (const tx of hTxs) {
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
            // ignore duplicate key errors
          }
        }
      } catch (e) {
        console.error("[wallet-history] Helius fetch failed:", e);
      }
    }

    // Return from DB (includes freshly upserted data)
    const rows = await prisma.transaction.findMany({
      where: { walletAddress: address },
      orderBy: { timestamp: "desc" },
      take: 100,
    });

    const transactions = rows.map((r) => ({
      signature: r.signature,
      timestamp: Number(r.timestamp),
      walletAddress: r.walletAddress,
      walletLabel: r.walletLabel ?? r.walletAddress.slice(0, 8),
      type: r.type,
      tokenSymbol: r.tokenSymbol,
      tokenName: r.tokenName,
      amount: r.amount,
      usdValue: r.usdValue,
      isAlert: r.isAlert,
      source: r.source,
    }));

    return NextResponse.json(transactions);
  } catch {
    return NextResponse.json([]);
  }
}
