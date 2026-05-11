import { Transaction } from "./types";

const HELIUS_BASE = "https://api-mainnet.helius-rpc.com/v0";
const THRESHOLD_USD = 50;  // store txs ≥ $50 to match UI filter ranges
const ALERT_THRESHOLD_USD = 100_000;

interface HeliusTokenTransfer {
  mint: string;
  tokenAmount: number;
  fromUserAccount?: string;
  toUserAccount?: string;
  fromTokenAccount?: string;
  toTokenAccount?: string;
}

interface HeliusNativeTransfer {
  amount: number; // lamports
  fromUserAccount?: string;
  toUserAccount?: string;
}

interface HeliusTransaction {
  signature: string;
  timestamp: number;
  type: string;
  source?: string;
  nativeTransfers?: HeliusNativeTransfer[];
  tokenTransfers?: HeliusTokenTransfer[];
  accountData?: Array<{
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges?: Array<{
      mint: string;
      rawTokenAmount: { tokenAmount: string; decimals: number };
      userAccount: string;
    }>;
  }>;
}

// Simple in-memory SOL price cache (refreshed every 5 minutes)
let cachedSolPrice: number = 150;
let solPriceLastFetched = 0;

async function getSolPrice(): Promise<number> {
  const now = Date.now();
  if (now - solPriceLastFetched < 5 * 60 * 1000) return cachedSolPrice;
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      { next: { revalidate: 300 } },
    );
    if (res.ok) {
      const data = await res.json();
      cachedSolPrice = data?.solana?.usd ?? cachedSolPrice;
      solPriceLastFetched = now;
    }
  } catch {
    // Use cached value silently
  }
  return cachedSolPrice;
}

function classifyType(
  tx: HeliusTransaction,
  walletAddress: string,
): "buy" | "sell" | "transfer" {
  const type = (tx.type || "").toUpperCase();
  if (type.includes("SWAP") || type.includes("BUY")) return "buy";
  if (type.includes("SELL")) return "sell";
  // Check native transfers direction
  if (tx.nativeTransfers) {
    for (const nt of tx.nativeTransfers) {
      if (nt.toUserAccount === walletAddress) return "buy";
      if (nt.fromUserAccount === walletAddress) return "sell";
    }
  }
  return "transfer";
}

// Well-known Solana token mints → symbol
const KNOWN_TOKENS: Record<string, { symbol: string; name: string }> = {
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
    symbol: "USDC",
    name: "USD Coin",
  },
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: {
    symbol: "USDT",
    name: "Tether",
  },
  So11111111111111111111111111111111111111112: {
    symbol: "SOL",
    name: "Solana",
  },
  mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: {
    symbol: "mSOL",
    name: "Marinade SOL",
  },
  J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn: {
    symbol: "jitoSOL",
    name: "Jito SOL",
  },
  "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs": {
    symbol: "SOL",
    name: "Solana",
  },
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: {
    symbol: "BONK",
    name: "Bonk",
  },
  "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": {
    symbol: "RAY",
    name: "Raydium",
  },
  orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE: { symbol: "ORCA", name: "Orca" },
  HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3: {
    symbol: "PYTH",
    name: "Pyth",
  },
  jtojtomepa8b1i8bbw4b6kkkliqwkwdquz5jm39jcyx: { symbol: "JTO", name: "Jito" },
  WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk: { symbol: "WEN", name: "Wen" },
  MEFNBXixkEbait3xn9bkm8WsJzXtVsaJEn4c8Sam21p: {
    symbol: "ME",
    name: "Magic Eden",
  },
};

function extractTokenInfo(tx: HeliusTransaction): {
  symbol: string;
  name: string;
  mint?: string;
  amount: number;
} {
  if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
    // Find the largest transfer
    const tt = tx.tokenTransfers.reduce((a, b) =>
      (b.tokenAmount || 0) > (a.tokenAmount || 0) ? b : a,
    );
    const known = tt.mint ? KNOWN_TOKENS[tt.mint] : undefined;
    const symbol =
      known?.symbol ?? (tt.mint ? tt.mint.slice(0, 6).toUpperCase() : "TOKEN");
    const name = known?.name ?? symbol;
    return {
      symbol,
      name,
      mint: tt.mint,
      amount: tt.tokenAmount || 0,
    };
  }
  return { symbol: "SOL", name: "Solana", amount: 0 };
}

export async function fetchWalletTransactions(
  walletAddress: string,
  walletLabel: string,
  source: "preloaded" | "watchlist",
  apiKey: string,
): Promise<Transaction[]> {
  const url = `${HELIUS_BASE}/addresses/${walletAddress}/transactions?api-key=${apiKey}&limit=20`;
  const solPrice = await getSolPrice();

  let raw: HeliusTransaction[] = [];
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error(`[helius] ${walletAddress} HTTP ${res.status}`);
      return [];
    }
    raw = await res.json();
  } catch (e) {
    console.error(`[helius] fetch error for ${walletAddress}:`, e);
    return [];
  }

  const results: Transaction[] = [];

  for (const tx of raw) {
    let usdValue = 0;

    if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
      // Sum the largest single native transfer (not all, to avoid double-counting fees)
      const maxLamports = Math.max(
        ...tx.nativeTransfers.map((nt) => Math.abs(nt.amount)),
      );
      usdValue = (maxLamports / 1e9) * solPrice;
    }

    // For token transfers: use the absolute SOL balance change of the wallet as USD proxy
    if (
      usdValue < THRESHOLD_USD &&
      tx.tokenTransfers &&
      tx.tokenTransfers.length > 0 &&
      tx.accountData
    ) {
      const walletAccount = tx.accountData.find(
        (a) => a.account === walletAddress,
      );
      const solChange = walletAccount
        ? Math.abs(walletAccount.nativeBalanceChange) / 1e9
        : 0;
      if (solChange > 0) {
        usdValue = solChange * solPrice;
      } else {
        // Last resort: total token amount × $1 rough floor to catch large non-SOL txs
        const totalTokenAmt = tx.tokenTransfers.reduce(
          (s, t) => s + (t.tokenAmount || 0),
          0,
        );
        usdValue =
          totalTokenAmt > 1_000_000 ? THRESHOLD_USD + 1 : totalTokenAmt;
      }
    }

    if (usdValue < THRESHOLD_USD) continue;

    const tokenInfo = extractTokenInfo(tx);
    let amount = tokenInfo.amount;

    if (tokenInfo.symbol === "SOL" && tx.nativeTransfers) {
      amount =
        tx.nativeTransfers.reduce((sum, nt) => sum + Math.abs(nt.amount), 0) /
        1e9;
    }

    results.push({
      signature: tx.signature,
      timestamp: tx.timestamp * 1000,
      walletAddress,
      walletLabel,
      type: classifyType(tx, walletAddress),
      tokenSymbol: tokenInfo.symbol,
      tokenName: tokenInfo.name,
      tokenMint: tokenInfo.mint,
      amount,
      usdValue,
      fromAddress: tx.nativeTransfers?.[0]?.fromUserAccount,
      toAddress: tx.nativeTransfers?.[0]?.toUserAccount,
      isAlert: usdValue >= ALERT_THRESHOLD_USD,
      source,
    });
  }

  return results;
}

export async function fetchWalletTransactionHistory(
  walletAddress: string,
  walletLabel: string,
  apiKey: string,
  limit = 50,
): Promise<Transaction[]> {
  const url = `${HELIUS_BASE}/addresses/${walletAddress}/transactions?api-key=${apiKey}&limit=${limit}`;
  const solPrice = await getSolPrice();

  let raw: HeliusTransaction[] = [];
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    raw = await res.json();
  } catch {
    return [];
  }

  return raw.map((tx) => {
    let usdValue = 0;
    if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
      const totalLamports = tx.nativeTransfers.reduce(
        (sum, nt) => sum + Math.abs(nt.amount),
        0,
      );
      usdValue = (totalLamports / 1e9) * solPrice;
    }

    const tokenInfo = extractTokenInfo(tx);
    let amount = tokenInfo.amount;
    if (tokenInfo.symbol === "SOL" && tx.nativeTransfers) {
      amount =
        tx.nativeTransfers.reduce((sum, nt) => sum + Math.abs(nt.amount), 0) /
        1e9;
    }

    return {
      signature: tx.signature,
      timestamp: tx.timestamp * 1000,
      walletAddress,
      walletLabel,
      type: classifyType(tx, walletAddress),
      tokenSymbol: tokenInfo.symbol,
      tokenName: tokenInfo.name,
      tokenMint: tokenInfo.mint,
      amount,
      usdValue,
      fromAddress: tx.nativeTransfers?.[0]?.fromUserAccount,
      toAddress: tx.nativeTransfers?.[0]?.toUserAccount,
      isAlert: usdValue >= ALERT_THRESHOLD_USD,
      source: "preloaded",
    };
  });
}
