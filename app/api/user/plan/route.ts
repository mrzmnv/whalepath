import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import prisma from "@/lib/db";
import { PLANS, getPlanLimit } from "@/lib/plans";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false, plan: "free", limit: 5, count: 0 });
    }

    const session = await decrypt(sessionCookie);
    if (!session?.userId) {
      return NextResponse.json({ authenticated: false, plan: "free", limit: 5, count: 0 });
    }

    const userId = session.userId as string;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, username: true },
    });

    const plan = user?.plan ?? "free";
    const limit = getPlanLimit(plan);
    const count = await prisma.watchlist.count({ where: { userId } });

    return NextResponse.json({
      authenticated: true,
      username: user?.username,
      plan,
      planInfo: PLANS[plan as keyof typeof PLANS],
      limit,
      count,
    });
  } catch {
    return NextResponse.json({ authenticated: false, plan: "free", limit: 5, count: 0 });
  }
}
