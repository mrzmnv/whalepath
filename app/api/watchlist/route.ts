import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import prisma from '@/lib/db';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  const session = await decrypt(sessionCookie);

  if (!session?.userId) {
    return NextResponse.json({ authenticated: false, items: [] });
  }

  const watchlists = await prisma.watchlist.findMany({
    where: { userId: session.userId as string },
  });

  return NextResponse.json({ authenticated: true, items: watchlists });
}
