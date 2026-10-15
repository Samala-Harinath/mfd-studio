"use client";

import Link from "next/link";
import { plans } from "@/lib/plans";
import { inr } from "@/lib/format";
import { ButtonLink } from "@/components/ui/ui";

const checks = [
  "AMFI-aligned communication",
  "100% distributor-owned domain and leads",
  "No tech skills required",
];

const dilemma = [
  {
    tone: "bg-teal/10 text-teal",
    title: "Look professional online instantly",
    text: "A branded site with your name, ARN, services, and calculators. Visitors see a real practice, not a blank template.",
    link: "Your own web address",
    href: "/signup",
  },
  {
    tone: "bg-sky/10 text-sky",
    title: "Answer questions after hours",
    text: "On Growth and Pro, a chat answers only from notes you approve. Personal advice is passed to you as an enquiry.",
    link: "Approved answers only",
    href: "/features",
  },
  {
    tone: "bg-amber-soft text-amber",
    title: "Never lose an investor lead",
    text: "Calculator visits, the contact form, and chat handoffs land in one inbox with a status and a note.",
    link: "One enquiry inbox",
    href: "/signup",
  },
];

export function HomeScreen() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div>
          <p className="inline-flex rounded-full bg-teal/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-teal">
            AMFI registration ready · Built for Indian MFDs
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl sm:leading-[56px]">
            Your AI front office for your{" "}
            <span className="relative text-teal">
              MFD business
              <span className="absolute -bottom-1 left-0 h-2 w-full rounded-full bg-teal/20" />
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-body">
            Create a branded investor website, capture enquiries, and let an assistant answer common questions from content you approve. You get your own web address when you publish.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-body">
            {checks.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-good-soft text-xs text-good">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/signup">Create an account</ButtonLink>
            <ButtonLink href="/pricing" variant="secondary">Explore plans</ButtonLink>
            <span className="rounded-full bg-indigo-soft px-3 py-1 text-xs font-semibold text-indigo">
              AUI + 8k · Illustrative
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-line bg-white p-3 shadow-[0_10px_15px_-3px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between border-b border-line px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs text-muted">yourfirm.in</span>
              </div>
              <span className="rounded-full bg-good-soft px-2 py-0.5 text-[11px] font-semibold text-good">Live site</span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold">Your practice name</p>
                  <p className="text-xs text-muted">AMFI-registered Mutual Fund Distributor · ARN-••••• · Your city</p>
                </div>
                <span className="rounded-xl bg-teal/10 px-3 py-2 text-xs font-semibold text-teal">Site</span>
              </div>
              <div className="mt-4 rounded-2xl bg-canvas p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-body">Monthly SIP estimate</span>
                  <span className="font-display text-lg font-semibold tabular-nums">₹15,000 / mo</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full w-2/3 rounded-full bg-teal" />
                </div>
                <p className="mt-2 text-xs text-muted">10 years at a rate the visitor types · ₹34.8 lakh illustrated</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-display font-semibold">MFD growth console</p>
              <span className="text-xs text-muted">Your private office</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <MiniStat label="Visitors" value="1,842" hint="+18%" tone="bg-teal/10 text-teal" />
              <MiniStat label="Enquiries" value="38" hint="High intent" tone="bg-sky/10 text-sky" />
              <MiniStat label="AI wallet" value="₹1,420" hint="Active" tone="bg-indigo-soft text-indigo" />
            </div>
          </div>

          <div className="rounded-3xl border border-amber/20 bg-amber-soft p-4">
            <div className="flex items-center justify-between">
              <p className="font-display font-semibold">Assistant</p>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-amber">Illustrative</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-body">
              “I can share general details on SIP concepts, or help you schedule a discussion with your distributor.”
            </p>
            <p className="mt-2 text-[11px] text-muted">Approved notes only · does not recommend schemes</p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky">The modern MFD dilemma</p>
          <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Distribute funds, not your valuable time. Run an always-on digital front office.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-body">
            Investors look you up before they call. Questions arrive at night. Enquiries sit in different places. This prototype walks you from a blank start to your own website address, then into a private dashboard.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {dilemma.map((card) => (
              <article key={card.title} className="rounded-3xl border border-line bg-canvas p-6">
                <span className={`inline-flex rounded-2xl px-3 py-2 text-sm font-semibold ${card.tone}`}>{card.title.slice(0, 1)}</span>
                <h3 className="mt-4 font-display text-xl font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-body">{card.text}</p>
                <Link href={card.href} className="mt-4 inline-block text-sm font-semibold text-teal">
                  {card.link} →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold">How an MFD gets a website</h2>
        <ol className="mt-6 grid gap-3 md:grid-cols-4">
          {[
            ["1", "Register", "Name, email, mobile, ARN, and a password. Every field is required."],
            ["2", "Open the dashboard", "You land in your private office as soon as you log in."],
            ["3", "Create the website", "Only a signed-in distributor can name the practice and publish an address."],
            ["4", "Edit pages", "Home opens as it looks now. Delete any section you do not want."],
          ].map(([step, title, text]) => (
            <li key={step} className="rounded-3xl border border-line bg-white p-5">
              <span className="font-display text-sm font-semibold text-teal">Step {step}</span>
              <h3 className="mt-2 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-body">{text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {plans.map((plan) => (
            <Link key={plan.id} href="/pricing" className="rounded-3xl border border-line bg-white p-5 hover:border-teal">
              <p className="text-sm font-semibold text-teal">{plan.name}</p>
              <p className="mt-2 font-display text-2xl font-semibold tabular-nums">{inr(plan.launchPrice)}</p>
              <p className="mt-1 text-sm text-muted">Up to {plan.pages} pages</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function MiniStat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: string;
}) {
  return (
    <div className={`rounded-2xl p-3 ${tone}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold text-ink tabular-nums">{value}</p>
      <p className="text-[11px]">{hint}</p>
    </div>
  );
}
