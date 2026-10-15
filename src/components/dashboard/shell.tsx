"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  Calculator,
  Bot,
  Briefcase,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  ListChecks,
  LoaderCircle,
  Lock,
  Megaphone,
  Menu,
  Moon,
  Palette,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Stamp,
  Sun,
  Trophy,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { StudioLogo } from "@/components/brand/studio-logo";
import { useDashboardTheme } from "@/components/dashboard/theme";
import { usePrototype } from "@/features/studio/hooks";
import { ButtonLink, cn } from "@/components/ui/ui";
import { sitePath } from "@/lib/build-tenant";
import { getPlan, hasAiChat, hasTeam } from "@/lib/plans";

type NavItem = { href: string; label: string; icon: LucideIcon };

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Practice",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/setup", label: "Setup", icon: ListChecks },
    ],
  },
  {
    label: "Website",
    items: [
      { href: "/dashboard/design", label: "Design", icon: Palette },
      { href: "/dashboard/branding", label: "Branding", icon: Stamp },
      { href: "/dashboard/pages", label: "Pages", icon: FileText },
      { href: "/dashboard/services", label: "Services", icon: Briefcase },
      { href: "/dashboard/achievements", label: "Achievements", icon: Trophy },
      { href: "/dashboard/media", label: "Media", icon: ImageIcon },
      { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
      { href: "/dashboard/learn", label: "Learn", icon: BookOpen },
      { href: "/dashboard/calculators", label: "Calculators", icon: Calculator },
      { href: "/dashboard/preview", label: "Preview", icon: Eye },
    ],
  },
  {
    label: "Enquiries",
    items: [{ href: "/dashboard/leads", label: "Leads", icon: Inbox }],
  },
  {
    label: "Growth",
    items: [
      { href: "/dashboard/domain", label: "Domain", icon: Globe },
      { href: "/dashboard/seo", label: "SEO", icon: Search },
      { href: "/dashboard/ai", label: "AI answers", icon: Bot },
      { href: "/dashboard/team", label: "Team", icon: Users },
      { href: "/dashboard/wallet", label: "AI wallet", icon: Wallet },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/compliance", label: "Compliance", icon: ShieldCheck },
      { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
      { href: "/dashboard/settings", label: "Account", icon: Settings },
    ],
  },
];

const allItems = groups.flatMap((group) => group.items);

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeTenant, status, user, canEditSite, sync, syncError } = usePrototype();
  const { theme, toggle } = useDashboardTheme();
  const [open, setOpen] = useState(false);
  const dark = theme === "dark";

  if (status === "loading") {
    return (
      <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-20">
        <p className="flex items-center gap-3 font-display text-2xl font-semibold">
          <LoaderCircle className="h-6 w-6 animate-spin text-teal" aria-hidden />
          Opening your office…
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-20">
        <p className="text-sm font-semibold text-teal">Private area</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Log in to open your dashboard</h1>
        <p className="mt-3 text-sm leading-6 text-body">
          The dashboard is where you edit your website and read enquiries. Only you can see it.
        </p>
        <div className="mt-6 flex gap-3">
          <ButtonLink href="/login" className="w-fit">Log in</ButtonLink>
          <ButtonLink href="/signup" variant="secondary" className="w-fit">Register</ButtonLink>
        </div>
      </main>
    );
  }

  if (!activeTenant) {
    return (
      <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-20">
        <p className="text-sm font-semibold text-teal">Your account</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Welcome{user.name ? `, ${user.name}` : ""}</h1>
        <p className="mt-3 text-sm leading-6 text-body">
          You are signed in. Create the practice website from here. It is not available on the public site.
        </p>
        <dl className="mt-5 space-y-2 rounded-2xl border border-line bg-white px-4 py-3 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-muted">Email</dt><dd className="font-medium">{user.email}</dd></div>
          {user.phone ? <div className="flex justify-between gap-4"><dt className="text-muted">Mobile</dt><dd className="font-medium">{user.phone}</dd></div> : null}
          {user.arn ? <div className="flex justify-between gap-4"><dt className="text-muted">ARN</dt><dd className="font-medium">{user.arn}</dd></div> : null}
        </dl>
        <ButtonLink href="/create" className="mt-6 w-fit">Create website</ButtonLink>
      </main>
    );
  }

  const plan = getPlan(activeTenant.plan);
  const current = allItems.find((item) => item.href === pathname);
  const CurrentIcon = current?.icon ?? LayoutDashboard;
  const initial = activeTenant.businessName.trim().slice(0, 1).toUpperCase();
  const person = activeTenant.contactPerson || user.email;
  const newLeads = activeTenant.leads.filter((lead) => lead.status === "new").length;

  return (
    <div className={cn("min-h-full bg-app text-ink", dark && "dash-dark")}>
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-[#020617]/60 backdrop-blur-[2px] lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-edge bg-surface transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-2.5 px-5">
          <Link href="/" className="min-w-0">
            <StudioLogo theme={theme} />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            className="rounded-md p-1.5 text-muted hover:bg-subtle hover:text-ink lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="mx-3 rounded-xl border border-edge bg-subtle px-3 py-2.5">
          <div className="flex items-center gap-3">
            {activeTenant.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeTenant.logoDataUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg bg-white object-contain ring-1 ring-edge" />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal text-sm font-semibold text-white">
                {initial}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">{activeTenant.businessName}</span>
              <span className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted">
                <BadgeCheck className="h-3 w-3 shrink-0 text-teal" aria-hidden />
                {activeTenant.arn}
              </span>
            </span>
          </div>
        </div>

        <nav className="sidebar-scroll mt-4 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-1 px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  const locked =
                    (item.href === "/dashboard/ai" && !hasAiChat(activeTenant.plan)) ||
                    (item.href === "/dashboard/team" && !hasTeam(activeTenant.plan)) ||
                    (item.href === "/dashboard/wallet" && !hasAiChat(activeTenant.plan));
                  const count = item.href === "/dashboard/leads" ? newLeads : 0;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] transition-colors",
                        active ? "bg-teal/10 font-semibold text-teal" : "font-medium text-body hover:bg-subtle hover:text-ink",
                      )}
                    >
                      {active ? <span className="absolute inset-y-1.5 -left-3 w-[3px] rounded-r-full bg-teal" aria-hidden /> : null}
                      <Icon
                        className={cn("h-4 w-4 shrink-0", active ? "text-teal" : "text-muted group-hover:text-ink")}
                        strokeWidth={active ? 2.25 : 1.9}
                        aria-hidden
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {locked ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-soft px-1.5 py-0.5 text-[10px] font-semibold text-amber">
                          <Lock className="h-2.5 w-2.5" aria-hidden />
                          Upgrade
                        </span>
                      ) : count > 0 ? (
                        <span className="min-w-5 rounded-full bg-teal px-1.5 py-0.5 text-center text-[10px] font-semibold text-white tabular-nums">
                          {count}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-edge p-3">
          <Link
            href="/dashboard/billing"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-subtle"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-subtle text-xs font-semibold text-ink ring-1 ring-edge">
              {person.trim().slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-ink">{person}</span>
              <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                <Sparkles className="h-3 w-3 text-teal" aria-hidden />
                {plan.name} plan
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-edge bg-surface/85 px-4 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-edge text-body hover:bg-subtle lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-4 w-4" aria-hidden />
            </button>
            <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal/10 text-teal sm:flex">
              <CurrentIcon className="h-4.5 w-4.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="hidden text-[11px] font-medium text-muted sm:block">Dashboard</p>
              <p className="truncate text-sm font-semibold leading-5 text-ink">{current?.label ?? "Dashboard"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {sync !== "idle" ? (
              <span
                title={syncError || undefined}
                role="status"
                className={cn(
                  "hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium md:inline-flex",
                  sync === "error" ? "bg-bad-soft text-bad" : "text-muted",
                )}
              >
                {sync === "saving" ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : sync === "saved" ? (
                  <CircleCheck className="h-3.5 w-3.5 text-good" aria-hidden />
                ) : (
                  <CircleAlert className="h-3.5 w-3.5" aria-hidden />
                )}
                {sync === "saving" ? "Saving…" : sync === "saved" ? "All changes saved" : `Not saved: ${syncError}`}
              </span>
            ) : null}
            <span className="hidden items-center gap-2 rounded-full border border-edge bg-surface px-2.5 py-1 text-xs font-medium text-body sm:inline-flex">
              <span className="relative flex h-2 w-2">
                {activeTenant.published ? <span className="absolute inset-0 animate-ping rounded-full bg-good/50" /> : null}
                <span className={cn("relative h-2 w-2 rounded-full", activeTenant.published ? "bg-good" : "bg-amber")} />
              </span>
              {activeTenant.published ? "Website live" : "Unpublished"}
            </span>
            {hasAiChat(activeTenant.plan) ? (
              <Link
                href="/dashboard/wallet"
                className="hidden items-center gap-1.5 rounded-full bg-indigo-soft px-2.5 py-1 text-xs font-semibold text-indigo lg:inline-flex"
              >
                <Wallet className="h-3.5 w-3.5" aria-hidden />
                ₹{plan.aiCredit}
              </Link>
            ) : null}

            <span className="mx-1 hidden h-6 w-px bg-edge sm:block" aria-hidden />

            <button
              type="button"
              onClick={toggle}
              aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
              title={dark ? "Light theme" : "Dark theme"}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-edge bg-surface text-body transition-colors hover:bg-subtle hover:text-ink"
            >
              {dark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
            </button>

            <Link
              href={sitePath(activeTenant.slug)}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-teal px-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">View site</span>
            </Link>
          </div>
        </header>
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {!canEditSite ? (
            <div
              role="status"
              className="mb-4 rounded-xl border border-amber/40 bg-amber-soft px-4 py-3 text-sm text-amber"
            >
              <span className="font-semibold">View only.</span> Your role on this practice is Viewer, so the dashboard
              cannot save changes. In Payload admin, set your tenant role to Admin to edit again, or use Payload admin as
              Super Admin.
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}
