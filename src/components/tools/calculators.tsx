"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Armchair,
  ArrowLeft,
  ArrowLeftRight,
  Banknote,
  CalendarPlus,
  Flame,
  GraduationCap,
  Heart,
  Home,
  Layers,
  LineChart,
  Percent,
  PieChart,
  Receipt,
  Sigma,
  Target,
  Timer,
  TrendingUp,
  Undo2,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  absoluteReturn,
  cagr,
  compoundInterest,
  corpusForInflatingWithdrawal,
  costOfDelay,
  elssEstimate,
  inflatedCost,
  lumpsumFutureValue,
  presentValue,
  requiredMonthlySip,
  simpleInterest,
  sipFutureValue,
  sipXirr,
  stepUpSip,
  stpProjection,
  swpProjection,
  xirr,
} from "@/lib/calculators";
import {
  CALCULATOR_CATEGORIES,
  calculatorById,
  visibleCalculators,
  type CalculatorDef,
  type CalculatorIcon,
  type CalculatorId,
} from "@/lib/calculator-catalog";
import { inr, MARKET_RISK } from "@/lib/format";
import type { PlanId } from "@/lib/plans";
import { cn } from "@/components/ui/ui";

const ICONS: Record<CalculatorIcon, LucideIcon> = {
  "calendar-plus": CalendarPlus,
  "trending-up": TrendingUp,
  wallet: Wallet,
  banknote: Banknote,
  "arrow-left-right": ArrowLeftRight,
  target: Target,
  armchair: Armchair,
  "graduation-cap": GraduationCap,
  home: Home,
  heart: Heart,
  flame: Flame,
  "undo-2": Undo2,
  timer: Timer,
  receipt: Receipt,
  layers: Layers,
  percent: Percent,
  "line-chart": LineChart,
  "pie-chart": PieChart,
  activity: Activity,
  sigma: Sigma,
};

export function CalculatorIconMark({
  icon,
  colour,
  className,
}: {
  icon: CalculatorIcon;
  colour: string;
  className?: string;
}) {
  const Icon = ICONS[icon];
  return (
    <span
      className={cn("inline-flex h-11 w-11 items-center justify-center rounded-xl", className)}
      style={{ background: `${colour}18`, color: colour }}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </span>
  );
}

export function CalculatorPanel({
  slug,
  plan,
  colour,
  enabledCalculators,
  toolId,
}: {
  slug: string;
  plan: PlanId;
  colour: string;
  enabledCalculators?: CalculatorId[] | null;
  toolId?: string;
}) {
  const items = visibleCalculators({ plan, enabledCalculators });
  const active = calculatorById(toolId);
  const allowed = active && items.some((item) => item.id === active.id) ? active : undefined;
  const base = `/site/${slug}/calculators`;

  if (items.length === 0) {
    return (
      <div className="rounded-(--site-radius-card) border border-line bg-(--site-surface) px-6 py-16 text-center">
        <h2 className="font-display text-xl font-semibold">Calculators are not published yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-body">
          This distributor has not switched any calculators on. Estimates will appear here once they do.
        </p>
      </div>
    );
  }

  if (toolId && !allowed) {
    return (
      <div className="rounded-(--site-radius-card) border border-line bg-(--site-surface) px-6 py-16 text-center">
        <h2 className="font-display text-xl font-semibold">This calculator is not available</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-body">
          It may have been switched off, or it is not included on this plan.
        </p>
        <Link href={base} className="mt-5 inline-flex text-sm font-semibold" style={{ color: colour }}>
          See available calculators
        </Link>
      </div>
    );
  }

  if (!allowed) {
    return <CalculatorHub slug={slug} items={items} colour={colour} />;
  }

  return <CalculatorWorkspace slug={slug} item={allowed} colour={colour} />;
}

function CalculatorHub({ slug, items, colour }: { slug: string; items: CalculatorDef[]; colour: string }) {
  const grouped = CALCULATOR_CATEGORIES.map((category) => ({
    ...category,
    items: items.filter((item) => item.category === category.id),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-10">
      {grouped.map((group) => (
        <section key={group.id}>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{group.label}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {group.items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/site/${slug}/calculators/${item.id}`}
                  className="group flex h-full gap-4 rounded-(--site-radius-card) border border-line bg-(--site-surface) p-4 transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
                >
                  <CalculatorIconMark icon={item.icon} colour={colour} />
                  <span className="min-w-0">
                    <span className="block font-display text-base font-semibold text-ink group-hover:underline" style={{ textDecorationColor: colour }}>
                      {item.label}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-body">{item.description}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function CalculatorWorkspace({ slug, item, colour }: { slug: string; item: CalculatorDef; colour: string }) {
  const router = useRouter();
  const result = useCalculator(item.id);

  return (
    <div>
      <Link
        href={`/site/${slug}/calculators`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-body hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All calculators
      </Link>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <section className="rounded-(--site-radius-card) border border-line bg-(--site-surface) p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex items-start gap-3">
            <CalculatorIconMark icon={item.icon} colour={colour} />
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">{item.label}</h2>
              <p className="mt-1 text-sm leading-6 text-body">{item.description}</p>
            </div>
          </div>
          <div className="mt-6 space-y-5">{result.fields}</div>
        </section>

        <section
          className="rounded-(--site-radius-card) p-5 text-white shadow-[0_16px_40px_rgba(15,23,42,0.16)] sm:p-6"
          style={{ background: `linear-gradient(165deg, ${colour} 0%, color-mix(in srgb, ${colour} 72%, #0f172a) 100%)` }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">Estimated result</p>
          <p className="mt-3 font-display text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">{result.headline}</p>
          <p className="mt-3 text-sm leading-6 text-white/85">{result.detail}</p>
          {result.mix ? <MixBar invested={result.mix.invested} future={result.mix.future} /> : null}
          {result.stats.length ? (
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              {result.stats.map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white/12 px-3.5 py-3 backdrop-blur-sm">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-white/70">{stat.label}</dt>
                  <dd className="mt-1 font-display text-lg font-semibold tabular-nums">{stat.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <p className="mt-5 text-[11px] leading-4 text-white/65">{MARKET_RISK}</p>
          <button
            type="button"
            className="mt-5 inline-flex h-11 items-center rounded-(--site-radius-button) bg-white px-5 text-sm font-semibold"
            style={{ color: colour }}
            onClick={() => router.push(`/site/${slug}/contact?topic=${encodeURIComponent(item.label)}`)}
          >
            Discuss this with your distributor
          </button>
        </section>
      </div>
    </div>
  );
}

function MixBar({ invested, future }: { invested: number; future: number }) {
  const gain = Math.max(future - invested, 0);
  const total = Math.max(future, invested, 1);
  const investedPct = Math.min(100, (Math.max(invested, 0) / total) * 100);
  return (
    <div className="mt-6">
      <div className="flex h-3 overflow-hidden rounded-full bg-white/20">
        <span className="bg-white" style={{ width: `${investedPct}%` }} />
        <span className="bg-white/45" style={{ width: `${100 - investedPct}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-white/80">
        <span>Invested {inr(invested)}</span>
        <span>Estimated gain {inr(gain)}</span>
      </div>
    </div>
  );
}

type CalcResult = {
  fields: ReactNode;
  headline: string;
  detail: string;
  stats: { label: string; value: string }[];
  mix?: { invested: number; future: number };
};

function useCalculator(id: CalculatorId): CalcResult {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [step, setStep] = useState(10);
  const [corpus, setCorpus] = useState(500000);
  const [withdrawal, setWithdrawal] = useState(8000);
  const [transfer, setTransfer] = useState(10000);
  const [sourceRate, setSourceRate] = useState(6);
  const [goal, setGoal] = useState(2500000);
  const [delay, setDelay] = useState(2);
  const [inflation, setInflation] = useState(6);
  const [present, setPresent] = useState(2000000);
  const [elssAmount, setElssAmount] = useState(150000);
  const [slab, setSlab] = useState(30);
  const [existing, setExisting] = useState(0);
  const [age, setAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [retireYears, setRetireYears] = useState(20);
  const [expense, setExpense] = useState(50000);
  const [compounds, setCompounds] = useState(4);
  const [startValue, setStartValue] = useState(100000);
  const [endValue, setEndValue] = useState(180000);
  const [flows, setFlows] = useState([
    { id: "in", date: "2021-10-01", amount: 100000, kind: "invest" as const },
    { id: "out", date: "2026-10-01", amount: 148000, kind: "value" as const },
  ]);

  return useMemo(() => {
    if (id === "sip") {
      const invested = monthly * years * 12;
      const future = sipFutureValue(monthly, rate, years);
      return {
        fields: (
          <>
            <SliderField label="Monthly SIP" value={monthly} min={500} max={200000} step={500} onChange={setMonthly} prefix="₹" />
            <SliderField label="Expected yearly return" value={rate} min={1} max={20} step={0.5} onChange={setRate} suffix="%" />
            <SliderField label="Tenure" value={years} min={1} max={40} step={1} onChange={setYears} suffix="yrs" />
          </>
        ),
        headline: inr(future),
        detail: `If ₹${monthly.toLocaleString("en-IN")} is invested every month for ${years} years at ${rate}% a year.`,
        stats: [
          { label: "Amount invested", value: inr(invested) },
          { label: "Estimated gains", value: inr(Math.max(future - invested, 0)) },
        ],
        mix: { invested, future },
      };
    }

    if (id === "step-up-sip") {
      const result = stepUpSip(monthly, rate, years, step);
      return {
        fields: (
          <>
            <SliderField label="Starting monthly SIP" value={monthly} min={500} max={200000} step={500} onChange={setMonthly} prefix="₹" />
            <SliderField label="Yearly step-up" value={step} min={0} max={25} step={1} onChange={setStep} suffix="%" />
            <SliderField label="Expected yearly return" value={rate} min={1} max={20} step={0.5} onChange={setRate} suffix="%" />
            <SliderField label="Tenure" value={years} min={1} max={40} step={1} onChange={setYears} suffix="yrs" />
          </>
        ),
        headline: inr(result.corpus),
        detail: `The monthly amount rises by ${step}% each year. The rate is an assumption you typed.`,
        stats: [
          { label: "Amount invested", value: inr(result.invested) },
          { label: "Estimated gains", value: inr(Math.max(result.corpus - result.invested, 0)) },
        ],
        mix: { invested: result.invested, future: result.corpus },
      };
    }

    if (id === "lumpsum") {
      const future = lumpsumFutureValue(corpus, rate, years);
      return {
        fields: (
          <>
            <SliderField label="One-time amount" value={corpus} min={1000} max={10000000} step={1000} onChange={setCorpus} prefix="₹" />
            <SliderField label="Expected yearly return" value={rate} min={1} max={20} step={0.5} onChange={setRate} suffix="%" />
            <SliderField label="Tenure" value={years} min={1} max={40} step={1} onChange={setYears} suffix="yrs" />
          </>
        ),
        headline: inr(future),
        detail: `${inr(corpus)} growing at ${rate}% a year for ${years} years. Markets do not grow in a straight line.`,
        stats: [{ label: "Estimated gains", value: inr(Math.max(future - corpus, 0)) }],
        mix: { invested: corpus, future },
      };
    }

    if (id === "swp") {
      const swp = swpProjection(corpus, withdrawal, rate, years);
      return {
        fields: (
          <>
            <SliderField label="Starting corpus" value={corpus} min={50000} max={20000000} step={10000} onChange={setCorpus} prefix="₹" />
            <SliderField label="Monthly withdrawal" value={withdrawal} min={500} max={200000} step={500} onChange={setWithdrawal} prefix="₹" />
            <SliderField label="Expected yearly return" value={rate} min={0} max={16} step={0.5} onChange={setRate} suffix="%" />
            <SliderField label="Years to run" value={years} min={1} max={40} step={1} onChange={setYears} suffix="yrs" />
          </>
        ),
        headline: inr(swp.left),
        detail: `About ${inr(swp.withdrawn)} withdrawn over ${swp.lasted} months. Remaining corpus is an estimate.`,
        stats: [
          { label: "Total withdrawn", value: inr(swp.withdrawn) },
          { label: "Months lasted", value: String(swp.lasted) },
        ],
      };
    }

    if (id === "stp") {
      const stp = stpProjection(corpus, transfer, sourceRate, rate, years);
      return {
        fields: (
          <>
            <SliderField label="Starting amount in source" value={corpus} min={50000} max={20000000} step={10000} onChange={setCorpus} prefix="₹" />
            <SliderField label="Monthly transfer" value={transfer} min={500} max={200000} step={500} onChange={setTransfer} prefix="₹" />
            <SliderField label="Source yearly rate" value={sourceRate} min={0} max={16} step={0.5} onChange={setSourceRate} suffix="%" />
            <SliderField label="Target yearly rate" value={rate} min={1} max={20} step={0.5} onChange={setRate} suffix="%" />
            <SliderField label="Tenure" value={years} min={1} max={30} step={1} onChange={setYears} suffix="yrs" />
          </>
        ),
        headline: inr(stp.total),
        detail: `Source left ${inr(stp.source)}. Target grows to about ${inr(stp.target)}.`,
        stats: [
          { label: "Moved across", value: inr(stp.moved) },
          { label: "Source remaining", value: inr(stp.source) },
        ],
      };
    }

    if (id === "goal-sip" || id === "home" || id === "marriage") {
      const labels = { "goal-sip": "this goal", home: "a home", marriage: "a marriage" } as const;
      const futureExisting = lumpsumFutureValue(existing, rate, years);
      const gap = Math.max(goal - futureExisting, 0);
      const sip = requiredMonthlySip(gap, rate, years);
      return {
        fields: (
          <>
            <SliderField label="Target amount" value={goal} min={50000} max={50000000} step={50000} onChange={setGoal} prefix="₹" />
            <SliderField label="Already saved" value={existing} min={0} max={20000000} step={5000} onChange={setExisting} prefix="₹" />
            <SliderField label="Expected yearly return" value={rate} min={1} max={20} step={0.5} onChange={setRate} suffix="%" />
            <SliderField label="Years to the goal" value={years} min={1} max={40} step={1} onChange={setYears} suffix="yrs" />
          </>
        ),
        headline: `${inr(sip)} / month`,
        detail: `A monthly SIP that could reach ${inr(goal)} for ${labels[id]} in ${years} years, if the assumed rate holds.`,
        stats: [
          { label: "Existing savings later", value: inr(futureExisting) },
          { label: "Gap to fund", value: inr(gap) },
        ],
      };
    }

    if (id === "retirement") {
      const yearsToGo = Math.max(retireAge - age, 0);
      const futureExpense = inflatedCost(expense, inflation, yearsToGo);
      const needed = corpusForInflatingWithdrawal(futureExpense, rate, inflation, retireYears);
      const existingLater = lumpsumFutureValue(existing, rate, yearsToGo);
      const gap = Math.max(needed - existingLater, 0);
      const sip = requiredMonthlySip(gap, rate, yearsToGo || 1);
      return {
        fields: (
          <>
            <SliderField label="Current age" value={age} min={18} max={70} step={1} onChange={setAge} suffix="yrs" />
            <SliderField label="Retirement age" value={retireAge} min={Math.max(age + 1, 40)} max={80} step={1} onChange={setRetireAge} suffix="yrs" />
            <SliderField label="Monthly expenses today" value={expense} min={10000} max={500000} step={1000} onChange={setExpense} prefix="₹" />
            <SliderField label="Inflation" value={inflation} min={2} max={12} step={0.5} onChange={setInflation} suffix="%" />
            <SliderField label="Expected yearly return" value={rate} min={4} max={16} step={0.5} onChange={setRate} suffix="%" />
            <SliderField label="Already saved" value={existing} min={0} max={20000000} step={10000} onChange={setExisting} prefix="₹" />
            <SliderField label="Years in retirement" value={retireYears} min={5} max={40} step={1} onChange={setRetireYears} suffix="yrs" />
          </>
        ),
        headline: yearsToGo === 0 ? inr(needed) : `${inr(sip)} / month`,
        detail:
          yearsToGo === 0
            ? `An estimated corpus of ${inr(needed)} could support ${inr(futureExpense)} a month for ${retireYears} years, if the rates hold.`
            : `${yearsToGo} years to retirement. Future monthly spend about ${inr(futureExpense)}. Corpus needed about ${inr(needed)}.`,
        stats: [
          { label: "Corpus needed", value: inr(needed) },
          { label: "Monthly spend later", value: inr(futureExpense) },
        ],
      };
    }

    if (id === "education") {
      const futureCost = inflatedCost(present, inflation, years);
      const existingLater = lumpsumFutureValue(existing, rate, years);
      const gap = Math.max(futureCost - existingLater, 0);
      const sip = requiredMonthlySip(gap, rate, years);
      return {
        fields: (
          <>
            <SliderField label="Cost of education today" value={present} min={50000} max={20000000} step={10000} onChange={setPresent} prefix="₹" />
            <SliderField label="Years until needed" value={years} min={1} max={25} step={1} onChange={setYears} suffix="yrs" />
            <SliderField label="Education inflation" value={inflation} min={2} max={12} step={0.5} onChange={setInflation} suffix="%" />
            <SliderField label="Expected yearly return" value={rate} min={4} max={16} step={0.5} onChange={setRate} suffix="%" />
            <SliderField label="Already saved" value={existing} min={0} max={10000000} step={5000} onChange={setExisting} prefix="₹" />
          </>
        ),
        headline: `${inr(sip)} / month`,
        detail: `Today’s ${inr(present)} may cost about ${inr(futureCost)} in ${years} years at ${inflation}% inflation.`,
        stats: [
          { label: "Future education cost", value: inr(futureCost) },
          { label: "Gap after savings", value: inr(gap) },
        ],
      };
    }

    if (id === "inflation") {
      const future = inflatedCost(present, inflation, years);
      return {
        fields: (
          <>
            <SliderField label="Cost today" value={present} min={1000} max={20000000} step={1000} onChange={setPresent} prefix="₹" />
            <SliderField label="Inflation" value={inflation} min={1} max={15} step={0.5} onChange={setInflation} suffix="%" />
            <SliderField label="Years" value={years} min={1} max={40} step={1} onChange={setYears} suffix="yrs" />
          </>
        ),
        headline: inr(future),
        detail: `Today’s ${inr(present)} at ${inflation}% inflation for ${years} years.`,
        stats: [{ label: "Extra you may need", value: inr(Math.max(future - present, 0)) }],
      };
    }

    if (id === "present-value") {
      const today = presentValue(goal, rate, years);
      return {
        fields: (
          <>
            <SliderField label="Future amount" value={goal} min={10000} max={50000000} step={10000} onChange={setGoal} prefix="₹" />
            <SliderField label="Discount rate" value={rate} min={1} max={20} step={0.5} onChange={setRate} suffix="%" />
            <SliderField label="Years from now" value={years} min={1} max={40} step={1} onChange={setYears} suffix="yrs" />
          </>
        ),
        headline: inr(today),
        detail: `${inr(goal)} in ${years} years is about ${inr(today)} today at ${rate}% a year.`,
        stats: [{ label: "Future amount", value: inr(goal) }],
      };
    }

    if (id === "delay") {
      const gap = costOfDelay(monthly, rate, years, delay);
      return {
        fields: (
          <>
            <SliderField label="Monthly SIP" value={monthly} min={500} max={200000} step={500} onChange={setMonthly} prefix="₹" />
            <SliderField label="Expected yearly return" value={rate} min={1} max={20} step={0.5} onChange={setRate} suffix="%" />
            <SliderField label="Total years" value={years} min={1} max={40} step={1} onChange={setYears} suffix="yrs" />
            <SliderField label="Years you wait" value={delay} min={1} max={Math.max(years - 1, 1)} step={1} onChange={setDelay} suffix="yrs" />
          </>
        ),
        headline: inr(gap.gap),
        detail: `Starting now estimates ${inr(gap.startingNow)}. Waiting ${delay} years estimates ${inr(gap.startingLater)}. The gap is not money you are owed.`,
        stats: [
          { label: "Starting now", value: inr(gap.startingNow) },
          { label: "Starting later", value: inr(gap.startingLater) },
        ],
      };
    }

    if (id === "elss") {
      const tax = elssEstimate(elssAmount, slab);
      return {
        fields: (
          <>
            <SliderField label="ELSS investment" value={elssAmount} min={500} max={300000} step={500} onChange={setElssAmount} prefix="₹" />
            <SliderField label="Tax slab" value={slab} min={5} max={30} step={5} onChange={setSlab} suffix="%" />
          </>
        ),
        headline: inr(tax.taxSaved),
        detail: `Old-regime illustration. Eligible amount ${inr(tax.eligible)} at a ${slab}% slab. ${tax.capped ? "Only ₹1,50,000 counts toward this illustration." : "Under the ₹1,50,000 illustration cap."} This is not tax advice.`,
        stats: [{ label: "Eligible amount", value: inr(tax.eligible) }],
      };
    }

    if (id === "compound-interest") {
      const result = compoundInterest(corpus, rate, years, compounds);
      const labels: Record<number, string> = { 1: "Yearly", 2: "Half-yearly", 4: "Quarterly", 12: "Monthly" };
      return {
        fields: (
          <>
            <SliderField label="Principal" value={corpus} min={1000} max={10000000} step={1000} onChange={setCorpus} prefix="₹" />
            <SliderField label="Yearly rate" value={rate} min={1} max={20} step={0.5} onChange={setRate} suffix="%" />
            <SliderField label="Years" value={years} min={1} max={40} step={1} onChange={setYears} suffix="yrs" />
            <div>
              <p className="mb-2 text-[13px] font-medium text-body">Compounding</p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 4, 12].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCompounds(option)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm font-medium",
                      compounds === option
                        ? "bg-(--site-accent) text-white"
                        : "border border-line text-body hover:bg-(--site-bg)",
                    )}
                  >
                    {labels[option]}
                  </button>
                ))}
              </div>
            </div>
          </>
        ),
        headline: inr(result.amount),
        detail: `${labels[compounds] ?? "Periodic"} compounding at ${rate}% for ${years} years.`,
        stats: [{ label: "Interest earned", value: inr(result.interest) }],
        mix: { invested: corpus, future: result.amount },
      };
    }

    if (id === "simple-interest") {
      const result = simpleInterest(corpus, rate, years);
      return {
        fields: (
          <>
            <SliderField label="Principal" value={corpus} min={1000} max={10000000} step={1000} onChange={setCorpus} prefix="₹" />
            <SliderField label="Yearly rate" value={rate} min={1} max={20} step={0.5} onChange={setRate} suffix="%" />
            <SliderField label="Years" value={years} min={1} max={40} step={1} onChange={setYears} suffix="yrs" />
          </>
        ),
        headline: inr(result.amount),
        detail: `Simple interest of ${rate}% a year for ${years} years, with no compounding.`,
        stats: [{ label: "Interest earned", value: inr(result.interest) }],
        mix: { invested: corpus, future: result.amount },
      };
    }

    if (id === "cagr") {
      const rateValue = cagr(startValue, endValue, years);
      return {
        fields: (
          <>
            <SliderField label="Starting value" value={startValue} min={1000} max={20000000} step={1000} onChange={setStartValue} prefix="₹" />
            <SliderField label="Ending value" value={endValue} min={1000} max={50000000} step={1000} onChange={setEndValue} prefix="₹" />
            <SliderField label="Years" value={years} min={1} max={40} step={1} onChange={setYears} suffix="yrs" />
          </>
        ),
        headline: rateValue === null ? "—" : `${(rateValue * 100).toFixed(2)}%`,
        detail: rateValue === null ? "Enter a starting value above zero." : `A constant yearly rate from ${inr(startValue)} to ${inr(endValue)} over ${years} years.`,
        stats: [{ label: "Absolute change", value: inr(endValue - startValue) }],
      };
    }

    if (id === "mf-return") {
      const abs = absoluteReturn(startValue, endValue);
      const annualised = cagr(startValue, endValue, years);
      return {
        fields: (
          <>
            <SliderField label="Amount invested" value={startValue} min={1000} max={20000000} step={1000} onChange={setStartValue} prefix="₹" />
            <SliderField label="Value today" value={endValue} min={1000} max={50000000} step={1000} onChange={setEndValue} prefix="₹" />
            <SliderField label="Years invested" value={years} min={1} max={40} step={1} onChange={setYears} suffix="yrs" />
          </>
        ),
        headline: abs === null ? "—" : `${(abs * 100).toFixed(2)}%`,
        detail: "Absolute return on the amount invested. Annualised return is shown beside it. Past figures are not a guide to the future.",
        stats: [
          { label: "Gain or loss", value: inr(endValue - startValue) },
          { label: "Annualised (CAGR)", value: annualised === null ? "—" : `${(annualised * 100).toFixed(2)}%` },
        ],
        mix: { invested: startValue, future: endValue },
      };
    }

    if (id === "sip-performance") {
      const invested = monthly * years * 12;
      const rateValue = sipXirr(monthly, years, endValue);
      return {
        fields: (
          <>
            <SliderField label="Monthly SIP" value={monthly} min={500} max={200000} step={500} onChange={setMonthly} prefix="₹" />
            <SliderField label="Years invested" value={years} min={1} max={40} step={1} onChange={setYears} suffix="yrs" />
            <SliderField label="Current value of units" value={endValue} min={1000} max={50000000} step={1000} onChange={setEndValue} prefix="₹" />
          </>
        ),
        headline: rateValue === null ? "—" : `${(rateValue * 100).toFixed(2)}% a year`,
        detail: `XIRR of monthly investments totalling ${inr(invested)} versus a value of ${inr(endValue)} today. Dates are spread evenly over the tenure.`,
        stats: [
          { label: "Amount invested", value: inr(invested) },
          { label: "Gain or loss", value: inr(endValue - invested) },
        ],
        mix: { invested, future: endValue },
      };
    }

    const rateValue = xirr(
      flows.map((flow) => ({
        amount: flow.kind === "invest" ? -Math.abs(flow.amount) : Math.abs(flow.amount),
        when: new Date(`${flow.date}T00:00:00`),
      })),
    );
    return {
      fields: (
        <div className="space-y-3">
          <p className="text-[13px] leading-5 text-body">Use Invest for money you put in, and Value / redeem for money you take out or the holding today.</p>
          {flows.map((flow, index) => (
            <div key={flow.id} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <label className="text-xs font-medium text-muted">
                Date
                <input
                  type="date"
                  value={flow.date}
                  onChange={(event) =>
                    setFlows((current) => current.map((row) => (row.id === flow.id ? { ...row, date: event.target.value } : row)))
                  }
                  className="mt-1 w-full rounded-lg border border-line bg-(--site-bg) px-2.5 py-2 text-sm text-ink"
                />
              </label>
              <label className="text-xs font-medium text-muted">
                Amount (₹)
                <input
                  type="number"
                  min={0}
                  value={flow.amount}
                  onChange={(event) =>
                    setFlows((current) =>
                      current.map((row) => (row.id === flow.id ? { ...row, amount: Number(event.target.value) } : row)),
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-line bg-(--site-bg) px-2.5 py-2 text-sm text-ink"
                />
              </label>
              <label className="text-xs font-medium text-muted">
                Type
                <select
                  value={flow.kind}
                  onChange={(event) =>
                    setFlows((current) =>
                      current.map((row) =>
                        row.id === flow.id ? { ...row, kind: event.target.value as "invest" | "value" } : row,
                      ),
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-line bg-(--site-bg) px-2.5 py-2 text-sm text-ink"
                >
                  <option value="invest">Invest</option>
                  <option value="value">Value / redeem</option>
                </select>
              </label>
              <button
                type="button"
                className="self-end pb-2 text-sm font-medium text-muted hover:text-ink disabled:opacity-40"
                disabled={flows.length <= 2}
                onClick={() => setFlows((current) => current.filter((row) => row.id !== flow.id))}
              >
                Remove
              </button>
              <span className="sr-only">Cash flow {index + 1}</span>
            </div>
          ))}
          <button
            type="button"
            className="text-sm font-semibold"
            style={{ color: "var(--site-accent)" }}
            onClick={() =>
              setFlows((current) => [
                ...current,
                { id: `flow-${Date.now()}`, date: new Date().toISOString().slice(0, 10), amount: 10000, kind: "invest" },
              ])
            }
          >
            Add a cash flow
          </button>
        </div>
      ),
      headline: rateValue === null ? "Could not calculate" : `${(rateValue * 100).toFixed(2)}% a year`,
      detail: "XIRR from the dates and amounts you typed. At least one investment and one value are required.",
      stats: [{ label: "Cash flows", value: String(flows.length) }],
    };
  }, [
    id,
    monthly,
    rate,
    years,
    step,
    corpus,
    withdrawal,
    transfer,
    sourceRate,
    goal,
    delay,
    inflation,
    present,
    elssAmount,
    slab,
    existing,
    age,
    retireAge,
    retireYears,
    expense,
    compounds,
    startValue,
    endValue,
    flows,
  ]);
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-body">{label}</span>
        <span className="inline-flex items-center rounded-lg border border-line bg-(--site-bg) px-2 py-1 text-sm font-semibold tabular-nums text-ink">
          {prefix ? <span className="mr-1 text-muted">{prefix}</span> : null}
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(event) => onChange(clamp(Number(event.target.value), min, max))}
            className="w-[7.5rem] bg-transparent text-right outline-none"
          />
          {suffix ? <span className="ml-1 text-muted">{suffix}</span> : null}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(Math.max(value, min), max)}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[var(--site-accent)]"
      />
    </label>
  );
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
