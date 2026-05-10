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
      : "naməlum həcmdə";
  const usdValue =
    typeof body.usdValue === "number"
      ? formatCompactUsd(body.usdValue)
      : "naməlum məbləğdə";
  const actionMap = {
    buy: "alış edib",
    sell: "satış edib",
    transfer: "transfer edib",
    unknown: "əməliyyat edib",
  } as const;
  const action = actionMap[body.type ?? "unknown"];

  let meaning =
    "Bu tək əməliyyatla qəti nəticə çıxarmaq olmaz, amma wallet aktivdir və bazarda hərəkət göstərir.";
  if (body.type === "buy") {
    meaning =
      "Bu adətən yığım siqnalıdır: wallet həmin aktivdə mövqe artırır. Məbləğ böyükdürsə, bazarda marağın artdığını göstərə bilər.";
  } else if (body.type === "sell") {
    meaning =
      "Bu adətən çıxış və ya mənfəət realizasiyası siqnalıdır. Xüsusən böyük məbləğdirsə, qısamüddətli təzyiq yarada bilər.";
  } else if (body.type === "transfer") {
    meaning =
      "Bu birbaşa alış-satış demək deyil. Çox vaxt walletlərarası köçürmə, birjaya giriş/çıxış və ya daxili balans yerdəyişməsi olur.";
  }

  const sizeNote = body.isAlert
    ? "Bu əməliyyat böyük həcmli olduğu üçün ayrıca diqqətə dəyər."
    : "Həcm orta səviyyədədir, ona görə kontekstə birlikdə baxmaq lazımdır.";

  return [
    `Nə baş verdi: ${walletName} ${amount} ${tokenLabel} üzrə ${action}. Təxmini dəyər ${usdValue}-dir.`,
    `Bu nə demək ola bilər: ${meaning}`,
    `Qısa nəticə: ${sizeNote}`,
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
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const fallback = buildLocalExplanation(body);

    if (!apiKey) {
      return NextResponse.json({ explanation: fallback, source: "local" });
    }

    const client = new Anthropic({ apiKey });
    const prompt = `Sən Solana whale transaction-larını sadə dildə izah edən analitiksən.

İstifadəçi texniki deyil. Qarışıq termin işlətmə. Cavabı sadə Azərbaycan dilində yaz.
3 qısa sətir yaz və bu formatı qoruyaraq cavab ver:
Nə baş verdi: ...
Bu nə demək ola bilər: ...
Qısa nəticə: ...

Qaydalar:
- Konkret ol, ümumi boş cümlələr yazma.
- Tokeni, həcmi, USD dəyərini və əməliyyat növünü mütləq qeyd et.
- Əgər bu transferdirsə, bunu alış/satış kimi təqdim etmə.
- Əgər əməliyyat böyükdürsə, bunun niyə diqqətə dəyər olduğunu de.
- Əmin olmadığın şeyi fakt kimi yazma; "ola bilər" de.
- Maksimum 75 söz.

Əməliyyat məlumatı:
- Wallet: ${walletLabel || walletAddress}
- Ünvan: ${walletAddress}
- Növ: ${type}
- Token: ${tokenName || tokenSymbol} (${tokenSymbol})
- Miqdar: ${formatAmount(amount)} ${tokenSymbol}
- USD dəyəri: ${formattedUSD}
- Vaxt: ${txDate}
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

      return NextResponse.json({ explanation, source: "anthropic" });
    } catch (error) {
      console.error(
        "Anthropic generation failed, using local fallback:",
        error,
      );
      return NextResponse.json({ explanation: fallback, source: "local" });
    }
  } catch (error) {
    console.error("Explain API error:", error);
    return NextResponse.json(
      { explanation: "Analiz qurula bilmədi.", source: "error" },
      { status: 500 },
    );
  }
}
