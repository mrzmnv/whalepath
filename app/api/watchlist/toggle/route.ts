import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getPlanLimit } from "@/lib/plans";

export async function POST(req: Request) {
  try {
    const { address, label, type: walletType } = await req.json();
    const entryType = walletType === "personal" ? "personal" : "favorite";
    if (!address || typeof address !== "string") {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    if (!sessionCookie)
      return NextResponse.json({ error: "Unauthorized", requireLogin: true }, { status: 401 });

    const session = await decrypt(sessionCookie);
    if (!session?.userId)
      return NextResponse.json({ error: "Unauthorized", requireLogin: true }, { status: 401 });

    const userId = session.userId as string;

    const existing = await prisma.watchlist.findFirst({
      where: { userId, address, type: entryType },
    });

    if (existing) {
      await prisma.watchlist.delete({ where: { id: existing.id } });
    } else {
      // Check plan limit before adding
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const limit = getPlanLimit((user as any)?.plan ?? "free");
      const currentCount = await prisma.watchlist.count({ where: { userId } });

      if (currentCount >= limit) {
        const plan = (user as any)?.plan ?? "free";
        return NextResponse.json(
          { error: "limit_reached", plan, limit },
          { status: 403 },
        );
      }

      await prisma.watchlist.create({
        data: {
          userId,
          address,
          label: label || "Unknown",
          type: entryType,
        },
      });
    }

    revalidatePath("/profile");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

