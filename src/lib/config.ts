export const TIERS = {
  free: {
    name: "Observer",
    price: 0,
    priceId: null,
    actionsPerDay: 5,
    features: ["5 screen actions/day", "Text-only understanding", "Manual approval"],
    description: "Try it out on simple tasks",
  },
  pro: {
    name: "Operator",
    price: 19,
    priceId: process.env.STRIPE_PRO_PRICE_ID || null,
    actionsPerDay: -1,
    features: ["Unlimited actions", "Full vision AI", "Auto-approve safe actions", "Custom workflows", "Priority support"],
    description: "For daily power users",
  },
  enterprise: {
    name: "Commander",
    price: 79,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || null,
    actionsPerDay: -1,
    features: ["Everything in Operator", "Multi-screen monitoring", "Team shared automations", "API access", "SSO & audit logs"],
    description: "For teams & heavy automation",
  },
} as const;

export type TierName = keyof typeof TIERS;
