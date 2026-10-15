"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { StudioLogo } from "@/components/brand/studio-logo";
import { usePrototype } from "@/features/studio/hooks";
import { ImageUpload } from "@/components/brand/image-upload";
import { Button, ButtonLink, Field, fieldClass } from "@/components/ui/ui";
import { sitePath, siteSubdomainUrl, type WebsiteDraft } from "@/lib/build-tenant";
import { findRestrictedTerm } from "@/lib/format";
import { plans } from "@/lib/plans";
import { fontPresets, fontStyleVars, isHexColour, themePresets } from "@/lib/themes";
import { TemplateThumb } from "@/components/dashboard/design-studio";
import { templates } from "@/lib/design";

const serviceOptions = [
  {
    title: "SIP registration help",
    description: "Help choosing an amount a family can continue, and completing the purchase with the fund house.",
  },
  {
    title: "Goal conversations",
    description: "A structured talk about education, a home, or retirement. Numbers are estimates, not a promised return.",
  },
  {
    title: "Transaction support",
    description: "Purchases, switches, and redemptions, with the paperwork explained before anyone signs.",
  },
  {
    title: "Investor education",
    description: "Short sessions that explain SIPs, inflation, and risk in plain language.",
  },
];

const steps = ["Plan", "You", "Business", "Look", "Services", "Contact", "Your link"];

export function CreateWebsite() {
  const { createWebsite, status, user, activeTenant } = usePrototype();
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [origin, setOrigin] = useState("");
  const [draft, setDraft] = useState<WebsiteDraft>({
    plan: "growth",
    contactPerson: params.get("name") ?? "",
    email: params.get("email") ?? "",
    businessName: params.get("business") ?? "",
    arn: params.get("arn") ?? "",
    city: "",
    phone: "",
    intro: "",
    languages: ["English", "Hindi"],
    template: "classic",
    primaryColour: "#0D9488",
    fontStyle: "modern",
    services: [serviceOptions[0], serviceOptions[1]],
    logoDataUrl: null,
    photoDataUrl: null,
    hours: "Mon–Sat, 10:00–18:30",
    arnExpiry: "2027-03-31",
  });
  const [createdSlug, setCreatedSlug] = useState("");
  const seeded = useRef(false);
  const createdPath = createdSlug ? sitePath(createdSlug) : "";

  useEffect(() => {
    if (!user || seeded.current) return;
    seeded.current = true;
    setDraft((current) => ({
      ...current,
      contactPerson: user.name || current.contactPerson,
      email: user.email,
      arn: user.arn || current.arn,
      phone: user.phone || current.phone,
    }));
  }, [user]);
  const subdomainUrl = createdSlug ? siteSubdomainUrl(createdSlug, origin) : "";

  function patch(partial: Partial<WebsiteDraft>) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  async function next() {
    const problem = validate(step, { ...draft, email: user?.email ?? draft.email }, null);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    if (step === 5) {
      setBusy(true);
      const result = await createWebsite({ ...draft, email: user?.email ?? draft.email }, "");
      setBusy(false);
      if (!result.tenant) {
        setError(result.error ?? "Could not create the website.");
        return;
      }
      if (result.error) setError(result.error);
      setCreatedSlug(result.tenant.slug);
      setOrigin(window.location.origin);
      setStep(6);
      return;
    }
    setStep((value) => value + 1);
  }

  if (status === "loading") {
    return (
      <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-20">
        <p className="font-display text-2xl font-semibold">Opening your account…</p>
      </main>
    );
  }

  if (status === "ready" && !user) {
    return (
      <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-20">
        <p className="text-sm font-semibold text-teal">Account required</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Register before you create a website</h1>
        <p className="mt-3 text-sm leading-6 text-body">
          Website setup is inside the dashboard. Create an account, then come back signed in.
        </p>
        <div className="mt-6 flex gap-3">
          <ButtonLink href="/signup" className="w-fit">Register</ButtonLink>
          <ButtonLink href="/login" variant="secondary" className="w-fit">Log in</ButtonLink>
        </div>
      </main>
    );
  }

  if (status === "ready" && activeTenant && !busy && !createdSlug) {
    return (
      <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-20">
        <p className="text-sm font-semibold text-teal">You already have a website</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">{activeTenant.businessName}</h1>
        <p className="mt-3 text-sm leading-6 text-body">
          One account runs one practice. Open the dashboard to edit it, or log out to create a different practice.
        </p>
        <ButtonLink href="/dashboard" className="mt-6 w-fit">Open my dashboard</ButtonLink>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_28%,#eef2ff_100%)]">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/dashboard" className="inline-block">
          <StudioLogo />
        </Link>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">Create your website</h1>
        <p className="mt-2 text-sm leading-6 text-body">
          You are signed in{user?.name ? ` as ${user.name}` : ""}. Fill these short steps. At the end you get a link you can open and share.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {steps.map((label, index) => (
            <span
              key={label}
              className={
                index === step
                  ? "rounded-full bg-teal px-3 py-1 text-xs font-semibold text-white"
                  : index < step
                    ? "rounded-full bg-good-soft px-3 py-1 text-xs font-semibold text-good"
                    : "rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted ring-1 ring-line"
              }
            >
              {index + 1}. {label}
            </span>
          ))}
        </div>

        <section className="mt-6 rounded-3xl border border-line bg-white p-6 shadow-[0_10px_15px_-3px_rgba(15,23,42,0.05)]">
          {step === 0 ? (
            <div>
              <h2 className="font-display text-xl font-semibold">Which plan should this practice start on?</h2>
              <p className="mt-2 text-sm text-body">This decides page limits and which dashboard tools open. Nothing is billed online; the plan is confirmed in writing.</p>
              <div className="mt-4 grid gap-3">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => patch({ plan: plan.id })}
                    className={
                      draft.plan === plan.id
                        ? "rounded-2xl border-2 border-teal bg-teal/10 p-4 text-left"
                        : "rounded-2xl border border-line p-4 text-left"
                    }
                  >
                    <span className="font-semibold">{plan.name}</span>
                    <span className="mt-1 block text-sm text-body">{plan.summary}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold">Who is creating this site?</h2>
              <Field label="Your name">
                <input className={fieldClass} value={draft.contactPerson} onChange={(event) => patch({ contactPerson: event.target.value })} />
              </Field>
              <p className="rounded-2xl bg-canvas px-4 py-3 text-sm text-body">
                Signed in as <span className="font-medium text-ink">{user?.email}</span>. The website will belong to this account.
              </p>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold">What should investors call the practice?</h2>
              <Field label="Business name" hint="This becomes the name on the website and part of the web address.">
                <input className={fieldClass} value={draft.businessName} onChange={(event) => patch({ businessName: event.target.value })} />
              </Field>
              <Field label="ARN" hint="Example: ARN-18432. It is locked onto every public page.">
                <input className={fieldClass} value={draft.arn} onChange={(event) => patch({ arn: event.target.value })} />
              </Field>
              <Field label="City">
                <input className={fieldClass} value={draft.city} onChange={(event) => patch({ city: event.target.value })} />
              </Field>
              <Field label="One short introduction">
                <textarea className={`${fieldClass} min-h-24`} value={draft.intro} onChange={(event) => patch({ intro: event.target.value })} />
              </Field>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <h2 className="font-display text-xl font-semibold">Choose how your website looks.</h2>
              <p className="mt-2 text-sm text-body">
                Start with a template. You can change every colour, font, and layout later from Dashboard → Design.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {templates.map((template) => {
                  const selected = draft.template === template.id;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() =>
                        patch({
                          template: template.id,
                          primaryColour: template.tokens.primaryColour,
                          fontStyle: template.tokens.fontStyle,
                        })
                      }
                      className={
                        selected
                          ? "rounded-2xl border-2 border-teal bg-teal/5 p-2 text-left"
                          : "rounded-2xl border border-line p-2 text-left hover:border-line-strong"
                      }
                    >
                      <TemplateThumb tokens={template.tokens} />
                      <span className="mt-2 block px-0.5 text-sm font-semibold">{template.name}</span>
                      <span className="block px-0.5 text-xs leading-4 text-muted">{template.description}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-6 text-[13px] font-medium">Brand colour</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {themePresets.map((theme) => {
                  const selected = draft.primaryColour.toLowerCase() === theme.color.toLowerCase();
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => patch({ primaryColour: theme.color })}
                      className="flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm"
                      style={{
                        borderColor: selected ? theme.color : "#e2e8f0",
                        background: selected ? `${theme.color}14` : "white",
                      }}
                    >
                      <span className="h-4 w-4 rounded-full" style={{ background: theme.color }} />
                      <span className="font-medium">{theme.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="color"
                  aria-label="Custom theme colour"
                  value={isHexColour(draft.primaryColour) ? draft.primaryColour : "#0D9488"}
                  onChange={(event) => patch({ primaryColour: event.target.value })}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-white p-1"
                />
                <input
                  value={draft.primaryColour}
                  onChange={(event) => {
                    const next = event.target.value;
                    if (isHexColour(next) || next.startsWith("#")) patch({ primaryColour: next });
                  }}
                  className={fieldClass}
                  placeholder="#0D9488"
                />
              </div>
              <p className="mt-5 text-[13px] font-medium">Font style</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {fontPresets.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => patch({ fontStyle: font.id })}
                    style={{
                      ...fontStyleVars(font.id),
                      borderColor: draft.fontStyle === font.id ? draft.primaryColour : "#e2e8f0",
                    }}
                    className="rounded-xl border-2 bg-white px-3 py-2 text-left"
                  >
                    <span className="block font-display text-base font-semibold">{font.name}</span>
                    <span className="block text-xs text-muted">Aa Bb 123</span>
                  </button>
                ))}
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <ImageUpload
                  label="Logo"
                  hint="Shown in the website header and in your office. Optional."
                  emptyLabel="Logo"
                  value={draft.logoDataUrl}
                  onChange={(logoDataUrl) => patch({ logoDataUrl })}
                  onError={setError}
                />
                <ImageUpload
                  label="Your photo"
                  hint="Shown on the About page. Optional."
                  emptyLabel="Photo"
                  value={draft.photoDataUrl}
                  onChange={(photoDataUrl) => patch({ photoDataUrl })}
                  onError={setError}
                />
              </div>
              <div
                className="mt-6 flex items-center gap-3 rounded-2xl p-4 text-white"
                style={{ background: draft.primaryColour, ...fontStyleVars(draft.fontStyle) }}
              >
                {draft.logoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.logoDataUrl} alt="" className="h-12 w-12 rounded-lg bg-white object-contain" />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 text-lg font-semibold">
                    {(draft.businessName || "Y").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span>
                  <span className="block font-display text-lg font-semibold">{draft.businessName || "Your practice"}</span>
                  <span className="block text-sm text-white/80">AMFI-registered Mutual Fund Distributor · {draft.arn || "ARN"}</span>
                </span>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <h2 className="font-display text-xl font-semibold">What do you help investors with?</h2>
              <p className="mt-2 text-sm text-body">Tick at least one. You can rewrite these later in the dashboard.</p>
              <div className="mt-4 space-y-2">
                {serviceOptions.map((option) => {
                  const on = draft.services.some((service) => service.title === option.title);
                  return (
                    <label key={option.title} className="flex gap-3 rounded-2xl border border-line p-4">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => {
                          patch({
                            services: on
                              ? draft.services.filter((service) => service.title !== option.title)
                              : [...draft.services, option],
                          });
                        }}
                      />
                      <span>
                        <span className="block font-medium">{option.title}</span>
                        <span className="mt-1 block text-sm text-body">{option.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold">How should an investor reach you?</h2>
              <Field label="Phone">
                <input className={fieldClass} value={draft.phone} onChange={(event) => patch({ phone: event.target.value })} />
              </Field>
              <Field label="Office hours" hint="Shown next to the address on the public site.">
                <input className={fieldClass} value={draft.hours} onChange={(event) => patch({ hours: event.target.value })} />
              </Field>
              <Field label="ARN expiry" hint="Used on the compliance screen. Example: 2027-03-31.">
                <input type="date" className={fieldClass} value={draft.arnExpiry} onChange={(event) => patch({ arnExpiry: event.target.value })} />
              </Field>
              <Field label="Languages" hint="Separate with commas.">
                <input
                  className={fieldClass}
                  value={draft.languages.join(", ")}
                  onChange={(event) =>
                    patch({
                      languages: event.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                    })
                  }
                />
              </Field>
            </div>
          ) : null}

          {step === 6 && createdPath ? (
            <div>
              <p className="text-sm font-semibold text-good">Your website is ready</p>
              <h2 className="mt-2 font-display text-2xl font-semibold">This address belongs to {draft.businessName}</h2>
              {subdomainUrl ? (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Your website address</p>
                  <a href={subdomainUrl} className="mt-1 block break-all rounded-2xl bg-canvas px-4 py-3 font-medium text-teal">
                    {subdomainUrl}
                  </a>
                </>
              ) : null}
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                {subdomainUrl ? "Also works at" : "Your website address"}
              </p>
              <a href={createdPath} className="mt-1 block break-all rounded-2xl bg-canvas px-4 py-3 font-medium text-teal">
                {origin}{createdPath}
              </a>
              <p className="mt-3 text-sm leading-6 text-body">
                The website is saved in the database, so it opens on any device. The dashboard is the private office where you edit pages and read enquiries. You can connect your own domain later from Dashboard → Domain.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href={createdPath} className="inline-flex h-11 items-center rounded-lg bg-teal px-4 text-sm font-semibold text-white">
                  Open my website
                </a>
                <Link href="/dashboard" className="inline-flex h-11 items-center rounded-lg border border-line-strong px-4 text-sm font-semibold">
                  Open my dashboard
                </Link>
              </div>
            </div>
          ) : null}

          {error ? <p className="mt-4 text-sm text-bad">{error}</p> : null}
          {step < 6 ? (
            <div className="mt-6 flex gap-3">
              {step > 0 ? (
                <Button type="button" variant="secondary" onClick={() => { setError(""); setStep((value) => value - 1); }}>
                  Back
                </Button>
              ) : null}
              <Button type="button" onClick={() => void next()} disabled={busy}>
                {busy ? "Creating your website…" : step === 5 ? "Create my website" : "Continue"}
              </Button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function validate(step: number, draft: WebsiteDraft, password: string | null) {
  if (step === 1) {
    if (draft.contactPerson.trim().length < 2) return "Enter your name.";
    if (!draft.email.includes("@")) return "Enter a work email.";
    if (password !== null && password.length < 8) return "Use a password with at least 8 characters.";
  }
  if (step === 2) {
    const blocked = findRestrictedTerm(draft.businessName);
    if (blocked) return `“${blocked}” cannot be used in a distributor name.`;
    if (draft.businessName.trim().length < 3) return "Enter the business name investors should see.";
    if (draft.arn.trim().length < 4) return "Enter the ARN.";
    if (draft.city.trim().length < 2) return "Enter the city.";
    if (draft.intro.trim().length < 12) return "Write one or two sentences about the practice.";
  }
  if (step === 4 && draft.services.length === 0) return "Choose at least one service.";
  if (step === 5 && draft.phone.trim().length < 8) return "Enter a phone number investors can use.";
  return "";
}
