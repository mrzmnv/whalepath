"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get("session")?.value);
  if (!session?.userId || session?.role !== "admin")
    throw new Error("Unauthorized");
}

export async function addWhale(formData: FormData) {
  await requireAdmin();

  const address = formData.get("address") as string;
  const label = formData.get("label") as string;
  const category = formData.get("category") as string;
  const tagsStr = formData.get("tags") as string;
  const tags = tagsStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!address || !label) throw new Error("Missing address or label");

  await prisma.whale.create({
    data: { address, label, category, tags },
  });

  revalidatePath("/admin/whales");
  revalidatePath("/");
}

export async function deleteWhale(address: string) {
  await requireAdmin();

  await prisma.whale.delete({
    where: { address },
  });

  revalidatePath("/admin/whales");
  revalidatePath("/");
}

export async function bulkAddWhales(formData: FormData) {
  await requireAdmin();

  const raw = formData.get("bulk") as string;
  const category = (formData.get("category") as string) || "";
  const tagsStr = (formData.get("tags") as string) || "";
  const tags = tagsStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Solana address: 32-44 base58 chars (no whitespace)
  const isSolanaAddress = (s: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s);

  const entries: { address: string; label: string }[] = [];
  for (const line of lines) {
    let address = "";
    let label = "";

    if (line.includes(",")) {
      // comma format: could be "address,label" or "label,address"
      const parts = line.split(",").map((p) => p.trim());
      if (isSolanaAddress(parts[0])) {
        address = parts[0];
        label = parts.slice(1).join(" ").trim();
      } else if (isSolanaAddress(parts[parts.length - 1])) {
        address = parts[parts.length - 1];
        label = parts.slice(0, -1).join(" ").trim();
      }
    } else {
      // space format: "address label" OR "label name address" (Solscan style)
      const parts = line.split(/\s+/);
      if (isSolanaAddress(parts[0])) {
        // "ADDRESS label words..."
        address = parts[0];
        label = parts.slice(1).join(" ").trim();
      } else if (isSolanaAddress(parts[parts.length - 1])) {
        // "Label Name ADDRESS" (Solscan copy-paste)
        address = parts[parts.length - 1];
        label = parts.slice(0, -1).join(" ").trim();
      } else {
        // no valid address found — skip line
        continue;
      }
    }

    if (!label) label = address.slice(0, 8) + "...";
    if (address) entries.push({ address, label });
  }

  if (entries.length === 0) throw new Error("No valid Solana addresses found. Use format: ADDRESS Label  OR  Label Name ADDRESS");

  await prisma.$transaction(
    entries.map((e) =>
      prisma.whale.upsert({
        where: { address: e.address },
        update: { label: e.label, category, tags },
        create: { address: e.address, label: e.label, category, tags },
      })
    )
  );

  revalidatePath("/admin/whales");
  revalidatePath("/");
}

export async function updateWhale(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const label = formData.get("label") as string;
  const category = (formData.get("category") as string) || "";
  const tagsStr = (formData.get("tags") as string) || "";
  const tags = tagsStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!id || !label) throw new Error("Missing id or label");

  await prisma.whale.update({
    where: { id },
    data: { label, category, tags },
  });

  revalidatePath("/admin/whales");
  revalidatePath("/");
}

export async function clearAllTags() {
  await requireAdmin();
  await prisma.whale.updateMany({ data: { tags: [] } });
  revalidatePath("/admin/whales");
  revalidatePath("/");
}

export async function resetWhalesToDefaults() {
  await requireAdmin();

  // Read the default whale list bundled with the app
  const defaults: Array<{ address: string; label: string; category: string; tags: string[] }> = [
    { address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", label: "Jump Trading", category: "market-maker", tags: ["mm", "institutional"] },
    { address: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1", label: "Raydium AMM v4", category: "protocol", tags: ["dex", "amm"] },
    { address: "AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2", label: "Alameda Research (Legacy)", category: "fund", tags: ["defunct", "historical"] },
    { address: "GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ", label: "Wintermute Trading", category: "market-maker", tags: ["mm", "institutional"] },
    { address: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs", label: "Coinbase Prime", category: "exchange", tags: ["cex", "custody"] },
    { address: "FWznbcNXWQuHTawe9RxvQ2LdCENssh12dsznf4RiouN5", label: "OKX Hot Wallet", category: "exchange", tags: ["cex", "high-volume"] },
    { address: "3yFwqXBfZY4jBVUafQ1YEXWtSh7RJBGG6FSayt3MZQMR", label: "Multicoin Capital", category: "fund", tags: ["vc", "institutional"] },
    { address: "8sLbNZoA1cfnvMJLPfp98ZLAnFSYCFApfJKMbiXNLwxj", label: "Solana Foundation", category: "foundation", tags: ["foundation", "staking"] },
    { address: "2ojv9BAiHUrvsm9gxDe7fJSzbNZSJcxZvf8dqmWGHG8S", label: "Kraken Exchange", category: "exchange", tags: ["cex"] },
    { address: "HVh6wHNBAsnt3zta29FHrouXFjPHoqCHMHcWBkzZnxHi", label: "DRW Cumberland", category: "market-maker", tags: ["mm", "otc"] },
    { address: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8", label: "Raydium AMM", category: "protocol", tags: ["dex", "amm"] },
    { address: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4", label: "Jupiter Aggregator v6", category: "protocol", tags: ["dex", "aggregator"] },
    { address: "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB", label: "Jupiter Aggregator v4", category: "protocol", tags: ["dex", "aggregator"] },
    { address: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc", label: "Orca Whirlpool", category: "protocol", tags: ["dex", "clmm"] },
    { address: "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin", label: "OpenBook DEX v3", category: "protocol", tags: ["dex", "orderbook"] },
    { address: "PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY", label: "Phoenix DEX", category: "protocol", tags: ["dex", "orderbook"] },
  ];

  await prisma.$transaction(
    defaults.map((w) =>
      prisma.whale.upsert({
        where: { address: w.address },
        update: { label: w.label, category: w.category, tags: w.tags },
        create: w,
      })
    )
  );

  revalidatePath("/admin/whales");
  revalidatePath("/");
}
