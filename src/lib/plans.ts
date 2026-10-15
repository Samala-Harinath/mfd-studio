export type PlanId = "essential" | "growth" | "pro";

export type Plan = {
  id: PlanId;
  name: string;
  listPrice: number;
  launchPrice: number;
  amc: number;
  pages: number;
  users: number;
  aiCredit: number;
  summary: string;
  includes: string[];
};

export const plans: Plan[] = [
  {
    id: "essential",
    name: "Essential",
    listPrice: 64999,
    launchPrice: 49999,
    amc: 15000,
    pages: 8,
    users: 1,
    aiCredit: 0,
    summary: "A branded site, calculators, and an enquiry inbox.",
    includes: [
      "Website up to 8 pages",
      "Built for you, with onboarding",
      "Calculators, fund search, and sample NAV",
      "Enquiry form and lead inbox",
      "SEO basics and compliance pack",
      "1 user · email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    listPrice: 129999,
    launchPrice: 99999,
    amc: 30000,
    pages: 15,
    users: 3,
    aiCredit: 500,
    summary: "Everything in Essential, plus a blog, more pages, and website chat.",
    includes: [
      "Everything in Essential",
      "Up to 15 pages and a blog",
      "XIRR calculator",
      "Website AI chat",
      "AEO toolkit and monthly report — coming soon",
      "₹500 / month AI credit · 3 users",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    listPrice: 193999,
    launchPrice: 149000,
    amc: 44700,
    pages: 25,
    users: 10,
    aiCredit: 1500,
    summary: "The full console, team pages, and a larger AI wallet.",
    includes: [
      "Everything in Growth",
      "Up to 25 pages",
      "EUIN team pages",
      "Website voice and phone AI — coming soon",
      "Portfolio review — coming soon",
      "₹1,500 / month AI credit · 10 users",
    ],
  },
];

export function getPlan(id: PlanId) {
  return plans.find((plan) => plan.id === id) ?? plans[0];
}

export const optionalServices = [
  {
    name: "Premium custom design",
    detail: "A design made for your brand, beyond the standard templates.",
    price: "₹19,999 one-time",
  },
  {
    name: "Phone helpline number setup",
    detail: "Number provisioning and AI helpline configuration (Pro).",
    price: "₹4,999 + number rental at cost",
  },
  {
    name: "Managed content",
    detail: "Four investor-education posts a month, written for your approval.",
    price: "₹2,999 per month",
  },
  {
    name: "Custom integration",
    detail: "Connect a CRM or back-office tool. Scoped before any work starts.",
    price: "From ₹25,000",
  },
];

export const modules = [
  { name: "Branded website", group: "All plans", soon: false },
  { name: "Calculators", group: "All plans", soon: false },
  { name: "Lead inbox", group: "All plans", soon: false },
  { name: "SEO toolkit", group: "All plans", soon: false },
  { name: "Compliance pack", group: "All plans", soon: false },
  { name: "Website AI chat", group: "Growth & Pro", soon: false },
  { name: "WhatsApp AI", group: "Growth & Pro", soon: true },
  { name: "Meeting booking", group: "Growth & Pro", soon: true },
  { name: "AEO toolkit", group: "Growth & Pro", soon: true },
  { name: "Monthly reports", group: "Growth & Pro", soon: true },
  { name: "Website voice", group: "Pro", soon: true },
  { name: "Phone AI helpline", group: "Pro", soon: true },
  { name: "Email nurture", group: "Pro", soon: true },
  { name: "Instagram AI", group: "Pro", soon: true },
  { name: "Content agent", group: "Pro", soon: true },
  { name: "Team pages", group: "Pro", soon: false },
] as const;

export function hasBlog(plan: PlanId) {
  return plan !== "essential";
}

export function hasAiChat(plan: PlanId) {
  return plan !== "essential";
}

export function hasXirr(plan: PlanId) {
  return plan !== "essential";
}

export function hasTeam(plan: PlanId) {
  return plan === "pro";
}
