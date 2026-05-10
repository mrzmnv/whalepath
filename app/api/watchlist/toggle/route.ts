import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { address, label } = await req.json();
    if (!address) return NextResponse.json({ error: "Missing address" }, { status: 400 });

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await decrypt(sessionCookie);
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.userId as string;

    const existing = await prisma.watchlist.findFirst({
      where: { userId, address, type: "favorite" }
    });

    if (existing) {
      await prisma.watchlist.delete({ where: { id: existing.id } });
    } else {
      await prisma.watchlist.create({
        data: {
          userId,
          address,
          label: label || "Bilinməyən",
          type: "favorite"
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
