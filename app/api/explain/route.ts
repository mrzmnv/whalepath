import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

type ExplainBody = {
  walletLabel?: string;
  walletAddress?: string;
  type?: "buy" | "sell" | "transfer" | "unknown";
  tokenSymbol?: string;
  tokenName?: string;
  amount?: number;
  usdValue?: number;
  timestamp?: number;
  isAlert?: boolean;
  fromAddress?: string;
  toAddress?: string;
};

function formatCompactUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function buildLocalExplanation(body: ExplainBody) {
  const walletName = body.walletLabel || body.walletAddress || "Bu wallet";
  const tokenLabel =
    body.tokenName && body.tokenName !== body.tokenSymbol
      ? `${body.tokenName} (${body.tokenSymbol})`
      : body.tokenSymbol || "token";
  const amount =
    typeof body.amount === "number"
      ? formatAmount(body.amount)
      : "unknown amount";
  const usdValue =
    typeof body.usdValue === "number"
      ? formatCompactUsd(body.usdValue)
      : "unknown value";
  const actionMap = {
    buy: "bought",
    sell: "sold",
    transfer: "transferred",
    unknown: "transacted",
  } as const;
  const action = actionMap[body.type ?? "unknown"];

  let meaning =
    "A single transaction is not conclusive, but this wallet is active and showing movement in the market.";
  if (body.type === "buy") {
    meaning =
      "Typically an accumulation signal: the wallet is increasing its position in this asset. A large amount may indicate growing market interest.";
  } else if (body.type === "sell") {
    meaning =
      "Typically an exit or profit-taking signal. A large amount could create short-term selling pressure.";
  } else if (body.type === "transfer") {
    meaning =
      "This is not necessarily a buy or sell. It could be an inter-wallet transfer, an exchange deposit/withdrawal, or an internal balance move.";
  }

  const sizeNote = body.isAlert
    ? "This transaction is large and warrants close attention."
    : "Volume is moderate — best viewed in context with other activity.";

  return [
    `What happened: ${walletName} ${action} ${amount} ${tokenLabel}. Estimated value: ${usdValue}.`,
    `What it may mean: ${meaning}`,
    `Quick take: ${sizeNote}`,
  ].join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExplainBody;
    const {
      walletLabel,
      walletAddress,
      type,
      tokenSymbol,
      tokenName,
      amount,
      usdValue,
      timestamp,
      isAlert,
      fromAddress,
      toAddress,
    } = body;

    // Validate required fields
    if (
      !walletAddress ||
      !type ||
      !tokenSymbol ||
      typeof amount !== "number" ||
      typeof usdValue !== "number" ||
      typeof timestamp !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const txDate = new Date(timestamp).toLocaleString();
    const formattedUSD = formatCompactUsd(usdValue);
    const apiKey = process.env.SIGNAL_API_KEY;
    const fallback = buildLocalExplanation(body);

    if (!apiKey) {
      return NextResponse.json({ explanation: fallback, source: "local" });
    }

    const client = new Anthropic({ apiKey });
    const prompt = `You are a concise analyst explaining Solana whale transactions in plain English.

The user is non-technical. Avoid jargon. Write exactly 3 short lines using this format:
What happened: ...
What it may mean: ...
Quick take: ...

Rules:
- Be specific, avoid generic filler sentences.
- Always mention the token, amount, USD value, and transaction type.
- If it's a transfer, do not present it as a buy or sell.
- If the transaction is large, explain why it deserves attention.
- Do not state uncertain things as facts; use "may" or "could".
- Maximum 75 words.

Transaction data:
- Wallet: ${walletLabel || walletAddress}
- Address: ${walletAddress}
- Type: ${type}
- Token: ${tokenName || tokenSymbol} (${tokenSymbol})
- Amount: ${formatAmount(amount)} ${tokenSymbol}
- USD value: ${formattedUSD}
- Time: ${txDate}
- Large alert: ${isAlert ? "yes" : "no"}
- From: ${fromAddress || "unknown"}
- To: ${toAddress || "unknown"}`;

    try {
      const message = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 220,
        messages: [{ role: "user", content: prompt }],
      });

      const explanation =
        message.content[0]?.type === "text"
          ? message.content[0].text.trim()
          : fallback;

      return NextResponse.json({ explanation });
    } catch {
      return NextResponse.json({ explanation: fallback });
    }
  } catch (error) {
    console.error("Explain API error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { explanation: "Analysis unavailable. Please try again later." },
      { status: 500 },
    );
  }
}
