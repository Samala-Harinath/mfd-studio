import { describe, expect, it } from "vitest";
import {
  cagr,
  compoundInterest,
  inflatedCost,
  lumpsumFutureValue,
  presentValue,
  requiredMonthlySip,
  simpleInterest,
  sipFutureValue,
  xirr,
} from "@/lib/calculators";

describe("calculator math", () => {
  it("grows a monthly SIP as an annuity due", () => {
    const future = sipFutureValue(5000, 12, 10);
    expect(future).toBeGreaterThan(11_60_000);
    expect(future).toBeLessThan(11_70_000);
  });

  it("inverts SIP future value to a required monthly amount", () => {
    const future = sipFutureValue(8000, 10, 15);
    const monthly = requiredMonthlySip(future, 10, 15);
    expect(monthly).toBeCloseTo(8000, 0);
  });

  it("compounds a lumpsum yearly", () => {
    expect(lumpsumFutureValue(100000, 10, 2)).toBeCloseTo(121000, 0);
  });

  it("inflates a present cost", () => {
    expect(inflatedCost(100000, 6, 1)).toBeCloseTo(106000, 0);
  });

  it("discounts a future amount to present value", () => {
    expect(presentValue(121000, 10, 2)).toBeCloseTo(100000, 0);
  });

  it("computes simple and compound interest", () => {
    expect(simpleInterest(100000, 10, 2).interest).toBe(20000);
    expect(compoundInterest(100000, 10, 2, 1).amount).toBeCloseTo(121000, 0);
  });

  it("computes CAGR", () => {
    const rate = cagr(100, 121, 2);
    expect(rate).not.toBeNull();
    expect(rate! * 100).toBeCloseTo(10, 5);
  });

  it("solves XIRR for a two-year round trip", () => {
    const rate = xirr([
      { amount: -100000, when: new Date("2024-01-01") },
      { amount: 121000, when: new Date("2026-01-01") },
    ]);
    expect(rate).not.toBeNull();
    expect(rate! * 100).toBeCloseTo(10, 1);
  });
});
