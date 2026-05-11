import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address || typeof address !== "string") {
      return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });
    }

    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
      return NextResponse.json({ error: "Invalid Solana address" }, { status: 400 });
    }

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
