import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const whales = await prisma.whale.findMany();

  // Compute score for each whale based on transaction data
  const addresses = whales.map((w) => w.address);

  const [txStats, alertCounts] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['walletAddress'],
      where: { walletAddress: { in: addresses } },
      _sum: { usdValue: true },
      _count: { id: true },
    }),
    prisma.transaction.groupBy({
      by: ['walletAddress'],
      where: { walletAddress: { in: addresses }, isAlert: true },
      _count: { id: true },
    }),
  ]);

  const statsMap: Record<string, { volume: number; txCount: number }> = {};
  for (const s of txStats) {
    statsMap[s.walletAddress] = {
      volume: s._sum.usdValue || 0,
      txCount: s._count.id,
    };
  }
  const alertMap: Record<string, number> = {};
  for (const a of alertCounts) {
    alertMap[a.walletAddress] = a._count.id;
  }

  const maxVolume = Math.max(...Object.values(statsMap).map((s) => s.volume), 1);
  const maxTxCount = Math.max(...Object.values(statsMap).map((s) => s.txCount), 1);

  const whalesWithScore = whales.map((w) => {
    const s = statsMap[w.address];
    if (!s || s.txCount === 0) return { ...w, score: 0 };
    const volumeScore = (s.volume / maxVolume) * 50;
    const txScore = (s.txCount / maxTxCount) * 30;
    const alertScore = Math.min((alertMap[w.address] || 0) * 4, 20);
    const score = Math.round(volumeScore + txScore + alertScore);
    return { ...w, score };
  });

  // Sort by score desc
  whalesWithScore.sort((a, b) => b.score - a.score);

  return NextResponse.json(
    whalesWithScore,
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } },
  );
}
