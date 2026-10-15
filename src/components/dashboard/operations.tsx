"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { PublicView } from "@/components/website/public-site";
import { useRequiredTenant as usePrototype } from "@/features/studio/hooks";
import { PasswordInput } from "@/components/ui/password-input";
import { Badge, Button, Card, cn, fieldClass } from "@/components/ui/ui";
import { findRestrictedTerm, inr } from "@/lib/format";
import { siteSubdomainUrl } from "@/lib/build-tenant";
import { getPlan, hasAiChat, hasTeam, plans } from "@/lib/plans";
import type { LeadStatus } from "@/lib/sample-data";

export function LeadsScreen() {
  const { activeTenant, setLeadStatus, updateLead } = usePrototype();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(activeTenant.leads[0]?.id ?? "");
  const leads = activeTenant.leads.filter((lead) => {
    const haystack = `${lead.name} ${lead.message} ${lead.source}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });
  const selected = activeTenant.leads.find((lead) => lead.id === selectedId) ?? leads[0];

  function exportCsv() {
    const header = "Name,Email,Phone,Message,Source,Status,Date";
    const rows = activeTenant.leads.map((lead) =>
      [lead.name, lead.email, lead.phone, lead.message, lead.source, lead.status, lead.createdAt]
        .map((value) => `"${value.replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeTenant.slug}-leads.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Leads</h1>
          <p className="mt-2 text-sm text-body">Only {activeTenant.businessName} enquiries are in this list.</p>
        </div>
        <Button type="button" variant="secondary" onClick={exportCsv}>Export CSV</Button>
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search name or message"
        className={fieldClass}
      />
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas text-[11px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Source</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedId(lead.id)}
                  className="cursor-pointer border-t border-line hover:bg-canvas"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-xs text-muted">{lead.createdAt}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-body sm:table-cell">{lead.source}</td>
                  <td className="px-4 py-3"><LeadBadge status={lead.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        {selected ? (
          <Card>
            <h2 className="font-display text-xl font-semibold">{selected.name}</h2>
            <p className="mt-1 text-sm text-muted">{selected.email} · {selected.phone}</p>
            <p className="mt-4 text-sm leading-6">{selected.message}</p>
            <label className="mt-4 block text-[13px] font-medium">Status</label>
            <select
              className={`${fieldClass} mt-1`}
              value={selected.status}
              onChange={(event) => setLeadStatus(selected.id, event.target.value as LeadStatus)}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
            <label className="mt-4 block text-[13px] font-medium">Note</label>
            <textarea
              value={selected.note}
              onChange={(event) => updateLead(selected.id, { note: event.target.value })}
              className={`${fieldClass} mt-1 min-h-24`}
            />
          </Card>
        ) : (
          <Card><p className="text-sm text-body">No enquiries match that search.</p></Card>
        )}
      </div>
    </div>
  );
}

export function PreviewScreen() {
  const { activeTenant, updateActive } = usePrototype();
  const [width, setWidth] = useState<"wide" | "phone">("wide");
  const missing = useMemo(() => {
    const items: string[] = [];
    if (!activeTenant.arn) items.push("ARN is missing");
    if (!activeTenant.services.some((service) => service.status === "published")) {
      items.push("Publish at least one service");
    }
    if (!activeTenant.phone && !activeTenant.email) items.push("Add a public phone or email");
    return items;
  }, [activeTenant]);

  const address = `/site/${activeTenant.slug}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Preview</h1>
          <p className="mt-1 text-sm text-body">The same theme as your office. Check desktop and phone, then publish.</p>
        </div>
        <div className="flex rounded-xl border border-edge bg-surface p-1">
          <button
            type="button"
            onClick={() => setWidth("wide")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-semibold",
              width === "wide" ? "bg-teal text-white" : "text-body",
            )}
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setWidth("phone")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-semibold",
              width === "phone" ? "bg-teal text-white" : "text-body",
            )}
          >
            Phone
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-edge bg-surface px-4 py-3">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-body">
          {missing.length === 0 ? <li>Required details are present.</li> : missing.map((item) => <li key={item}>{item}</li>)}
          <li>Market-risk disclaimer is locked on.</li>
        </ul>
        <Button
          type="button"
          size="sm"
          disabled={missing.length > 0}
          onClick={() => updateActive({ published: !activeTenant.published })}
        >
          {activeTenant.published ? "Unpublish site" : "Publish site"}
        </Button>
      </div>

      <div className={width === "phone" ? "mx-auto w-full max-w-97.5" : "w-full"}>
        <div className="overflow-hidden rounded-2xl border border-edge bg-surface shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-2 border-b border-edge bg-subtle px-3 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 min-w-0 flex-1 truncate rounded-md bg-surface px-3 py-1 text-xs text-muted">{address}</span>
          </div>
          <div className="preview-scroll max-h-190 overflow-auto bg-surface">
            <PublicView view="home" slug={activeTenant.slug} embedded />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DomainScreen() {
  const { activeTenant, updateActive } = usePrototype();
  const origin = useSyncExternalStore(() => () => { }, () => window.location.origin, () => "");
  const [domain, setDomain] = useState(activeTenant.customDomain);
  const subdomain = siteSubdomainUrl(activeTenant.slug, origin);
  const requested = activeTenant.customDomain;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Domain</h1>
      <Card>
        <p className="text-sm text-muted">Free platform address</p>
        {subdomain ? <p className="mt-1 break-all font-medium">{subdomain}</p> : null}
        <p className="mt-1 break-all text-sm text-body">{origin}/site/{activeTenant.slug}</p>
        <Badge tone="published">Live</Badge>
      </Card>
      <Card>
        <h2 className="font-display text-lg font-semibold">Your own domain</h2>
        <p className="mt-2 text-sm leading-6 text-body">
          Typing a name does not connect it. Save it, add the DNS record below at your domain provider, and the platform team marks it verified once the record is found.
        </p>
        <input
          value={domain}
          onChange={(event) => setDomain(event.target.value)}
          placeholder="www.yourfirm.in"
          className={`${fieldClass} mt-4`}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" onClick={() => updateActive({ customDomain: domain.trim().toLowerCase() })}>
            Save domain
          </Button>
          {requested ? (
            <Button type="button" variant="secondary" onClick={() => { setDomain(""); updateActive({ customDomain: "" }); }}>
              Remove domain
            </Button>
          ) : null}
        </div>
        {requested ? (
          <>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-body">
              <li>
                At your domain provider add a <span className="font-medium">CNAME</span> record: name{" "}
                <code className="rounded bg-canvas px-1">{requested.split(".")[0]}</code> → value{" "}
                <code className="rounded bg-canvas px-1">sites.{process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "yourplatform.in"}</code>
              </li>
              <li>We check that you control {requested}.</li>
              <li>HTTPS is issued only after that check.</li>
            </ol>
            <p className="mt-4">
              {activeTenant.domainStatus === "verified" ? (
                <Badge tone="published">Verified</Badge>
              ) : (
                <Badge tone="review">Waiting for DNS check</Badge>
              )}
            </p>
          </>
        ) : null}
      </Card>
    </div>
  );
}

export function SeoScreen() {
  const { activeTenant, updatePage } = usePrototype();
  const home = activeTenant.pages.find((page) => page.id === "home");
  if (!home) return null;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">SEO</h1>
      <Card>
        <label className="text-[13px] font-medium">Search title</label>
        <input
          value={home.seoTitle}
          onChange={(event) => updatePage(home.id, { seoTitle: event.target.value })}
          className={`${fieldClass} mt-1`}
        />
        <label className="mt-4 block text-[13px] font-medium">Search description</label>
        <textarea
          value={home.seoDescription}
          onChange={(event) => updatePage(home.id, { seoDescription: event.target.value })}
          className={`${fieldClass} mt-1 min-h-24`}
        />
        <div className="mt-5 rounded-2xl bg-canvas p-4">
          <p className="text-xs text-muted">How a result might look</p>
          <p className="mt-1 text-sky">{home.seoTitle}</p>
          <p className="text-xs text-good">/site/{activeTenant.slug}</p>
          <p className="mt-1 text-sm text-body">{home.seoDescription}</p>
        </div>
      </Card>
      <Card>
        <h2 className="font-medium">Google Business Profile checklist</h2>
        <ul className="mt-3 space-y-2 text-sm text-body">
          <li>Business name matches the public site.</li>
          <li>ARN is visible on the site, not only in the listing.</li>
          <li>Phone and hours match what you chose to show.</li>
        </ul>
      </Card>
    </div>
  );
}

export function ComplianceScreen() {
  const { activeTenant } = usePrototype();
  const [sample, setSample] = useState("We are an AMFI-registered distributor.");
  const blocked = findRestrictedTerm(sample);
  const expiry = new Date(activeTenant.arnExpiry);
  const reviewDate = new Date("2026-10-12");
  const soon = expiry.getTime() - reviewDate.getTime() < 1000 * 60 * 60 * 24 * 120;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Compliance</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-sm text-muted">Locked on every page</p>
          <p className="mt-2 font-medium">{activeTenant.businessName}</p>
          <p className="text-sm">{activeTenant.arn}</p>
          <p className="mt-2 text-sm text-body">AMFI-registered Mutual Fund Distributor</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">ARN expiry</p>
          <p className="mt-2 font-medium">{activeTenant.arnExpiry}</p>
          {soon ? <p className="mt-2"><Badge tone="review">Renewal window</Badge></p> : <p className="mt-2"><Badge tone="published">Date recorded</Badge></p>}
        </Card>
      </div>
      <Card>
        <h2 className="font-medium">Restricted-words check</h2>
        <textarea value={sample} onChange={(event) => setSample(event.target.value)} className={`${fieldClass} mt-3 min-h-24`} />
        {blocked ? (
          <p className="mt-3 text-sm text-bad">“{blocked}” is blocked in names, pages, and AI drafts.</p>
        ) : (
          <p className="mt-3 text-sm text-good">No blocked wording in this sample.</p>
        )}
      </Card>
      <Card>
        <h2 className="font-medium">Recent publish notes</h2>
        <ul className="mt-3 space-y-2 text-sm text-body">
          <li>Home page published by {activeTenant.contactPerson} · sample record</li>
          <li>Disclosures kept on by the platform · cannot be removed</li>
        </ul>
      </Card>
    </div>
  );
}

export function BillingScreen() {
  const { activeTenant } = usePrototype();
  const [quoted, setQuoted] = useState(false);
  const current = getPlan(activeTenant.plan);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Billing</h1>
      <p className="text-sm text-body">Current plan: {current.name}. An upgrade is quoted in writing. This screen does not take payment.</p>
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.id === current.id ? "border-teal" : undefined}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">{plan.name}</h2>
              {plan.id === current.id ? <Badge tone="published">Current</Badge> : null}
            </div>
            <p className="mt-3 font-display text-2xl font-semibold tabular-nums">{inr(plan.launchPrice)}</p>
            <p className="text-sm text-muted">AMC {inr(plan.amc)} from year 2</p>
            <p className="mt-2 text-sm text-body">{plan.pages} pages · {plan.users} users</p>
          </Card>
        ))}
      </div>
      <Button type="button" variant="secondary" onClick={() => setQuoted(true)}>Request an upgrade</Button>
      {quoted ? <p className="text-sm text-teal">In the live product we would email a written difference. Nothing is billed here.</p> : null}
    </div>
  );
}

export function SettingsScreen() {
  const { activeTenant, user, logout } = usePrototype();
  const router = useRouter();
  const [notice, setNotice] = useState("");
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-display text-3xl font-semibold">Account</h1>
      <Card>
        <p className="text-sm text-muted">Signed in as the owner of {activeTenant.businessName}</p>
        <p className="mt-2 font-medium">{user?.name || activeTenant.contactPerson}</p>
        <p className="text-sm text-body">{user?.email}</p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const password = String(new FormData(form).get("password") ?? "");
            if (!user) return;
            void fetch(`/api/users/${user.id}`, {
              method: "PATCH",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ password }),
            }).then((response) => {
              setNotice(response.ok ? "Password updated." : "Could not update the password.");
              if (response.ok) form.reset();
            });
          }}
        >
          <PasswordInput name="password" placeholder="New password" autoComplete="new-password" minLength={8} required />
          <Button type="submit" variant="secondary">Update password</Button>
        </form>
        {notice ? <p className="mt-3 text-sm text-muted">{notice}</p> : null}
      </Card>
      <Card>
        <h2 className="font-medium">Two-factor login</h2>
        <p className="mt-2 text-sm text-body">The control is visible so the account screen matches the plan. It does not enrol a device.</p>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" /> Show two-factor as planned for launch
        </label>
      </Card>
      <Button
        type="button"
        variant="danger"
        onClick={() => void logout().then(() => router.push("/login"))}
      >
        Log out
      </Button>
    </div>
  );
}

export function AiScreen() {
  const { activeTenant, addLead } = usePrototype();
  const [question, setQuestion] = useState("Can I start a SIP of ₹2,000 a month?");
  const [answer, setAnswer] = useState("");
  if (!hasAiChat(activeTenant.plan)) {
    return <Locked title="AI answers" text="Website chat is on Growth and Pro. Essential keeps the enquiry form without a chat assistant." />;
  }
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Approved answers</h1>
      <p className="text-sm text-body">The test box answers only from these lines. Scheme recommendations become an enquiry.</p>
      <div className="space-y-3">
        {activeTenant.faqs.map((faq) => (
          <Card key={faq.question}>
            <p className="font-medium">{faq.question}</p>
            <p className="mt-2 text-sm leading-6 text-body">{faq.answer}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="font-medium">Test console</h2>
        <textarea value={question} onChange={(event) => setQuestion(event.target.value)} className={`${fieldClass} mt-3 min-h-20`} />
        <Button
          type="button"
          className="mt-3"
          onClick={() => {
            const match = activeTenant.faqs.find((faq) =>
              question.toLowerCase().includes(faq.question.toLowerCase().slice(0, 12)),
            );
            if (question.toLowerCase().includes("recommend") || question.toLowerCase().includes("which fund")) {
              void addLead(activeTenant.slug, {
                name: "Chat visitor",
                email: "",
                phone: "",
                message: question,
                source: "AI handoff",
              });
              setAnswer("I cannot recommend a scheme. I have saved this as an enquiry for you.");
              return;
            }
            setAnswer(match?.answer ?? "I can only answer from the approved list. Ask your distributor directly for anything personal.");
          }}
        >
          Try this question
        </Button>
        {answer ? <p className="mt-4 text-sm leading-6">{answer}</p> : null}
      </Card>
    </div>
  );
}

export function TeamScreen() {
  const { activeTenant } = usePrototype();
  if (!hasTeam(activeTenant.plan)) {
    return <Locked title="Team" text="Roles for extra staff are on Growth. Public EUIN team pages are on Pro. Pick Growth or Pro when you create the website to open this screen." />;
  }
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-semibold">Team</h1>
      {activeTenant.team.map((member) => (
        <Card key={member.slug}>
          <p className="font-medium">{member.name}</p>
          <p className="text-sm text-body">{member.role} · {member.euin}</p>
        </Card>
      ))}
    </div>
  );
}

export function WalletScreen() {
  const { activeTenant } = usePrototype();
  const plan = getPlan(activeTenant.plan);
  if (!hasAiChat(activeTenant.plan)) {
    return <Locked title="AI wallet" text="Essential has no included AI credit. Growth includes ₹500 a month. Pro includes ₹1,500." />;
  }
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">AI wallet</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-[11px] uppercase tracking-wide text-muted">Included this month</p>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{inr(plan.aiCredit)}</p>
        </Card>
        <Card>
          <p className="text-[11px] uppercase tracking-wide text-muted">Sample chat spend</p>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{inr(12 * 8)}</p>
          <p className="text-sm text-muted">8 conversations at ₹12</p>
        </Card>
        <Card>
          <p className="text-[11px] uppercase tracking-wide text-muted">Still in the sample wallet</p>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{inr(plan.aiCredit - 96)}</p>
        </Card>
      </div>
      <Card>
        <p className="text-sm leading-6 text-body">
          Chat is ₹12 per conversation. Website voice would be ₹7 per minute and phone AI ₹9 per connected minute. Those two are coming soon. One conversation ends after 30 minutes of silence, and never lasts longer than 24 hours. ₹500 covers about 40 chats. This is not unlimited.
        </p>
      </Card>
    </div>
  );
}

function Locked({ title, text }: { title: string; text: string }) {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      <Card>
        <Badge tone="soon">Upgrade</Badge>
        <p className="mt-3 text-sm leading-6 text-body">{text}</p>
      </Card>
    </div>
  );
}

function LeadBadge({ status }: { status: LeadStatus }) {
  if (status === "new") return <Badge tone="review">New</Badge>;
  if (status === "contacted") return <Badge tone="neutral">Contacted</Badge>;
  return <Badge tone="published">Closed</Badge>;
}
