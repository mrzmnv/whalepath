import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const revalidate = 0; // Prevent Next.js from caching the whales endpoint so it reflects DB additions

export async function GET() {
  const whales = await prisma.whale.findMany();
  return NextResponse.json(whales);
}
