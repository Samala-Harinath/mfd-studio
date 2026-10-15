"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  Check as CheckIcon,
  CircleAlert,
  CircleCheck,
  Copy,
  ExternalLink,
  Inbox,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PipelineChart, type PipelineSlice } from "@/components/dashboard/charts/pipeline-chart";
import { visitorPeak, visitorWeekTotal, VisitorsChart } from "@/components/dashboard/charts/visitors-chart";
import { useRequiredTenant as usePrototype } from "@/features/studio/hooks";
import { sitePath } from "@/lib/build-tenant";
import { getPlan, hasAiChat } from "@/lib/plans";

const pipelineTones = {
  new: "#d97706",
  contacted: "#0284c7",
  closed: "#16a34a",
};

export function OverviewScreen() {
  const { activeTenant } = usePrototype();
  const plan = getPlan(activeTenant.plan);
  const published = activeTenant.pages.filter((page) => page.status === "published").length;
  const path = sitePath(activeTenant.slug);
  const origin = useSyncExternalStore(() => () => {}, () => window.location.origin, () => "");
  const [copied, setCopied] = useState(false);
  const newLeads = activeTenant.leads.filter((lead) => lead.status === "new").length;
  const contacted = activeTenant.leads.filter((lead) => lead.status === "contacted").length;
  const closed = activeTenant.leads.filter((lead) => lead.status === "closed").length;
  const address = `${origin}${path}`;
  const pipeline: PipelineSlice[] = [
    { name: "New", value: newLeads, color: pipelineTones.new },
    { name: "Contacted", value: contacted, color: pipelineTones.contacted },
    { name: "Closed", value: closed, color: pipelineTones.closed },
  ];
  const pipelineTotal = newLeads + contacted + closed;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="flex flex-col gap-4 rounded-2xl border border-edge bg-surface p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={activeTenant.published ? "h-2 w-2 rounded-full bg-good" : "h-2 w-2 rounded-full bg-amber"} />
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {activeTenant.published ? "Published address" : "Not published"}
            </p>
          </div>
          <p className="mt-2 truncate font-display text-lg font-semibold tracking-tight">{activeTenant.businessName}</p>
          <p className="mt-1 truncate text-sm text-body">{address || path}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 text-sm font-semibold text-ink hover:bg-subtle"
            onClick={() => {
              void navigator.clipboard.writeText(address || path);
              setCopied(true);
            }}
          >
            {copied ? <CheckIcon className="h-4 w-4 text-good" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
            {copied ? "Copied" : "Copy"}
          </button>
          <Link href={path} className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:brightness-95">
            <ExternalLink className="h-4 w-4" aria-hidden />
            Open website
          </Link>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Visitors"
          value={activeTenant.visitors.toLocaleString("en-IN")}
          hint="Counts once analytics is connected"
          tone="bg-brand/10 text-brand"
          icon={Users}
        />
        <Stat
          label="Enquiries"
          value={String(activeTenant.leads.length)}
          hint={newLeads === 1 ? "1 waiting for a reply" : `${newLeads} waiting for a reply`}
          tone="bg-sky/10 text-sky"
          icon={Inbox}
        />
        <Stat
          label="AI conversations"
          value={hasAiChat(activeTenant.plan) ? String(activeTenant.leads.filter((lead) => lead.source === "Website chat").length) : "—"}
          hint={hasAiChat(activeTenant.plan) ? "Chat questions passed to you" : "Included from Growth"}
          tone="bg-indigo-soft text-indigo"
          icon={Bot}
        />
        <Stat
          label="Meetings"
          value={String(activeTenant.meetings)}
          hint="Booked from the website"
          tone="bg-amber-soft text-amber"
          icon={CalendarCheck}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.45fr_0.55fr]">
        <section className="rounded-2xl border border-edge bg-surface p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-semibold">Visitors this week</h2>
              <p className="mt-1 text-sm text-muted">Sample pattern until live analytics is connected.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-display text-xl font-semibold leading-none tabular-nums">{visitorWeekTotal}</p>
                <p className="mt-1 text-[11px] font-medium text-muted">Peak {visitorPeak.day}</p>
              </div>
              <p className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                +18%
              </p>
            </div>
          </div>
          <VisitorsChart />
        </section>

        <section className="rounded-2xl border border-edge bg-surface p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <h2 className="font-display text-base font-semibold">Enquiry pipeline</h2>
          <p className="mt-1 text-sm text-muted">Where open conversations sit.</p>
          <div className="mt-4">
            <PipelineChart slices={pipeline} />
          </div>
          <ul className="mt-4 space-y-3">
            {pipeline.map((slice) => (
              <Pipeline key={slice.name} label={slice.name} count={slice.value} total={pipelineTotal} color={slice.color} />
            ))}
          </ul>
          <Link href="/dashboard/leads" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
            Open inbox
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <section className="rounded-2xl border border-edge bg-surface p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Latest enquiries</h2>
            <Link href="/dashboard/leads" className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
              View all
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <ul className="mt-2 divide-y divide-line">
            {activeTenant.leads.slice(0, 4).map((lead) => (
              <li key={lead.id} className="flex items-start gap-3 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-subtle text-xs font-semibold text-ink">
                  {lead.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold">{lead.name}</p>
                    <span className={statusClass(lead.status)}>{lead.status}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-body">{lead.message}</p>
                  <p className="mt-1 text-xs text-muted">{lead.source}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-edge bg-surface p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <h2 className="font-display text-base font-semibold">Practice health</h2>
          <p className="mt-1 text-sm text-muted">{plan.name} · {activeTenant.languages.join(", ")}</p>
          <ul className="mt-4 space-y-3 text-sm">
            <Check ok={activeTenant.published} label="Website is published" />
            <Check ok={activeTenant.arn.trim().length > 3} label={`ARN ${activeTenant.arn} is on the site`} />
            <Check ok label="Disclosures page is locked on" />
            <Check ok={published > 0} label={`${published} of ${plan.pages} pages published`} />
          </ul>
          <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 text-sm font-semibold">
            <Link href="/dashboard/compliance" className="text-brand">Compliance checks</Link>
            <Link href="/dashboard/billing" className="text-indigo">Review billing</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  tone: string;
  icon: LucideIcon;
}) {
  return (
    <section className="rounded-2xl border border-edge bg-surface p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="mt-3 font-display text-[28px] font-semibold leading-none tracking-tight tabular-nums">{value}</p>
      <p className="mt-2 text-xs text-body">{hint}</p>
    </section>
  );
}

function Pipeline({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const width = total === 0 ? 0 : Math.max((count / total) * 100, count === 0 ? 0 : 8);
  return (
    <li>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium">
          <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden />
          {label}
        </span>
        <span className="tabular-nums text-muted">{count}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-subtle">
        <div className="h-full rounded-full" style={{ width: `${width}%`, background: color }} />
      </div>
    </li>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-start gap-2.5">
      {ok ? (
        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-good" aria-hidden />
      ) : (
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden />
      )}
      <span className="leading-5 text-body">{label}</span>
    </li>
  );
}

function statusClass(status: string) {
  if (status === "new") return "rounded-full bg-amber-soft px-2 py-0.5 text-[11px] font-semibold capitalize text-amber";
  if (status === "contacted") return "rounded-full bg-sky/10 px-2 py-0.5 text-[11px] font-semibold capitalize text-sky";
  return "rounded-full bg-good-soft px-2 py-0.5 text-[11px] font-semibold capitalize text-good";
}
