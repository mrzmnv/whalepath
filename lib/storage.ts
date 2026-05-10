import { WatchlistEntry } from "./types";

const WATCHLIST_KEY = "whalepath_watchlist";
const SEEN_TXS_KEY = "whalepath_seen_txs";

export function getWatchlist(): WatchlistEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    return raw ? (JSON.parse(raw) as WatchlistEntry[]) : [];
  } catch {
    return [];
  }
}

export function addToWatchlist(entry: WatchlistEntry): WatchlistEntry[] {
  const list = getWatchlist();
  // Prevent duplicates
  if (list.some((e) => e.address === entry.address)) return list;
  const updated = [...list, entry];
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
  return updated;
}

export function removeFromWatchlist(address: string): WatchlistEntry[] {
  const list = getWatchlist().filter((e) => e.address !== address);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  return list;
}

export function updateWatchlistLabel(
  address: string,
  label: string,
): WatchlistEntry[] {
  const list = getWatchlist().map((e) =>
    e.address === address ? { ...e, label } : e,
  );
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  return list;
}

export function getSeenTxs(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SEEN_TXS_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function markTxsSeen(signatures: string[]): void {
  if (typeof window === "undefined") return;
  const seen = getSeenTxs();
  signatures.forEach((s) => seen.add(s));
  // Keep only last 2000 to avoid unbounded growth
  const arr = Array.from(seen).slice(-2000);
  localStorage.setItem(SEEN_TXS_KEY, JSON.stringify(arr));
}
