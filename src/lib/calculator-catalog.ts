import { hasXirr, type PlanId } from "@/lib/plans";

export const CALCULATOR_IDS = [
  "sip",
  "step-up-sip",
  "lumpsum",
  "swp",
  "stp",
  "goal-sip",
  "retirement",
  "education",
  "home",
  "marriage",
  "inflation",
  "present-value",
  "delay",
  "elss",
  "compound-interest",
  "simple-interest",
  "cagr",
  "mf-return",
  "sip-performance",
  "xirr",
] as const;

export type CalculatorId = (typeof CALCULATOR_IDS)[number];

export type CalculatorCategory = "invest" | "withdraw" | "goals" | "planning" | "returns";

export type CalculatorIcon =
  | "calendar-plus"
  | "trending-up"
  | "wallet"
  | "banknote"
  | "arrow-left-right"
  | "target"
  | "armchair"
  | "graduation-cap"
  | "home"
  | "heart"
  | "flame"
  | "undo-2"
  | "timer"
  | "receipt"
  | "layers"
  | "percent"
  | "line-chart"
  | "pie-chart"
  | "activity"
  | "sigma";

export type CalculatorDef = {
  id: CalculatorId;
  label: string;
  shortLabel: string;
  description: string;
  category: CalculatorCategory;
  icon: CalculatorIcon;
  /** When set, only that plan and above can publish this calculator. */
  minPlan?: PlanId;
};

export const CALCULATOR_CATEGORIES: { id: CalculatorCategory; label: string }[] = [
  { id: "invest", label: "Systematic investing" },
  { id: "withdraw", label: "Withdrawals & transfers" },
  { id: "goals", label: "Goals" },
  { id: "planning", label: "Planning" },
  { id: "returns", label: "Returns & interest" },
];

export const CALCULATOR_CATALOG: CalculatorDef[] = [
  {
    id: "sip",
    label: "SIP calculator",
    shortLabel: "SIP",
    description: "Invest a fixed amount every month and see an estimated future value.",
    category: "invest",
    icon: "calendar-plus",
  },
  {
    id: "step-up-sip",
    label: "Step-up SIP",
    shortLabel: "Step-up SIP",
    description: "Raise the monthly amount each year and estimate how the corpus changes.",
    category: "invest",
    icon: "trending-up",
  },
  {
    id: "lumpsum",
    label: "Lumpsum calculator",
    shortLabel: "Lumpsum",
    description: "Estimate the maturity value of a one-time investment over a chosen tenure.",
    category: "invest",
    icon: "wallet",
  },
  {
    id: "goal-sip",
    label: "Goal SIP",
    shortLabel: "Goal SIP",
    description: "Work backwards from a target amount to the monthly SIP that could reach it.",
    category: "invest",
    icon: "target",
  },
  {
    id: "swp",
    label: "SWP / regular payout",
    shortLabel: "SWP",
    description: "See how regular withdrawals can draw down a starting corpus over time.",
    category: "withdraw",
    icon: "banknote",
  },
  {
    id: "stp",
    label: "STP calculator",
    shortLabel: "STP",
    description: "Move a fixed amount each month from a source to a target and estimate both sides.",
    category: "withdraw",
    icon: "arrow-left-right",
  },
  {
    id: "retirement",
    label: "Retirement planning",
    shortLabel: "Retirement",
    description: "Estimate a retirement corpus from today’s expenses, inflation, and years left to invest.",
    category: "goals",
    icon: "armchair",
  },
  {
    id: "education",
    label: "Cost of child education",
    shortLabel: "Education",
    description: "Inflate today’s education cost and see a monthly SIP that could fund it.",
    category: "goals",
    icon: "graduation-cap",
  },
  {
    id: "home",
    label: "Home goal",
    shortLabel: "Home",
    description: "Estimate the monthly SIP that could reach a future home down-payment or cost.",
    category: "goals",
    icon: "home",
  },
  {
    id: "marriage",
    label: "Marriage goal",
    shortLabel: "Marriage",
    description: "Plan a future wedding cost with inflation and a monthly investment estimate.",
    category: "goals",
    icon: "heart",
  },
  {
    id: "inflation",
    label: "Impact of inflation",
    shortLabel: "Inflation",
    description: "See what a cost today may look like after years of price rise.",
    category: "planning",
    icon: "flame",
  },
  {
    id: "present-value",
    label: "Present value",
    shortLabel: "Present value",
    description: "Find what a future amount is worth in today’s rupees at a rate you assume.",
    category: "planning",
    icon: "undo-2",
  },
  {
    id: "delay",
    label: "Cost of delay",
    shortLabel: "Cost of delay",
    description: "Compare starting a SIP now with waiting a few years, using the same monthly amount.",
    category: "planning",
    icon: "timer",
  },
  {
    id: "elss",
    label: "ELSS tax illustration",
    shortLabel: "ELSS",
    description: "An old-regime illustration of tax saved on ELSS up to ₹1,50,000. Not tax advice.",
    category: "planning",
    icon: "receipt",
  },
  {
    id: "compound-interest",
    label: "Compound interest",
    shortLabel: "Compound interest",
    description: "See interest earned when returns are added back at a compounding frequency you choose.",
    category: "returns",
    icon: "layers",
  },
  {
    id: "simple-interest",
    label: "Simple interest",
    shortLabel: "Simple interest",
    description: "Interest on the original principal only, with no compounding.",
    category: "returns",
    icon: "percent",
  },
  {
    id: "cagr",
    label: "CAGR calculator",
    shortLabel: "CAGR",
    description: "The constant yearly rate that takes a starting value to an ending value over a period.",
    category: "returns",
    icon: "line-chart",
  },
  {
    id: "mf-return",
    label: "Mutual fund return",
    shortLabel: "Fund return",
    description: "Absolute gain and annualised return from an amount invested and its value today.",
    category: "returns",
    icon: "pie-chart",
  },
  {
    id: "sip-performance",
    label: "SIP performance",
    shortLabel: "SIP performance",
    description: "Review the outcome of monthly investments against the value of those units today.",
    category: "returns",
    icon: "activity",
  },
  {
    id: "xirr",
    label: "XIRR calculator",
    shortLabel: "XIRR",
    description: "An annualised return from irregular cash flows and dates you type.",
    category: "returns",
    icon: "sigma",
    minPlan: "growth",
  },
];

export const CALCULATOR_OPTIONS = CALCULATOR_CATALOG.map((item) => ({
  label: item.label,
  value: item.id,
}));

export function isCalculatorId(value: unknown): value is CalculatorId {
  return typeof value === "string" && (CALCULATOR_IDS as readonly string[]).includes(value);
}

export function calculatorById(id: string | undefined | null) {
  if (!id) return undefined;
  return CALCULATOR_CATALOG.find((item) => item.id === id);
}

export function planAllowsCalculator(item: CalculatorDef, plan: PlanId) {
  if (item.minPlan === "growth" || item.id === "xirr") return hasXirr(plan);
  if (item.minPlan === "pro") return plan === "pro";
  return true;
}

export function defaultEnabledCalculators(plan: PlanId): CalculatorId[] {
  return CALCULATOR_CATALOG.filter((item) => planAllowsCalculator(item, plan)).map((item) => item.id);
}

/** Public website list: only plan-allowed tools the MFD has switched on. */
export function visibleCalculators(input: {
  plan: PlanId;
  enabledCalculators?: CalculatorId[] | null;
}): CalculatorDef[] {
  const allowed = CALCULATOR_CATALOG.filter((item) => planAllowsCalculator(item, input.plan));
  if (input.enabledCalculators == null) return allowed;
  const enabled = new Set(input.enabledCalculators);
  return allowed.filter((item) => enabled.has(item.id));
}

export function parseEnabledCalculators(value: unknown): CalculatorId[] | null {
  if (!Array.isArray(value)) return null;
  const ids = value.filter(isCalculatorId);
  return [...new Set(ids)];
}

export function sanitiseEnabledCalculators(value: unknown, plan: PlanId): CalculatorId[] | null {
  const parsed = parseEnabledCalculators(value);
  if (!parsed) return null;
  const allowed = new Set(defaultEnabledCalculators(plan));
  return parsed.filter((id) => allowed.has(id));
}
