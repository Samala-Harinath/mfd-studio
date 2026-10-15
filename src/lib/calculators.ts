function monthlyRate(annualPercent: number) {
  return annualPercent / 12 / 100;
}

function finite(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

export function sipFutureValue(monthly: number, annualPercent: number, years: number) {
  const r = monthlyRate(annualPercent);
  const n = Math.max(0, Math.round(years * 12));
  if (n <= 0) return 0;
  if (r === 0) return monthly * n;
  return finite(monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));
}

export function lumpsumFutureValue(amount: number, annualPercent: number, years: number) {
  if (years <= 0) return Math.max(amount, 0);
  return finite(amount * Math.pow(1 + annualPercent / 100, years));
}

export function stepUpSip(monthly: number, annualPercent: number, years: number, stepUpPercent: number) {
  const r = monthlyRate(annualPercent);
  const wholeYears = Math.max(0, Math.round(years));
  let corpus = 0;
  let payment = monthly;
  let invested = 0;
  for (let year = 0; year < wholeYears; year += 1) {
    for (let month = 0; month < 12; month += 1) {
      corpus = (corpus + payment) * (1 + r);
      invested += payment;
    }
    payment *= 1 + stepUpPercent / 100;
  }
  return { corpus: finite(corpus), invested: finite(invested) };
}

export function swpProjection(corpus: number, withdrawal: number, annualPercent: number, years: number) {
  const r = monthlyRate(annualPercent);
  const months = Math.max(0, Math.round(years * 12));
  let left = corpus;
  let withdrawn = 0;
  let lasted = 0;
  for (let month = 0; month < months; month += 1) {
    left *= 1 + r;
    const take = Math.min(withdrawal, Math.max(left, 0));
    left -= take;
    withdrawn += take;
    lasted = month + 1;
    if (left <= 0) break;
  }
  return { left: Math.max(finite(left), 0), withdrawn: finite(withdrawn), lasted };
}

export function stpProjection(
  amount: number,
  transfer: number,
  sourceRate: number,
  targetRate: number,
  years: number,
) {
  const sourceMonthly = monthlyRate(sourceRate);
  const targetMonthly = monthlyRate(targetRate);
  const months = Math.max(0, Math.round(years * 12));
  let source = amount;
  let target = 0;
  let moved = 0;
  for (let month = 0; month < months; month += 1) {
    source *= 1 + sourceMonthly;
    const move = Math.min(transfer, Math.max(source, 0));
    source -= move;
    moved += move;
    target = (target + move) * (1 + targetMonthly);
  }
  return { source: finite(source), target: finite(target), total: finite(source + target), moved: finite(moved) };
}

export function requiredMonthlySip(goal: number, annualPercent: number, years: number) {
  const r = monthlyRate(annualPercent);
  const n = Math.max(0, Math.round(years * 12));
  if (n <= 0) return 0;
  if (r === 0) return goal / n;
  const factor = ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  return finite(goal / factor);
}

export function inflatedCost(present: number, inflationPercent: number, years: number) {
  return finite(present * Math.pow(1 + inflationPercent / 100, Math.max(years, 0)));
}

export function presentValue(future: number, annualPercent: number, years: number) {
  if (years <= 0) return future;
  return finite(future / Math.pow(1 + annualPercent / 100, years));
}

export function costOfDelay(monthly: number, annualPercent: number, years: number, delayYears: number) {
  const startingNow = sipFutureValue(monthly, annualPercent, years);
  const startingLater = sipFutureValue(monthly, annualPercent, Math.max(years - delayYears, 0));
  return { startingNow, startingLater, gap: startingNow - startingLater };
}

export function elssEstimate(investment: number, slabPercent: number) {
  const eligible = Math.min(Math.max(investment, 0), 150000);
  return {
    eligible,
    taxSaved: eligible * (slabPercent / 100),
    capped: investment > 150000,
  };
}

export function simpleInterest(principal: number, annualPercent: number, years: number) {
  const interest = principal * (annualPercent / 100) * Math.max(years, 0);
  return { interest: finite(interest), amount: finite(principal + interest) };
}

export function compoundInterest(
  principal: number,
  annualPercent: number,
  years: number,
  compoundsPerYear: number,
) {
  const n = Math.max(1, Math.round(compoundsPerYear));
  const amount = principal * Math.pow(1 + annualPercent / 100 / n, n * Math.max(years, 0));
  return { amount: finite(amount), interest: finite(amount - principal) };
}

export function cagr(start: number, end: number, years: number) {
  if (start <= 0 || years <= 0 || end < 0) return null;
  const rate = Math.pow(end / start, 1 / years) - 1;
  return Number.isFinite(rate) ? rate : null;
}

export function absoluteReturn(start: number, end: number) {
  if (start <= 0) return null;
  return (end - start) / start;
}

/** Starting corpus so an inflation-linked monthly withdrawal lasts `years`. */
export function corpusForInflatingWithdrawal(
  firstMonthly: number,
  annualReturn: number,
  inflationPercent: number,
  years: number,
) {
  const months = Math.max(0, Math.round(years * 12));
  if (months === 0 || firstMonthly <= 0) return 0;
  const r = monthlyRate(annualReturn);
  const g = monthlyRate(inflationPercent);

  function survives(start: number) {
    let left = start;
    let withdrawal = firstMonthly;
    for (let month = 0; month < months; month += 1) {
      left *= 1 + r;
      left -= withdrawal;
      if (left < 0) return false;
      withdrawal *= 1 + g;
    }
    return true;
  }

  let lo = 0;
  let hi = Math.max(firstMonthly, 1) * months;
  while (!survives(hi) && hi < 1e15) hi *= 2;
  for (let attempt = 0; attempt < 48; attempt += 1) {
    const mid = (lo + hi) / 2;
    if (survives(mid)) hi = mid;
    else lo = mid;
  }
  return finite(hi);
}

export function xirr(flows: { amount: number; when: Date }[]) {
  if (flows.length < 2) return null;
  const start = flows[0]?.when.getTime() ?? 0;
  const yearFraction = (when: Date) => (when.getTime() - start) / (365.25 * 24 * 60 * 60 * 1000);

  let rate = 0.1;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    let value = 0;
    let slope = 0;
    for (const flow of flows) {
      const years = yearFraction(flow.when);
      const base = Math.pow(1 + rate, years);
      if (!Number.isFinite(base) || base === 0) return null;
      value += flow.amount / base;
      slope += (-years * flow.amount) / (base * (1 + rate));
    }
    if (Math.abs(slope) < 1e-9) return null;
    const next = rate - value / slope;
    if (!Number.isFinite(next) || next <= -0.99) return null;
    if (Math.abs(next - rate) < 1e-7) return next;
    rate = next;
  }
  return Number.isFinite(rate) ? rate : null;
}

/** Monthly SIP cash flows versus a value on `end`. Amounts invested are negative. */
export function sipXirr(monthly: number, years: number, currentValue: number, end = new Date()) {
  const n = Math.max(0, Math.round(years * 12));
  if (n <= 0 || monthly <= 0) return null;
  const flows: { amount: number; when: Date }[] = [];
  for (let i = 0; i < n; i += 1) {
    const when = new Date(end.getTime());
    when.setMonth(when.getMonth() - (n - i));
    flows.push({ amount: -monthly, when });
  }
  flows.push({ amount: currentValue, when: end });
  return xirr(flows);
}
