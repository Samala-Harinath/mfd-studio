"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ImageUpload } from "@/components/brand/image-upload";
import { useRequiredTenant } from "@/features/studio/hooks";
import { Badge, ButtonLink, cn } from "@/components/ui/ui";
import { PublicView, type PublicViewName } from "@/components/website/public-site";
import { sitePath } from "@/lib/build-tenant";
import {
  contrastRatio,
  cornerStyles,
  DEFAULT_HERO_BUTTON,
  designProblem,
  designWarning,
  getTemplate,
  headerLayouts,
  heroLayouts,
  isCustomised,
  MIN_TEXT_CONTRAST,
  modeDefaults,
  templateDesign,
  templates,
  themeModes,
  type CornerStyle,
  type DesignTokens,
  type HeaderLayout,
  type HeroLayout,
  type SiteDesign,
  type TemplateId,
} from "@/lib/design";
import { homeLayoutFromPractice, syncHomeBanner } from "@/lib/puck/defaults";
import { parsePageLayout } from "@/lib/puck/types";
import type { Tenant } from "@/lib/sample-data";
import { fontPresets, fontStyleVars, isHexColour, themePresets } from "@/lib/themes";

const previewRoutes: Record<string, PublicViewName> = {
  about: "about",
  services: "services",
  achievements: "achievements",
  learn: "learn",
  tools: "tools",
  calculators: "tools",
  funds: "funds",
  contact: "contact",
  disclosures: "disclosures",
  blog: "blog",
};

function previewViewFromHref(href: string, tenantSlug: string): PublicViewName | null {
  let pathname: string;
  try {
    pathname = new URL(href, window.location.origin).pathname;
  } catch {
    return null;
  }
  const base = sitePath(tenantSlug);
  if (pathname !== base && !pathname.startsWith(`${base}/`)) return null;
  const segment = pathname.slice(base.length).replace(/^\//, "").split("/")[0];
  if (!segment) return "home";
  return previewRoutes[segment] ?? null;
}

function designOf(tenant: Tenant): SiteDesign {
  return {
    template: tenant.template,
    themeMode: tenant.themeMode,
    backgroundColour: tenant.backgroundColour,
    textColour: tenant.textColour,
    primaryColour: tenant.primaryColour,
    buttonColour: tenant.buttonColour,
    fontStyle: tenant.fontStyle,
    headerLayout: tenant.headerLayout,
    heroLayout: tenant.heroLayout,
    cornerStyle: tenant.cornerStyle,
    heroTitle: tenant.heroTitle,
    heroButtonLabel: tenant.heroButtonLabel,
  };
}

export function DesignStudio() {
  const { activeTenant, updateActive } = useRequiredTenant();
  const [design, setDesign] = useState<SiteDesign>(() => designOf(activeTenant));
  const [problem, setProblem] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [page, setPage] = useState<PublicViewName>("home");

  const preview: Tenant = { ...activeTenant, ...design };
  const warning = designWarning(design);

  useEffect(() => {
    const home = activeTenant.pages.find((page) => page.id === "home");
    if (parsePageLayout(home?.layout)) return;
    updateActive(withHomeBanner({}));
    // Persist the visual home once so Design and the public site share it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const template = getTemplate(design.template);
  const customised = isCustomised(design);
  const ratio = contrastRatio(design.textColour, design.backgroundColour);

  const bannerKeys: (keyof SiteDesign | "heroImageDataUrl")[] = ["heroTitle", "heroButtonLabel", "heroLayout", "template"];

  function withHomeBanner(patch: Partial<Tenant>): Pick<Tenant, "pages"> {
    const merged: Tenant = { ...activeTenant, ...design, ...patch };
    const home = merged.pages.find((page) => page.id === "home");
    const base = parsePageLayout(home?.layout) ?? homeLayoutFromPractice(merged);
    return {
      pages: merged.pages.map((page) => (page.id === "home" ? { ...page, layout: syncHomeBanner(base, merged) } : page)),
    };
  }

  /** The preview always shows the change. Only a change that passes the rulebook is saved. */
  function change(patch: Partial<SiteDesign>) {
    const next = { ...design, ...patch };
    setDesign(next);
    const error = designProblem(next);
    setProblem(error);
    if (error) return;
    if (bannerKeys.some((key) => key in patch)) {
      updateActive({ ...next, ...withHomeBanner(next) });
      return;
    }
    updateActive(next);
  }

  function applyTemplate(id: TemplateId) {
    change({ ...templateDesign(id), template: id });
    setNotice(`${getTemplate(id).name} applied. Your words, logo, photos, and pages stay as they are.`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Design</h1>
          <p className="mt-1 max-w-2xl text-sm text-body">
            Start from a template, then adjust colours, fonts, header, and home banner. The home page is the visual layout
            visitors already see. The preview changes as you click, and every change saves on its own.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            value={device}
            options={[
              { id: "desktop", label: "Desktop" },
              { id: "phone", label: "Phone" },
            ]}
            onChange={setDevice}
          />
          <ButtonLink href={sitePath(activeTenant.slug)} variant="secondary" size="sm">
            Open live site
          </ButtonLink>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="preview-scroll space-y-3 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto xl:pr-1">
          {problem ? (
            <div role="alert" className="sticky top-0 z-10 rounded-xl border border-bad/30 bg-bad-soft px-4 py-3 text-sm text-bad shadow-sm">
              <span className="font-semibold">Not saved.</span> {problem}
            </div>
          ) : null}

          <Panel
            title="Template"
            hint="A complete starting look. Applying one changes colours, fonts, and layout together."
            aside={customised ? <Badge tone="review">Customised</Badge> : <Badge tone="published">{template.name}</Badge>}
          >
            <div className="grid grid-cols-2 gap-2.5">
              {templates.map((item) => {
                const selected = design.template === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => applyTemplate(item.id)}
                    className={cn(
                      "rounded-xl border bg-surface p-2 text-left transition hover:border-line-strong",
                      selected ? "border-brand ring-2 ring-brand/20" : "border-edge",
                    )}
                  >
                    <TemplateThumb tokens={item.tokens} />
                    <span className="mt-2 block px-0.5 text-[13px] font-semibold text-ink">{item.name}</span>
                    <span className="block px-0.5 text-[11px] leading-4 text-muted">{item.description}</span>
                  </button>
                );
              })}
            </div>
            {customised ? (
              <button type="button" onClick={() => applyTemplate(design.template)} className="mt-3 text-[13px] font-semibold text-brand">
                Reset to {template.name}
              </button>
            ) : null}
            {notice ? <p className="mt-3 text-[13px] text-body">{notice}</p> : null}
          </Panel>

          <Panel title="Colours" hint="Light or dark sets a sensible background and text colour. Fine-tune any of them below.">
            <Segmented
              value={design.themeMode}
              options={themeModes.map((mode) => ({ id: mode.id, label: mode.name }))}
              onChange={(mode) => change({ themeMode: mode, ...modeDefaults[mode] })}
            />
            <div className="mt-4 space-y-3">
              <ColourField label="Background" value={design.backgroundColour} onChange={(backgroundColour) => change({ backgroundColour })} />
              <ColourField label="Text" value={design.textColour} onChange={(textColour) => change({ textColour })} />
              <div className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2 text-[12px]">
                <span className="text-body">Text readability {ratio.toFixed(1)} : 1</span>
                <Badge tone={ratio >= 7 ? "published" : ratio >= MIN_TEXT_CONTRAST ? "review" : "danger"}>
                  {ratio >= 7 ? "Easy to read" : ratio >= MIN_TEXT_CONTRAST ? "Readable" : "Too faint"}
                </Badge>
              </div>
              <ColourField
                label="Brand colour"
                hint="Links, small labels, and the letter mark."
                value={design.primaryColour}
                onChange={(primaryColour) => change({ primaryColour })}
                swatches
              />
              <ColourField
                label="Buttons"
                hint="The label turns white or dark automatically so it stays readable."
                value={design.buttonColour}
                onChange={(buttonColour) => change({ buttonColour })}
                swatches
              />
              {design.buttonColour.toLowerCase() !== design.primaryColour.toLowerCase() ? (
                <button type="button" onClick={() => change({ buttonColour: design.primaryColour })} className="text-[13px] font-semibold text-brand">
                  Match the brand colour
                </button>
              ) : null}
              {warning ? <p className="text-[13px] leading-5 text-amber">{warning}</p> : null}
            </div>
          </Panel>

          <Panel title="Font" hint="Used for headings and text across every page.">
            <div className="grid grid-cols-2 gap-2">
              {fontPresets.map((font) => (
                <OptionCard key={font.id} selected={design.fontStyle === font.id} onClick={() => change({ fontStyle: font.id })}>
                  <span style={fontStyleVars(font.id)} className="block">
                    <span className="block font-display text-[17px] font-semibold text-ink">{font.name}</span>
                    <span className="block text-xs text-muted">Aa Bb 123</span>
                  </span>
                </OptionCard>
              ))}
            </div>
          </Panel>

          <Panel title="Header" hint="How the name, menu, and Enquire button sit at the top. The ARN stays in every layout.">
            <div className="grid grid-cols-3 gap-2">
              {headerLayouts.map((layout) => (
                <OptionCard
                  key={layout.id}
                  selected={design.headerLayout === layout.id}
                  onClick={() => change({ headerLayout: layout.id })}
                  title={layout.hint}
                >
                  <HeaderDiagram layout={layout.id} />
                  <span className="mt-2 block text-[12px] font-semibold text-ink">{layout.name}</span>
                </OptionCard>
              ))}
            </div>
            <div className="mt-4 border-t border-edge pt-4">
              <ImageUpload
                label="Logo"
                hint="Shown in the site header instead of the letter mark. PNG, JPG, or WebP with a clear background works best."
                emptyLabel="Logo"
                value={activeTenant.logoDataUrl}
                onChange={(logoDataUrl) => {
                  updateActive({ logoDataUrl });
                  setProblem(null);
                  setNotice(logoDataUrl ? "Logo added to the header preview." : "Logo removed from the header.");
                }}
                onError={setProblem}
              />
            </div>
          </Panel>

          <Panel title="Home banner" hint="The first thing visitors see on the home page.">
            <div className="grid grid-cols-3 gap-2">
              {heroLayouts.map((layout) => (
                <OptionCard
                  key={layout.id}
                  selected={design.heroLayout === layout.id}
                  onClick={() => change({ heroLayout: layout.id })}
                  title={layout.hint}
                >
                  <HeroDiagram layout={layout.id} />
                  <span className="mt-2 block text-[12px] font-semibold text-ink">{layout.name}</span>
                </OptionCard>
              ))}
            </div>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-[13px] font-medium text-ink">Headline</span>
              <input
                value={design.heroTitle}
                maxLength={80}
                placeholder={activeTenant.businessName}
                onChange={(event) => change({ heroTitle: event.target.value })}
                className={inputClass}
              />
              <span className="mt-1 block text-[12px] text-muted">Leave empty to show the business name.</span>
            </label>
            <label className="mt-3 block">
              <span className="mb-1.5 block text-[13px] font-medium text-ink">Button label</span>
              <input
                value={design.heroButtonLabel}
                maxLength={28}
                placeholder={DEFAULT_HERO_BUTTON}
                onChange={(event) => change({ heroButtonLabel: event.target.value })}
                className={inputClass}
              />
            </label>
            <div className="mt-4">
              <ImageUpload
                label="Banner image"
                hint="Shown behind the headline, or beside it in Split. A soft overlay keeps the words readable. Use a photo you own."
                emptyLabel="Image"
                value={activeTenant.heroImageDataUrl}
                onChange={(heroImageDataUrl) => {
                  updateActive({ heroImageDataUrl, ...withHomeBanner({ heroImageDataUrl }) });
                  setNotice(heroImageDataUrl ? "Banner image added." : "Banner image removed.");
                }}
                onError={setProblem}
              />
            </div>
          </Panel>

          <Panel title="Corners" hint="The shape of cards and buttons.">
            <div className="grid grid-cols-3 gap-2">
              {cornerStyles.map((corner) => (
                <OptionCard key={corner.id} selected={design.cornerStyle === corner.id} onClick={() => change({ cornerStyle: corner.id })}>
                  <CornerDiagram corner={corner.id} colour={design.buttonColour} />
                  <span className="mt-2 block text-[12px] font-semibold text-ink">{corner.name}</span>
                </OptionCard>
              ))}
            </div>
          </Panel>

          <Panel title="Always on your site" hint="Templates and colours cannot remove these. A change that tries to is not saved.">
            <ul className="space-y-2 text-[13px] text-body">
              {[
                "ARN and the AMFI line in every header",
                "Market-risk wording in every footer",
                "The Disclosures page, always published",
                "Consent tick on the enquiry form",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <LockIcon />
                  {item}
                </li>
              ))}
            </ul>
          </Panel>
        </aside>

        <section className="min-w-0">
          <div className={device === "phone" ? "mx-auto w-full max-w-97.5" : "w-full"}>
            <div className="overflow-hidden rounded-2xl border border-edge bg-surface shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-2 border-b border-edge bg-subtle px-3 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 min-w-0 flex-1 truncate rounded-md bg-surface px-3 py-1 text-xs text-muted">
                  {sitePath(activeTenant.slug)}
                  {page === "home" ? "" : `/${page}`}
                </span>
                <span className="hidden text-[11px] font-medium text-muted sm:inline">Live preview</span>
              </div>
              <ScaledFrame
                width={device === "phone" ? 390 : DESKTOP_WIDTH}
                onClickCapture={(event) => {
                  const link = (event.target as HTMLElement).closest("a");
                  if (!link) return;
                  const next = previewViewFromHref(link.href, activeTenant.slug);
                  if (!next) return;
                  event.preventDefault();
                  setPage(next);
                }}
                onSubmitCapture={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
              >
                <PublicView key={page} view={page} slug={activeTenant.slug} embedded tenant={preview} />
              </ScaledFrame>
            </div>
          </div>
          <p className="mt-2 text-center text-[12px] text-muted">
            Use the menu and links in the preview to move between pages. The enquiry form is disabled here so no test enquiries reach your inbox.
          </p>
        </section>
      </div>
    </div>
  );
}

const DESKTOP_WIDTH = 1200;

/**
 * Lays the site out at a real screen width and shrinks it to fit, so "Desktop" shows the
 * desktop header and banner even when the preview column is narrow.
 */
function ScaledFrame({
  width,
  children,
  onClickCapture,
  onSubmitCapture,
}: {
  width: number;
  children: ReactNode;
  onClickCapture: React.MouseEventHandler<HTMLDivElement>;
  onSubmitCapture: React.FormEventHandler<HTMLDivElement>;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = outer.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setBox({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const scale = box.width ? Math.min(1, box.width / width) : 1;

  return (
    <div ref={outer} className="h-[calc(100vh-15rem)] min-h-140 overflow-hidden">
      <div
        className="preview-scroll overflow-auto"
        style={{
          width: box.width ? Math.max(width, box.width) : "100%",
          height: box.height ? box.height / scale : "100%",
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: "top left",
        }}
        onClickCapture={onClickCapture}
        onSubmitCapture={onSubmitCapture}
      >
        {children}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-slate-400 focus:border-brand";

function Panel({ title, hint, aside, children }: { title: string; hint?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-edge bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {aside}
      </div>
      {hint ? <p className="mt-1 text-[12px] leading-5 text-muted">{hint}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function OptionCard({
  selected,
  onClick,
  title,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "rounded-xl border bg-surface p-2.5 text-left transition hover:border-line-strong",
        selected ? "border-brand ring-2 ring-brand/20" : "border-edge",
      )}
    >
      {children}
    </button>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap rounded-xl border border-edge bg-surface p-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-[13px] font-semibold",
            value === option.id ? "bg-brand text-white" : "text-body hover:text-ink",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ColourField({
  label,
  hint,
  value,
  onChange,
  swatches = false,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  swatches?: boolean;
}) {
  const [text, setText] = useState(value);
  const [shown, setShown] = useState(value);
  if (value !== shown) {
    setShown(value);
    setText(value);
  }
  const invalid = !isHexColour(text);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-ink">{label}</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label={`${label} colour`}
            value={isHexColour(value) ? value : "#000000"}
            onChange={(event) => onChange(event.target.value)}
            className="h-8 w-9 cursor-pointer rounded-md border border-line bg-surface p-0.5"
          />
          <input
            value={text}
            aria-label={`${label} hex code`}
            spellCheck={false}
            onChange={(event) => {
              setText(event.target.value);
              if (isHexColour(event.target.value)) onChange(event.target.value);
            }}
            className={cn(inputClass, "w-[104px] py-1.5 font-mono text-[13px] uppercase", invalid && "border-bad")}
          />
        </div>
      </div>
      {invalid ? <p className="mt-1 text-[12px] text-bad">Use # and six characters, for example #0D9488.</p> : null}
      {!invalid && hint ? <p className="mt-1 text-[12px] text-muted">{hint}</p> : null}
      {swatches ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {themePresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              title={preset.name}
              aria-label={`${label}: ${preset.name}`}
              onClick={() => onChange(preset.color)}
              className={cn(
                "h-6 w-6 rounded-full border-2",
                value.toLowerCase() === preset.color.toLowerCase() ? "border-ink" : "border-surface ring-1 ring-line",
              )}
              style={{ background: preset.color }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** A small drawing of a template, built from its real colours, font, and layout. */
export function TemplateThumb({ tokens }: { tokens: DesignTokens }) {
  const { backgroundColour: bg, textColour: ink } = tokens;
  const line = `color-mix(in srgb, ${ink} 14%, ${bg})`;
  const faint = `color-mix(in srgb, ${ink} 30%, ${bg})`;
  const corners = cornerStyles.find((item) => item.id === tokens.cornerStyle) ?? cornerStyles[1];
  const radius = corners.id === "round" ? "999px" : corners.id === "sharp" ? "1px" : "4px";
  const centeredHero = tokens.heroLayout === "centered";
  const bar = (width: string, colour = faint, height = 3) => (
    <span className="block rounded-full" style={{ width, height, background: colour }} />
  );
  const button = (
    <span className="block h-[9px] w-8" style={{ background: tokens.buttonColour, borderRadius: radius }} />
  );

  return (
    <div aria-hidden className="overflow-hidden rounded-lg border" style={{ background: bg, borderColor: line, ...fontStyleVars(tokens.fontStyle) }}>
      <div className="border-b px-2 py-1.5" style={{ borderColor: line }}>
        {tokens.headerLayout === "centered" ? (
          <div className="flex flex-col items-center gap-1">
            <span className="h-2 w-2 rounded-sm" style={{ background: tokens.primaryColour }} />
            <div className="flex gap-1">{bar("10px")}{bar("10px")}{bar("10px")}</div>
          </div>
        ) : tokens.headerLayout === "inline" ? (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ background: tokens.primaryColour }} />
            <div className="flex flex-1 justify-center gap-1">{bar("8px")}{bar("8px")}{bar("8px")}</div>
            <span className="block h-[7px] w-5" style={{ background: tokens.buttonColour, borderRadius: radius }} />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm" style={{ background: tokens.primaryColour }} />
              {bar("22px", ink)}
              <span className="ml-auto block h-[7px] w-5" style={{ background: tokens.buttonColour, borderRadius: radius }} />
            </div>
            <div className="flex gap-1">{bar("10px")}{bar("10px")}{bar("10px")}</div>
          </div>
        )}
      </div>
      <div className={cn("flex gap-2 px-2.5 py-3", tokens.heroLayout === "split" && "items-center")}>
        <div className={cn("flex min-w-0 flex-1 flex-col gap-1.5", centeredHero && "items-center text-center")}>
          {bar("28px", tokens.primaryColour, 2)}
          <span className="block font-display text-[13px] font-semibold leading-none" style={{ color: ink }}>
            Your practice
          </span>
          {bar("70%")}
          {bar("50%")}
          <span className="mt-0.5">{button}</span>
        </div>
        {tokens.heroLayout === "split" ? (
          <span
            className="block h-12 w-10 shrink-0"
            style={{ background: `color-mix(in srgb, ${tokens.primaryColour} 30%, ${bg})`, borderRadius: radius === "999px" ? "8px" : radius }}
          />
        ) : null}
      </div>
    </div>
  );
}

const diagramInk = "#cbd5e1";
const diagramAccent = "var(--brand)";

function HeaderDiagram({ layout }: { layout: HeaderLayout }) {
  const bar = (width: number) => <span className="block h-[3px] rounded-full" style={{ width, background: diagramInk }} />;
  return (
    <div aria-hidden className="flex h-11 flex-col justify-center gap-1 rounded-md border border-edge bg-subtle px-1.5">
      {layout === "centered" ? (
        <>
          <span className="mx-auto h-2.5 w-2.5 rounded-sm" style={{ background: diagramAccent }} />
          <div className="flex justify-center gap-1">{bar(8)}{bar(8)}{bar(8)}</div>
        </>
      ) : layout === "inline" ? (
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: diagramAccent }} />
          <div className="flex flex-1 justify-center gap-0.5">{bar(6)}{bar(6)}{bar(6)}</div>
          <span className="h-1.5 w-3 rounded-sm" style={{ background: diagramAccent }} />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: diagramAccent }} />
            {bar(14)}
            <span className="ml-auto h-1.5 w-3 rounded-sm" style={{ background: diagramAccent }} />
          </div>
          <div className="flex gap-1">{bar(8)}{bar(8)}{bar(8)}</div>
        </>
      )}
    </div>
  );
}

function HeroDiagram({ layout }: { layout: HeroLayout }) {
  const bar = (width: string) => <span className="block h-[3px] rounded-full" style={{ width, background: diagramInk }} />;
  return (
    <div aria-hidden className="flex h-11 items-center gap-1.5 rounded-md border border-edge bg-subtle px-1.5">
      <div className={cn("flex flex-1 flex-col gap-1", layout === "centered" && "items-center")}>
        <span className="block h-[5px] w-3/4 rounded-full" style={{ background: "#94a3b8" }} />
        {bar("60%")}
        <span className="block h-1.5 w-4 rounded-sm" style={{ background: diagramAccent }} />
      </div>
      {layout === "split" ? <span className="block h-8 w-5 rounded-sm" style={{ background: diagramInk }} /> : null}
    </div>
  );
}

function CornerDiagram({ corner, colour }: { corner: CornerStyle; colour: string }) {
  const radius = cornerStyles.find((item) => item.id === corner)?.button ?? "10px";
  return (
    <div aria-hidden className="flex h-11 items-center justify-center rounded-md border border-edge bg-subtle">
      <span className="block h-4 w-12" style={{ background: colour, borderRadius: radius }} />
    </div>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="7" width="10" height="7" rx="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  );
}
