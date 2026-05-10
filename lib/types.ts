export interface WhaleWallet {
  address: string;
  label: string;
  category: string;
  tags: string[];
}

export interface Transaction {
  signature: string;
  timestamp: number;
  walletAddress: string;
  walletLabel: string;
  type: "buy" | "sell" | "transfer" | "unknown";
  tokenSymbol: string;
  tokenName: string;
  tokenMint?: string;
  amount: number;
  usdValue: number;
  fromAddress?: string;
  toAddress?: string;
  isAlert: boolean; // $500k+
  explanation?: string;
  source: "preloaded" | "watchlist";
}

export interface WatchlistEntry {
  address: string;
  label: string;
  addedAt: number;
}

export interface StatsData {
  totalWhales: number;
  transactions24h: number;
  largestMoveToday: number;
  largestMoveToken: string;
}
