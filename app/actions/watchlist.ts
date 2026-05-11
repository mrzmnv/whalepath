"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addPersonalWallet(userId: string, address: string, label: string) {
  if (!userId || !address) return { error: "Missing required fields." };
  
  try {
    await prisma.watchlist.create({
      data: {
        userId,
        address,
        label,
        type: "personal"
      }
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (e: any) {
    if (e.code === 'P2002') return { error: "This wallet is already in your list." };
    return { error: "Something went wrong." };
  }
}

export async function addFavoriteWhale(userId: string, address: string) {
  if (!userId || !address) return { error: "Missing required fields." };
  
  try {
    const whale = await prisma.whale.findUnique({ where: { address } });
    await prisma.watchlist.create({
      data: {
        userId,
        address,
        label: whale?.label || "Unknown",
        type: "favorite"
      }
    });
    revalidatePath("/");
    revalidatePath("/profile");
    return { success: true };
  } catch (e: any) {
    if (e.code === 'P2002') return { error: "Already in favorites." };
    return { error: "Something went wrong." };
  }
}

export async function removeWatchlistItem(id: string) {
  await prisma.watchlist.delete({ where: { id } });
  revalidatePath("/profile");
  revalidatePath("/");
}

export async function toggleFavoriteWhale(userId: string, address: string, label: string) {
  if (!userId || !address) return { error: "Missing required fields." };
  
  try {
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
          label: label || "Unknown",
          type: "favorite"
        }
      });
    }
    
    revalidatePath("/");
    revalidatePath("/profile");
    return { success: true };
  } catch (e: any) {
    return { error: "Something went wrong." };
  }
}
