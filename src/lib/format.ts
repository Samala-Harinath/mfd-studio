export function inr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function inrExact(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export const MARKET_RISK =
  "Mutual fund investments are subject to market risks. Read all scheme-related documents carefully. Past performance is not a guide to future performance. Calculator results are estimates from the numbers you type. They are not a promise, a ranking, or a scheme recommendation.";

export const AMFI_LINE = "AMFI-registered Mutual Fund Distributor";

export const RESTRICTED_TERMS = ["adviser", "advisor", "wealth manager"];

export function findRestrictedTerm(value: string) {
  const lower = value.toLowerCase();
  return RESTRICTED_TERMS.find((term) => lower.includes(term));
}
