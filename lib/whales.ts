import { WhaleWallet } from "./types";

// This module exports the pre-loaded whale list.
// In a Next.js app, this is fetched from /public/whales.json.
// On the server we can import directly; on the client we fetch the JSON.

let _cachedWhales: WhaleWallet[] | null = null;

export async function getPreloadedWhales(): Promise<WhaleWallet[]> {
  if (_cachedWhales) return _cachedWhales;

  // Works in both server and client contexts
  try {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/whales.json`);
    if (!res.ok) return [];
    _cachedWhales = (await res.json()) as WhaleWallet[];
    return _cachedWhales;
  } catch {
    return [];
  }
}

export function resetWhaleCache(): void {
  _cachedWhales = null;
}
