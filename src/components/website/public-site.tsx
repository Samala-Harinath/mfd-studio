"use client";

import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { createContext, Suspense, useContext, useState, type ReactNode } from "react";
import { PuckPageContent } from "@/components/puck/page-content";
import { CalculatorPanel } from "@/components/tools/calculators";
import { usePrototype, useTenant } from "@/features/studio/hooks";
import { useBrandColor } from "@/components/theme/use-brand";
import { cn } from "@/components/ui/ui";
import { headerBarStyle, siteStyle } from "@/lib/design";
import { sampleFunds } from "@/lib/funds";
import { AMFI_LINE, inrExact, MARKET_RISK } from "@/lib/format";
import { hasAiChat, hasBlog } from "@/lib/plans";
import { layoutForHome } from "@/lib/puck/defaults";
import { hasPuckContent, parsePageLayout } from "@/lib/puck/types";
import type { SitePage, Tenant } from "@/lib/sample-data";

const TenantContext = createContext<Tenant | null>(null);

const buttonStyle = { background: "var(--site-button)", color: "var(--site-button-text)" };
const accentStyle = { color: "var(--site-accent)" };

export type PublicViewName =
  | "home"
  | "about"
  | "services"
  | "achievements"
  | "learn"
  | "article"
  | "tools"
  | "funds"
  | "contact"
  | "disclosures"
  | "blog"
  | "post"
  | "custom";

export function PublicView({
  view,
  slug,
  embedded = false,
  tenant: preview,
}: {
  view: PublicViewName;
  slug?: string;
  embedded?: boolean;
  /** Unsaved copy shown by the Design editor. */
  tenant?: Tenant;
}) {
  const params = useParams<{ tenantSlug?: string; slug?: string; pageSlug?: string; tool?: string }>();
  const tenantSlug = slug ?? params.tenantSlug ?? "";
  const stored = useTenant(tenantSlug);
  const tenant = preview ?? stored;
  const { addLead } = usePrototype();
  const [loginOpen, setLoginOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  useBrandColor(tenant?.primaryColour ?? "#0D9488", Boolean(tenant) && !embedded);

  if (!tenant || (!tenant.published && !embedded)) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-display text-2xl font-semibold">This site is not available</p>
        <p className="mt-3 text-sm leading-6 text-body">
          The address is wrong, or the distributor has not published the website yet.
        </p>
        <Link href="/" className="mt-6 inline-flex rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white">
          Go to MFD Studio
        </Link>
      </main>
    );
  }

  const base = `/site/${tenant.slug}`;
  const published = new Set(
    tenant.pages.filter((page) => page.status === "published").map((page) => page.id),
  );
  const articleSlug = params.slug ?? "";
  const article = tenant.articles.find((item) => item.slug === articleSlug && item.status === "published");
  const customPages = tenant.pages.filter((page) => page.custom && page.status === "published");
  const customPage = customPages.find((page) => page.id === params.pageSlug);

  const nav = [
    published.has("about") ? { label: "About", href: `${base}/about` } : null,
    published.has("services") ? { label: "Services", href: `${base}/services` } : null,
    published.has("achievements") ? { label: "Achievements", href: `${base}/achievements` } : null,
    published.has("tools") ? { label: "Calculators", href: `${base}/calculators` } : null,
    { label: "Funds", href: `${base}/funds` },
    published.has("learn") ? { label: "Learn", href: `${base}/learn` } : null,
    published.has("blog") && hasBlog(tenant.plan) ? { label: "Blog", href: `${base}/blog` } : null,
    ...customPages.map((page) => ({ label: page.title, href: `${base}/${page.id}` })),
    published.has("contact") ? { label: "Contact", href: `${base}/contact` } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <TenantContext.Provider value={tenant}>
      <div style={siteStyle(tenant)} className="site-root flex min-h-screen flex-col bg-(--site-bg) text-ink">
        {/* Not on the outer wrapper: a query container becomes the containing block for the fixed dialog and chat. */}
        <div className="@container flex min-h-screen flex-1 flex-col">
        {tenant.announcement ? (
          <p className="bg-amber-soft px-4 py-2 text-center text-sm text-amber">{tenant.announcement}</p>
        ) : null}
        <SiteHeader base={base} nav={nav} onLogin={() => setLoginOpen(true)} />

        <main className={cn("mx-auto w-full flex-1 px-4 py-10", view === "tools" ? "max-w-6xl" : "max-w-5xl")}>
          {view === "home" ? <HomePage /> : null}
          {view === "about" ? <PageSections pageId="about" fallback={<About />} /> : null}
          {view === "services" ? <PageSections pageId="services" fallback={<Services />} /> : null}
          {view === "achievements" ? <PageSections pageId="achievements" fallback={<Achievements />} /> : null}
          {view === "learn" ? <PageSections pageId="learn" fallback={<Learn />} /> : null}
          {view === "article" || view === "post" ? (
            article ? <ArticleView title={article.title} body={article.body} /> : <Missing />
          ) : null}
          {view === "tools" ? <ToolsPage tenantSlug={tenant.slug} plan={tenant.plan} toolId={params.tool} /> : null}
          {view === "funds" ? <Funds colour={tenant.primaryColour} slug={tenant.slug} /> : null}
          {view === "contact" ? <ContactPage slug={tenant.slug} onSubmit={addLead} /> : null}
          {view === "disclosures" ? <Disclosures /> : null}
          {view === "custom" ? (
            customPage ? <CustomPageContent page={customPage} base={base} /> : <Missing />
          ) : null}
          {view === "blog" ? (
            hasBlog(tenant.plan) ? <Learn heading="Blog" /> : (
              <p className="text-sm text-body">Education notes for this plan are on the Learn page. A blog is included from Growth.</p>
            )
          ) : null}
        </main>

        <footer className="mt-auto border-t border-line bg-(--site-bg)">
          <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-body">
            <p className="font-medium text-ink">{tenant.businessName} · {tenant.arn}</p>
            <p className="mt-1">{AMFI_LINE}</p>
            <p className="mt-1">{tenant.phone} · {tenant.email}</p>
            {tenant.showAddress ? <p className="mt-1">{tenant.address} · {tenant.hours}</p> : null}
            <p className="mt-4 text-[11px] leading-4 text-muted">{MARKET_RISK}</p>
            <Link href={`${base}/disclosures`} className="mt-3 inline-block text-sm font-medium" style={accentStyle}>
              Disclosures
            </Link>
          </div>
        </footer>
        </div>

        {loginOpen ? (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/45 p-4">
            <div className="max-w-md rounded-(--site-radius-card) border border-line bg-(--site-bg) p-6">
              <h2 className="font-display text-xl font-semibold">Client login</h2>
              <p className="mt-2 text-sm leading-6 text-body">{tenant.clientLoginNote}</p>
              <button type="button" className="mt-4 text-sm font-semibold" style={accentStyle} onClick={() => setLoginOpen(false)}>
                Close
              </button>
            </div>
          </div>
        ) : null}

        {hasAiChat(tenant.plan) && !embedded ? (
          <div className="fixed bottom-4 right-4 z-20 w-[min(100%-2rem,320px)]">
            {chatOpen ? (
              <ChatPanel slug={tenant.slug} onClose={() => setChatOpen(false)} />
            ) : (
              <button
                type="button"
                onClick={() => setChatOpen(true)}
                className="ml-auto block rounded-full px-4 py-3 text-sm font-semibold shadow-lg"
                style={buttonStyle}
              >
                Ask a question
              </button>
            )}
          </div>
        ) : null}
      </div>
    </TenantContext.Provider>
  );
}

function useCurrentTenant() {
  const tenant = useContext(TenantContext);
  if (!tenant) throw new Error("Missing tenant");
  return tenant;
}

function Mark({ size = "h-10 w-10 text-sm" }: { size?: string }) {
  const tenant = useCurrentTenant();
  if (tenant.logoDataUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={tenant.logoDataUrl} alt="" className={cn(size, "shrink-0 rounded-lg bg-white object-contain")} />;
  }
  return (
    <span
      className={cn(size, "flex shrink-0 items-center justify-center rounded-lg font-semibold text-white")}
      style={{ background: "var(--site-accent)" }}
    >
      {tenant.businessName.slice(0, 1).toUpperCase()}
    </span>
  );
}

/** Three tested arrangements. The ARN is part of the brand block, so no layout can drop it. */
function SiteHeader({ base, nav, onLogin }: { base: string; nav: { label: string; href: string }[]; onLogin: () => void }) {
  const tenant = useCurrentTenant();
  const pathname = usePathname();
  const centered = tenant.headerLayout === "centered";

  const brand = (
    <Link href={base} className={cn("flex min-w-0 items-center gap-3", centered && "flex-col gap-2 text-center")}>
      <Mark />
      <span className="min-w-0">
        <span className="block truncate font-display text-base font-semibold leading-none text-ink">{tenant.businessName}</span>
        <span className="mt-1 block truncate text-[11px] text-muted">{tenant.arn}</span>
      </span>
    </Link>
  );

  const actions = (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={onLogin}
        className="hidden rounded-(--site-radius-button) border border-line-strong px-3 py-2 text-sm font-medium text-ink @2xl:inline"
      >
        Client login
      </button>
      <Link href={`${base}/contact`} className="rounded-(--site-radius-button) px-3.5 py-2 text-sm font-semibold" style={buttonStyle}>
        Enquire
      </Link>
    </div>
  );

  const links = (className: string) => (
    <nav className={cn("no-scrollbar", className)}>
      {nav.map((item) => {
        const current =
          pathname === item.href ||
          pathname.startsWith(`${item.href}/`) ||
          (item.href.endsWith("/calculators") && pathname.includes("/tools"));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] font-medium hover:bg-canvas hover:text-ink",
              current ? "font-semibold" : "text-body",
            )}
            style={current ? accentStyle : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const shell = "sticky top-0 z-10 border-b border-line";
  const bar = headerBarStyle(tenant.themeMode);

  if (tenant.headerLayout === "inline") {
    return (
      <header className={shell} style={bar}>
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3.5">
          {brand}
          {links("hidden min-w-0 flex-1 justify-center gap-1 overflow-x-auto @3xl:flex")}
          <div className="ml-auto @3xl:ml-0">{actions}</div>
        </div>
        {links("mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 pb-2 @3xl:hidden")}
      </header>
    );
  }

  if (centered) {
    return (
      <header className={shell} style={bar}>
        <div className="mx-auto grid max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 pt-4 pb-2">
          <span />
          {brand}
          <div className="justify-self-end">{actions}</div>
        </div>
        {links("mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 pb-2 @3xl:justify-center")}
      </header>
    );
  }

  return (
    <header className={shell} style={bar}>
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5">
        {brand}
        {actions}
      </div>
      {links("mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 pb-2")}
    </header>
  );
}

function HomePage() {
  const tenant = useCurrentTenant();
  const page = tenant.pages.find((item) => item.id === "home");
  const layout = layoutForHome(tenant, page?.layout);
  if (layout === "empty") {
    return (
      <section className="rounded-(--site-radius-card) border border-line bg-(--site-surface) px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">This home page has no sections</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-body">
          Every section was removed. Add sections again from the visual editor.
        </p>
      </section>
    );
  }
  return <PuckPageContent layout={layout} base={`/site/${tenant.slug}`} />;
}

function pageLayout(tenant: Tenant, pageId: string) {
  const page = tenant.pages.find((item) => item.id === pageId);
  return parsePageLayout(page?.layout);
}

function PageSections({ pageId, fallback }: { pageId: string; fallback: ReactNode }) {
  const tenant = useCurrentTenant();
  const layout = pageLayout(tenant, pageId);
  const base = `/site/${tenant.slug}`;
  if (layout && hasPuckContent(layout)) {
    return <PuckPageContent layout={layout} base={base} />;
  }
  return fallback;
}

function CustomPageContent({ page, base }: { page: SitePage; base: string }) {
  const layout = parsePageLayout(page.layout);
  if (layout && hasPuckContent(layout)) {
    return <PuckPageContent layout={layout} base={base} />;
  }
  return <ArticleView title={page.title} body={page.body} />;
}

function ToolsPage({
  tenantSlug,
  plan,
  toolId,
}: {
  tenantSlug: string;
  plan: Tenant["plan"];
  toolId?: string;
}) {
  const tenant = useCurrentTenant();
  const layout = pageLayout(tenant, "tools");
  const base = `/site/${tenantSlug}`;
  return (
    <div>
      {!toolId ? (
        layout && hasPuckContent(layout) ? (
          <PuckPageContent layout={layout} base={base} />
        ) : (
          <>
            <h1 className="font-display text-3xl font-semibold">Calculators</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-body">
              Type your own numbers. The result is an estimate, not a scheme recommendation.
            </p>
          </>
        )
      ) : null}
      <div className={toolId ? undefined : "mt-6"}>
        <CalculatorPanel
          slug={tenantSlug}
          plan={plan}
          colour={tenant.primaryColour}
          enabledCalculators={tenant.enabledCalculators}
          toolId={toolId}
        />
      </div>
    </div>
  );
}

function ContactPage({
  slug,
  onSubmit,
}: {
  slug: string;
  onSubmit: (
    slug: string,
    lead: { name: string; email: string; phone: string; message: string; source: string; consent: boolean },
  ) => Promise<string | null>;
}) {
  const tenant = useCurrentTenant();
  const layout = pageLayout(tenant, "contact");
  const base = `/site/${slug}`;
  return (
    <div className="space-y-8">
      {layout && hasPuckContent(layout) ? (
        <PuckPageContent layout={layout} base={base} />
      ) : (
        <h1 className="font-display text-3xl font-semibold">Contact</h1>
      )}
      <Suspense fallback={<p className="text-sm text-body">Loading the form…</p>}>
        <Enquiry slug={slug} onSubmit={onSubmit} />
      </Suspense>
    </div>
  );
}

function About() {
  const tenant = useCurrentTenant();
  const page = tenant.pages.find((item) => item.id === "about");
  return (
    <div className="grid gap-6 md:grid-cols-[180px_1fr]">
      {tenant.photoDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={tenant.photoDataUrl} alt="" className="h-44 w-44 rounded-2xl object-cover" />
      ) : (
        <div
          className="flex h-44 w-44 items-center justify-center rounded-(--site-radius-card) text-3xl font-semibold text-white"
          style={{ background: "var(--site-accent)" }}
        >
          {tenant.contactPerson.slice(0, 1)}
        </div>
      )}
      <div>
        <h1 className="font-display text-3xl font-semibold">{tenant.contactPerson}</h1>
        <p className="mt-2 text-sm text-muted">{tenant.businessName} · {tenant.arn}</p>
        <p className="mt-4 text-sm leading-6 text-body">{page?.body}</p>
      </div>
    </div>
  );
}

function Services() {
  const tenant = useCurrentTenant();
  const services = tenant.services.filter((service) => service.status === "published");
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Services</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <article key={service.id} className="rounded-(--site-radius-card) border border-line p-5">
            <h2 className="font-display text-lg font-semibold">{service.title}</h2>
            <p className="mt-2 text-sm leading-6 text-body">{service.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function Achievements() {
  const tenant = useCurrentTenant();
  const items = tenant.achievements.filter((item) => item.status === "published");
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Achievements</h1>
      <div className="mt-6 space-y-3">
        {items.length === 0 ? <p className="text-sm text-body">No published milestones yet.</p> : null}
        {items.map((item) => (
          <article key={item.id} className="rounded-(--site-radius-card) border border-line p-5">
            <p className="text-sm text-muted">{item.year}</p>
            <h2 className="font-medium">{item.title}</h2>
            <p className="mt-1 text-sm text-body">{item.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function Learn({ heading = "Learn" }: { heading?: string }) {
  const tenant = useCurrentTenant();
  const base = heading === "Blog" ? "blog" : "learn";
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">{heading}</h1>
      <div className="mt-6 space-y-3">
        {tenant.articles.filter((article) => article.status === "published").map((article) => (
          <Link key={article.slug} href={`/site/${tenant.slug}/${base}/${article.slug}`} className="block rounded-(--site-radius-card) border border-line p-5 hover:bg-canvas">
            <h2 className="font-medium">{article.title}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-body">{article.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ArticleView({ title, body }: { title: string; body: string }) {
  return (
    <article className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      <p className="mt-4 text-base leading-7 text-body">{body}</p>
      <p className="mt-6 text-[11px] leading-4 text-muted">{MARKET_RISK}</p>
    </article>
  );
}

function Funds({ colour, slug }: { colour: string; slug: string }) {
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState<"Both" | "Direct" | "Regular">("Both");
  const rows = sampleFunds.filter((fund) => {
    const matchesStyle = style === "Both" || fund.style === style;
    const matchesQuery = fund.name.toLowerCase().includes(query.toLowerCase()) || fund.category.toLowerCase().includes(query.toLowerCase());
    return matchesStyle && matchesQuery;
  });
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Fund search</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-body">
        Sample data in an AMFI-style layout. Source: sample list · as of 10 Oct 2026. Not live NAV. No rankings and no recommendation.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["Both", "Direct", "Regular"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStyle(option)}
            className="rounded-full px-3 py-1.5 text-sm"
            style={style === option ? buttonStyle : { background: "var(--canvas)" }}
          >
            {option}
          </button>
        ))}
      </div>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sample funds" className="mt-4 w-full rounded-lg border border-line-strong px-3 py-2 text-sm" />
      <div className="mt-4 overflow-hidden rounded-(--site-radius-card) border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Fund</th>
              <th className="px-4 py-3">NAV</th>
              <th className="hidden px-4 py-3 sm:table-cell">1 year</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((fund) => (
              <tr key={fund.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <p className="font-medium">{fund.name}</p>
                  <p className="text-xs text-muted">{fund.style} · {fund.category}</p>
                </td>
                <td className="px-4 py-3 tabular-nums">{inrExact(fund.nav)}</td>
                <td className="hidden px-4 py-3 tabular-nums sm:table-cell">{fund.oneYear.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link href={`/site/${slug}/contact?topic=Fund%20search`} className="mt-4 inline-block text-sm font-semibold" style={{ color: colour }}>
        Discuss this with your distributor
      </Link>
    </div>
  );
}

function Enquiry({
  slug,
  onSubmit,
}: {
  slug: string;
  onSubmit: (
    slug: string,
    lead: { name: string; email: string; phone: string; message: string; source: string; consent: boolean },
  ) => Promise<string | null>;
}) {
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const topic = useSearchParams().get("topic") ?? "Contact page";

  if (done) {
    return (
      <div>
        <h1 className="font-display text-3xl font-semibold">Thank you</h1>
        <p className="mt-3 text-sm leading-6 text-body">Your enquiry is in the distributor’s private inbox. Nobody else can see it.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl font-semibold">Contact</h1>
      <p className="mt-2 text-sm text-body">Source: {topic}</p>
      <form
        className="mt-6 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          if (data.get("consent") !== "on") {
            setError("Consent is required before an enquiry is saved.");
            return;
          }
          if (data.get("website")) return;
          setSending(true);
          setError("");
          void onSubmit(slug, {
            name: String(data.get("name") ?? ""),
            email: String(data.get("email") ?? ""),
            phone: String(data.get("phone") ?? ""),
            message: String(data.get("message") ?? ""),
            source: topic,
            consent: true,
          }).then((problem) => {
            setSending(false);
            if (problem) setError(problem);
            else setDone(true);
          });
        }}
      >
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <input name="name" required placeholder="Name" className="w-full rounded-lg border border-line-strong px-3 py-2 text-sm" />
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border border-line-strong px-3 py-2 text-sm" />
        <input name="phone" required placeholder="Phone" className="w-full rounded-lg border border-line-strong px-3 py-2 text-sm" />
        <textarea name="message" required placeholder="How can the distributor help?" className="min-h-28 w-full rounded-lg border border-line-strong px-3 py-2 text-sm" />
        <label className="flex items-start gap-2 text-sm text-body">
          <input name="consent" type="checkbox" className="mt-1" />
          I agree to be contacted about this enquiry.
        </label>
        {error ? <p className="text-sm text-bad">{error}</p> : null}
        <button type="submit" disabled={sending} className="rounded-(--site-radius-button) px-4 py-2.5 text-sm font-semibold disabled:opacity-60" style={buttonStyle}>
          {sending ? "Sending…" : "Send enquiry"}
        </button>
      </form>
    </div>
  );
}

function Disclosures() {
  const tenant = useCurrentTenant();
  return (
    <article className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold">Disclosures</h1>
      <p className="mt-4 text-sm leading-6 text-body">
        {tenant.businessName} ({tenant.arn}) is an {AMFI_LINE}. This page stays on the site. Enquiries are visible only inside this distributor’s dashboard.
      </p>
      <p className="mt-4 text-[11px] leading-4 text-muted">{MARKET_RISK}</p>
    </article>
  );
}

function Missing() {
  return <p className="text-sm text-body">That note is not published.</p>;
}

function ChatPanel({
  slug,
  onClose,
}: {
  slug: string;
  onClose: () => void;
}) {
  const tenant = useCurrentTenant();
  const { addLead } = usePrototype();
  const [text, setText] = useState("");
  const [lines, setLines] = useState<string[]>([
    "I am an automated assistant. I answer only from approved notes and I do not recommend schemes.",
  ]);
  return (
    <div className="rounded-(--site-radius-card) border border-line bg-(--site-bg) p-4 shadow-[0_10px_15px_-3px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Assistant</p>
        <button type="button" onClick={onClose} className="text-sm text-muted">Close</button>
      </div>
      <div className="mt-3 max-h-56 space-y-2 overflow-y-auto text-sm leading-5">
        {lines.map((line, index) => (
          <p key={`${line}-${index}`} className="rounded-xl bg-canvas px-3 py-2">{line}</p>
        ))}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const question = text.trim();
          if (!question) return;
          const lower = question.toLowerCase();
          let reply = "I can only answer from approved notes. Please use the contact form for anything personal.";
          if (lower.includes("recommend") || lower.includes("which fund") || lower.includes("which scheme")) {
            void addLead(slug, {
              name: "Chat visitor",
              email: "",
              phone: "",
              message: question,
              source: "Website chat",
            });
            reply = "I cannot recommend a scheme. I have passed this to the distributor as an enquiry.";
          } else {
            const match = tenant.faqs.find((faq) => lower.includes(faq.question.toLowerCase().slice(0, 16)));
            if (match) reply = match.answer;
          }
          setLines((current) => [...current, question, reply]);
          setText("");
        }}
      >
        <input value={text} onChange={(event) => setText(event.target.value)} className="w-full rounded-lg border border-line-strong px-3 py-2 text-sm" placeholder="Ask from the approved list" />
        <button type="submit" className="rounded-(--site-radius-button) px-3 text-sm font-semibold" style={buttonStyle}>
          Send
        </button>
      </form>
    </div>
  );
}
