import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from "@solana/web3.js";
import prisma from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Encoding, Accept-Encoding",
};

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const RPC_URL =
  process.env.HELIUS_RPC_URL ||
  `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

// USDC mint on Solana mainnet
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
// SOL wrapped mint
const WSOL_MINT = "So11111111111111111111111111111111111111112";

const TOKEN_MINTS: Record<string, string> = {
  USDC: USDC_MINT,
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  SOL: WSOL_MINT,
  BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  JTO: "jtojtomepa8b1i8bbw4b6kkkliqwkwdquz5jm39jcyx",
  RAY: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
  WEN: "WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk",
  ME: "MEFNBXixkEbait3xn9bkm8WsJzXtVsaJEn4c8Sam21p",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  // Get whale info from DB
  const whale = await prisma.whale.findFirst({
    where: { address },
  });

  // Get the last significant transaction for this whale
  const lastTx = await prisma.transaction.findFirst({
    where: { walletAddress: address, type: { in: ["buy", "sell"] } },
    orderBy: { timestamp: "desc" },
  });

  const label = whale?.label || `${address.slice(0, 6)}...${address.slice(-4)}`;
  const txType = lastTx?.type || "buy";
  const token = lastTx?.tokenSymbol || "SOL";
  const usd = lastTx?.usdValue || 0;

  const formatUSD = (v: number) =>
    v >= 1_000_000
      ? `$${(v / 1_000_000).toFixed(1)}M`
      : v >= 1_000
      ? `$${(v / 1_000).toFixed(0)}K`
      : `$${v.toFixed(0)}`;

  const actionLabel =
    txType === "buy"
      ? `Mirror ${label}'s ${formatUSD(usd)} ${token} buy`
      : `Mirror ${label}'s ${formatUSD(usd)} ${token} move`;

  const response = {
    type: "action",
    icon: `${BASE_URL}/whalepath-og.png`,
    title: `WhalePath — ${label}`,
    description: `${label} recently ${txType === "buy" ? "bought" : "moved"} ${formatUSD(usd)} worth of ${token}. Mirror this whale's trade instantly on Solana.`,
    label: "Mirror Trade",
    links: {
      actions: [
        {
          label: "Mirror $100",
          href: `/api/actions/whale/${address}?amount=100&token=${token}`,
          type: "transaction",
        },
        {
          label: "Mirror $500",
          href: `/api/actions/whale/${address}?amount=500&token=${token}`,
          type: "transaction",
        },
        {
          label: "Mirror $1000",
          href: `/api/actions/whale/${address}?amount=1000&token=${token}`,
          type: "transaction",
        },
        {
          label: "Custom amount",
          href: `/api/actions/whale/${address}?amount={amount}&token=${token}`,
          type: "transaction",
          parameters: [
            {
              name: "amount",
              label: "Amount in USD",
              type: "number",
              min: 1,
              max: 10000,
              required: true,
            },
          ],
        },
      ],
    },
  };

  return NextResponse.json(response, { headers: CORS_HEADERS });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { searchParams } = new URL(req.url);
    const amountUSD = parseFloat(searchParams.get("amount") || "100");
    const tokenSymbol = (searchParams.get("token") || "SOL").toUpperCase();

    const body = await req.json();
    const userAccount = body.account;

    if (!userAccount) {
      return NextResponse.json(
        { message: "Missing account in request body" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    let userPubkey: PublicKey;
    try {
      userPubkey = new PublicKey(userAccount);
    } catch {
      return NextResponse.json(
        { message: "Invalid wallet address" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const connection = new Connection(RPC_URL, "confirmed");

    // Determine output mint based on token symbol
    const outputMint = TOKEN_MINTS[tokenSymbol] || WSOL_MINT;
    const inputMint = USDC_MINT; // always swap FROM usdc

    // Convert USD to USDC amount (USDC has 6 decimals)
    const inputAmount = Math.round(amountUSD * 1_000_000);

    // Try Jupiter quote
    let transaction: Transaction;
    try {
      const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${inputAmount}&slippageBps=100`;
      const quoteRes = await fetch(quoteUrl, { signal: AbortSignal.timeout(5000) });

      if (quoteRes.ok) {
        const quoteData = await quoteRes.json();

        const swapRes = await fetch("https://quote-api.jup.ag/v6/swap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quoteResponse: quoteData,
            userPublicKey: userPubkey.toBase58(),
            wrapAndUnwrapSol: true,
            dynamicComputeUnitLimit: true,
            prioritizationFeeLamports: "auto",
          }),
          signal: AbortSignal.timeout(8000),
        });

        if (swapRes.ok) {
          const swapData = await swapRes.json();
          const txBuffer = Buffer.from(swapData.swapTransaction, "base64");
          const { VersionedTransaction } = await import("@solana/web3.js");
          const vTx = VersionedTransaction.deserialize(txBuffer);

          return NextResponse.json(
            {
              transaction: swapData.swapTransaction,
              message: `Mirroring whale trade — buying ${tokenSymbol} with $${amountUSD} USDC via Jupiter`,
            },
            { headers: CORS_HEADERS }
          );
        }
      }
    } catch {
      // Jupiter failed — fall through to memo transaction
    }

    // Fallback: create a simple SOL transfer + memo to record the intent on-chain
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    const lamports = Math.max(
      Math.round((amountUSD / 1000) * LAMPORTS_PER_SOL * 0.001),
      5000
    );

    const memoInstruction = new TransactionInstruction({
      keys: [],
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      data: Buffer.from(
        `whalepath:mirror:${address.slice(0, 8)}:${tokenSymbol}:${amountUSD}usd`
      ),
    });

    transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: userPubkey,
    }).add(memoInstruction);

    const serialized = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return NextResponse.json(
      {
        transaction: serialized.toString("base64"),
        message: `WhalePath: Intent to mirror ${tokenSymbol} trade recorded on-chain`,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("[actions/whale] POST error:", err);
    return NextResponse.json(
      { message: "Failed to build transaction" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
