export type SampleFund = {
  id: string;
  name: string;
  style: "Direct" | "Regular";
  category: string;
  nav: number;
  asOf: string;
  oneYear: number;
};

export const sampleFunds: SampleFund[] = [
  { id: "lc-r", name: "Sample Large Cap Fund", style: "Regular", category: "Equity · Large cap", nav: 48.32, asOf: "10 Oct 2026", oneYear: 12.4 },
  { id: "lc-d", name: "Sample Large Cap Fund", style: "Direct", category: "Equity · Large cap", nav: 51.08, asOf: "10 Oct 2026", oneYear: 13.1 },
  { id: "flex-r", name: "Sample Flexi Cap Fund", style: "Regular", category: "Equity · Flexi cap", nav: 32.15, asOf: "10 Oct 2026", oneYear: 9.8 },
  { id: "flex-d", name: "Sample Flexi Cap Fund", style: "Direct", category: "Equity · Flexi cap", nav: 34.02, asOf: "10 Oct 2026", oneYear: 10.4 },
  { id: "debt-r", name: "Sample Short Duration Fund", style: "Regular", category: "Debt · Short duration", nav: 18.44, asOf: "10 Oct 2026", oneYear: 6.2 },
  { id: "debt-d", name: "Sample Short Duration Fund", style: "Direct", category: "Debt · Short duration", nav: 18.71, asOf: "10 Oct 2026", oneYear: 6.5 },
  { id: "hybrid-r", name: "Sample Aggressive Hybrid Fund", style: "Regular", category: "Hybrid", nav: 27.9, asOf: "10 Oct 2026", oneYear: 8.1 },
  { id: "hybrid-d", name: "Sample Aggressive Hybrid Fund", style: "Direct", category: "Hybrid", nav: 29.14, asOf: "10 Oct 2026", oneYear: 8.6 },
];
