import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const count = await prisma.transaction.count();
  return NextResponse.json(
    { count },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
  );
}
