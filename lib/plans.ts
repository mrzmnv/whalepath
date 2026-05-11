export type PlanId = "free" | "pro" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // USD/month, 0 = free
  watchlistLimit: number;
  telegramAlerts: boolean;
  features: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    watchlistLimit: 5,
    telegramAlerts: false,
    features: [
      "5 wallet watchlist",
      "Live feed (all 50 whales)",
      "Token heat map",
      "Wallet detail pages",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 9,
    watchlistLimit: 25,
    telegramAlerts: false,
    features: [
      "25 wallet watchlist",
      "Live feed (all 50 whales)",
      "Token heat map",
      "Wallet detail pages",
      "Priority support",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 19,
    watchlistLimit: Infinity,
    telegramAlerts: true,
    features: [
      "Unlimited wallet watchlist",
      "Live feed (all 50 whales)",
      "Token heat map",
      "Wallet detail pages",
      "Telegram bot alerts",
      "Priority support",
    ],
  },
};

export function getPlanLimit(plan: string): number {
  return PLANS[(plan as PlanId) ?? "free"]?.watchlistLimit ?? 5;
}
