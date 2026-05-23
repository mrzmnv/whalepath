import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false, items: [] });
    }

    const session = await decrypt(sessionCookie);

    if (!session?.userId) {
      return NextResponse.json({ authenticated: false, items: [] });
    }

    const watchlists = await prisma.watchlist.findMany({
      where: { userId: session.userId as string },
    });

    return NextResponse.json(
      { authenticated: true, items: watchlists },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } },
    );
  } catch (error) {
    console.error("Watchlist GET error:", error);
    return NextResponse.json({ authenticated: false, items: [] }, { status: 500 });
  }
}
