"use client";

import Link from "next/link";
import {
  CALCULATOR_CATALOG,
  CALCULATOR_CATEGORIES,
  defaultEnabledCalculators,
  planAllowsCalculator,
  visibleCalculators,
  type CalculatorId,
} from "@/lib/calculator-catalog";
import { CalculatorIconMark } from "@/components/tools/calculators";
import { Badge, Button, ButtonLink, Card, cn } from "@/components/ui/ui";
import { useRequiredTenant } from "@/features/studio/hooks";
import { sitePath } from "@/lib/build-tenant";
import { getPlan } from "@/lib/plans";
import { Calculator, ExternalLink, Lock } from "lucide-react";

export function CalculatorsScreen() {
  const { activeTenant, updateActive } = useRequiredTenant();
  const plan = getPlan(activeTenant.plan);
  const allowed = CALCULATOR_CATALOG.filter((item) => planAllowsCalculator(item, activeTenant.plan));
  const effective = new Set(
    visibleCalculators({
      plan: activeTenant.plan,
      enabledCalculators: activeTenant.enabledCalculators,
    }).map((item) => item.id),
  );
  const onSite = effective.size;
  const pageOn = activeTenant.pages.some((page) => page.id === "tools" && page.status === "published");

  function setEnabled(next: CalculatorId[]) {
    updateActive({ enabledCalculators: next });
  }

  function toggle(id: CalculatorId, currentlyOn: boolean) {
    const current = allowed.filter((item) => effective.has(item.id)).map((item) => item.id);
    setEnabled(currentlyOn ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal">Website</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Calculators</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-body">
            Every illustration runs in the visitor’s browser. Switch a calculator on to show it on your public Calculators
            page. Visitors only see what you allow.
          </p>
        </div>
        <ButtonLink href={`${sitePath(activeTenant.slug)}/calculators`} variant="secondary" className="gap-2">
          <ExternalLink className="h-4 w-4" aria-hidden />
          View on website
        </ButtonLink>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">On the website</p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{onSite}</p>
          <p className="mt-1 text-sm text-body">of {allowed.length} available on {plan.name}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Calculators page</p>
          <p className="mt-1 font-display text-2xl font-semibold">{pageOn ? "Published" : "Draft"}</p>
          <p className="mt-1 text-sm text-body">
            {pageOn ? "Nav shows Calculators." : "Publish it under Pages to show the nav item."}
          </p>
        </Card>
        <Card className="flex flex-col justify-center gap-2 p-4">
          <Button type="button" size="sm" onClick={() => setEnabled(allowed.map((item) => item.id))}>
            Show all on website
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => setEnabled([])}>
            Hide all
          </Button>
        </Card>
      </div>

      {CALCULATOR_CATEGORIES.map((category) => {
        const items = CALCULATOR_CATALOG.filter((item) => item.category === category.id);
        if (!items.length) return null;
        return (
          <section key={category.id} className="space-y-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{category.label}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {items.map((item) => {
                const locked = !planAllowsCalculator(item, activeTenant.plan);
                const on = !locked && effective.has(item.id);
                return (
                  <Card key={item.id} className={cn("p-4", locked && "opacity-80")}>
                    <div className="flex items-start gap-3">
                      <CalculatorIconMark icon={item.icon} colour={activeTenant.primaryColour} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-base font-semibold">{item.label}</h3>
                          {locked ? (
                            <Badge tone="plan">
                              <Lock className="h-3 w-3" aria-hidden />
                              {item.minPlan === "pro" ? "Pro" : "Growth & Pro"}
                            </Badge>
                          ) : on ? (
                            <Badge tone="published">On website</Badge>
                          ) : (
                            <Badge tone="draft">Hidden</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-body">{item.description}</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        aria-label={`${on ? "Hide" : "Show"} ${item.label}`}
                        disabled={locked}
                        onClick={() => toggle(item.id, on)}
                        className={cn(
                          "relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed",
                          on ? "bg-teal" : "bg-line-strong",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-[left]",
                            on ? "left-[22px]" : "left-0.5",
                          )}
                        />
                      </button>
                    </div>
                    {!locked && on ? (
                      <Link
                        href={`${sitePath(activeTenant.slug)}/calculators/${item.id}`}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal"
                      >
                        Open this calculator
                        <ExternalLink className="h-3 w-3" aria-hidden />
                      </Link>
                    ) : null}
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}

      <p className="flex items-start gap-2 text-sm leading-6 text-body">
        <Calculator className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
        Results are estimates from the numbers a visitor types. They are not a scheme recommendation. XIRR is included from
        the Growth plan. New websites start with every allowed calculator switched on
        ({defaultEnabledCalculators(activeTenant.plan).length} on {plan.name}).
      </p>
    </div>
  );
}
