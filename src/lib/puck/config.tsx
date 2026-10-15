"use client";

import { type Config } from "@measured/puck";
import Link from "next/link";
import { useState, type ComponentType, type ReactNode } from "react";
import { usePuckSite } from "@/components/puck/puck-site-context";
import { cn } from "@/components/ui/ui";
import { readImageFile } from "@/lib/read-image";

const buttonClass =
  "inline-flex h-11 items-center rounded-(--site-radius-button) px-5 text-sm font-semibold";
const buttonStyle = { background: "var(--site-button)", color: "var(--site-button-text)" };
const accentStyle = { color: "var(--site-accent)" };

function safeWebUrl(value: string) {
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function SiteLink({ page, className, style, children }: { page: string; className?: string; style?: React.CSSProperties; children: ReactNode }) {
  const { base } = usePuckSite();
  const external = safeWebUrl(page);
  if (external) {
    return (
      <a href={external} className={className} style={style} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  const trimmed = page.trim();
  const segment = trimmed === "tools" ? "calculators" : trimmed;
  const href = !segment
    ? `${base}/contact`
    : segment.startsWith("/")
      ? segment
      : `${base}/${segment.replace(/^\//, "")}`;
  return (
    <Link href={href} className={className} style={style}>
      {children}
    </Link>
  );
}

function SafeImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  if (!src || !/^data:image\/(png|jpeg|webp);base64,/i.test(src)) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}

function ImageFieldRender({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [error, setError] = useState("");
  return (
    <div className="space-y-2">
      {value ? <SafeImage src={value} alt="" className="h-24 w-full rounded-lg object-cover" /> : null}
      <label className="block cursor-pointer rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm">
        {value ? "Replace image" : "Upload PNG, JPG, or WebP"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            void readImageFile(file)
              .then((data) => {
                setError("");
                onChange(data);
              })
              .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not read that image."));
          }}
        />
      </label>
      {value ? (
        <button type="button" className="text-xs font-semibold text-red-600" onClick={() => onChange("")}>
          Remove image
        </button>
      ) : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

const imageField = {
  type: "custom" as const,
  label: "Image",
  render: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <ImageFieldRender value={value ?? ""} onChange={onChange} />
  ),
};

const columnCount = (layout: string) => (layout === "thirds" ? 3 : layout === "four" ? 4 : layout === "full" ? 1 : 2);

const radiusClass: Record<string, string> = {
  none: "rounded-none",
  soft: "rounded-2xl",
  round: "rounded-[28px]",
};

const shadowClass: Record<string, string> = {
  none: "shadow-none",
  soft: "shadow-[0_8px_24px_rgba(15,23,42,0.08)]",
  lift: "shadow-[0_18px_40px_rgba(15,23,42,0.14)]",
};

const gapClass: Record<string, string> = {
  tight: "gap-3",
  normal: "gap-5",
  wide: "gap-8",
};

const frameFields = {
  radius: {
    type: "radio" as const,
    label: "Corners",
    options: [
      { label: "Square", value: "none" },
      { label: "Soft", value: "soft" },
      { label: "Round", value: "round" },
    ],
  },
  shadow: {
    type: "radio" as const,
    label: "Shadow",
    options: [
      { label: "None", value: "none" },
      { label: "Soft", value: "soft" },
      { label: "Lift", value: "lift" },
    ],
  },
};

type SlotRender = ComponentType<{
  className?: string;
  minEmptyHeight?: number | string;
  collisionAxis?: "x" | "y" | "dynamic";
}>;

function editingOf(props: unknown) {
  return Boolean((props as { puck?: { isEditing?: boolean } }).puck?.isEditing);
}

/** One drop area. Any block can go inside, including another grid. */
function SlotCell({
  Slot,
  radius,
  shadow,
  editing,
}: {
  Slot: SlotRender | undefined;
  radius: string;
  shadow: string;
  editing?: boolean;
}) {
  if (typeof Slot !== "function") {
    return <div className="min-h-28 rounded-(--site-radius-card) border border-line bg-(--site-surface)" />;
  }
  return (
    <div
      className={cn(
        "min-h-28 border border-line bg-(--site-surface)",
        radiusClass[radius] ?? radiusClass.soft,
        shadowClass[shadow] ?? shadowClass.none,
        !editing && "overflow-hidden",
      )}
    >
      <Slot className="min-h-28 p-3" minEmptyHeight={editing ? 128 : 0} collisionAxis="dynamic" />
    </div>
  );
}

function ColumnsBlock({
  layout,
  radius,
  shadow,
  col0,
  col1,
  col2,
  col3,
  editing,
}: {
  layout: string;
  radius: string;
  shadow: string;
  col0?: SlotRender;
  col1?: SlotRender;
  col2?: SlotRender;
  col3?: SlotRender;
  editing?: boolean;
}) {
  const slots = [col0, col1, col2, col3].slice(0, columnCount(layout));
  return (
    <div className="w-full">
      <div className="builder-grid gap-5" data-layout={layout || "half"}>
        {slots.map((Slot, index) => (
          <SlotCell key={index} Slot={Slot} radius={radius} shadow={shadow} editing={editing} />
        ))}
      </div>
    </div>
  );
}

function GridBlock({
  layout,
  gap,
  radius,
  shadow,
  a,
  b,
  c,
  d,
  e,
  f,
  editing,
}: {
  layout: string;
  gap: string;
  radius: string;
  shadow: string;
  a?: SlotRender;
  b?: SlotRender;
  c?: SlotRender;
  d?: SlotRender;
  e?: SlotRender;
  f?: SlotRender;
  editing?: boolean;
}) {
  const all = { a, b, c, d, e, f };
  const keys =
    layout === "mosaic"
      ? (["a", "b", "c", "d", "e", "f"] as const)
      : layout === "feature"
        ? (["a", "b", "c"] as const)
        : layout === "quad"
          ? (["a", "b", "c", "d"] as const)
          : (["a", "b", "c"] as const);
  const gapName = gapClass[gap] ?? gapClass.normal;
  return (
    <div className="w-full">
      <div className={cn("builder-grid", gapName)} data-layout={layout || "mosaic"}>
        {keys.map((key) => (
          <SlotCell key={key} Slot={all[key]} radius={radius} shadow={shadow} editing={editing} />
        ))}
      </div>
    </div>
  );
}

function HeroCopy({
  eyebrow,
  title,
  description,
  align,
  bullets,
  primaryLabel,
  primaryPage,
  secondaryLabel,
  secondaryPage,
}: {
  eyebrow: string;
  title: string;
  description: string;
  align: "left" | "center" | "split";
  bullets: { text: string }[];
  primaryLabel: string;
  primaryPage: string;
  secondaryLabel: string;
  secondaryPage: string;
}) {
  const centered = align === "center";
  const points = (bullets ?? []).map((item) => item.text).filter(Boolean);
  return (
    <div className={cn(centered && "mx-auto max-w-3xl text-center")}>
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={accentStyle}>{eyebrow}</p>
      ) : null}
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink @2xl:text-5xl">{title}</h1>
      {description ? <p className="mt-4 max-w-2xl text-base leading-7 text-body">{description}</p> : null}
      {points.length > 0 ? (
        <ul className={cn("mt-5 space-y-2 text-sm text-body", centered && "inline-block text-left")}>
          {points.map((point) => (
            <li key={point} className="flex gap-2">
              <span style={accentStyle} aria-hidden>✓</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {primaryLabel || secondaryLabel ? (
        <div className={cn("mt-7 flex flex-wrap gap-3", centered && "justify-center")}>
          {primaryLabel ? (
            <SiteLink page={primaryPage || "contact"} className={buttonClass} style={buttonStyle}>{primaryLabel}</SiteLink>
          ) : null}
          {secondaryLabel ? (
            <SiteLink page={secondaryPage || "about"} className={cn(buttonClass, "border border-line-strong bg-transparent text-ink")}>
              {secondaryLabel}
            </SiteLink>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function HeroBlock({
  eyebrow,
  title,
  description,
  align,
  image,
  bullets,
  primaryLabel,
  primaryPage,
  secondaryLabel,
  secondaryPage,
}: {
  eyebrow: string;
  title: string;
  description: string;
  align: "left" | "center" | "split";
  image: string;
  bullets: { text: string }[];
  primaryLabel: string;
  primaryPage: string;
  secondaryLabel: string;
  secondaryPage: string;
}) {
  const copy = (
    <HeroCopy
      eyebrow={eyebrow}
      title={title}
      description={description}
      align={align}
      bullets={bullets}
      primaryLabel={primaryLabel}
      primaryPage={primaryPage}
      secondaryLabel={secondaryLabel}
      secondaryPage={secondaryPage}
    />
  );
  const picture = image ? (
    <SafeImage src={image} alt="" className="h-full min-h-60 w-full object-cover" />
  ) : (
    <div
      className="flex min-h-60 items-center justify-center"
      style={{ background: "color-mix(in srgb, var(--site-accent) 14%, var(--site-bg))" }}
    />
  );

  if (align === "split") {
    return (
      <section className="builder-hero overflow-hidden rounded-(--site-radius-card) border border-line bg-(--site-surface)" data-layout="split">
        <div className="px-6 py-10 @2xl:px-10 @2xl:py-14">{copy}</div>
        <div className="relative min-h-60 overflow-hidden">{picture}</div>
      </section>
    );
  }

  const centered = align === "center";
  return (
    <section
      className="relative overflow-hidden rounded-(--site-radius-card) border border-line"
      style={
        image
          ? undefined
          : { background: "linear-gradient(160deg, color-mix(in srgb, var(--site-accent) 12%, var(--site-bg)) 0%, var(--site-bg) 55%)" }
      }
    >
      {image ? (
        <>
          <SafeImage src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: centered
                ? "color-mix(in srgb, var(--site-bg) 84%, transparent)"
                : "linear-gradient(90deg, color-mix(in srgb, var(--site-bg) 95%, transparent) 0%, color-mix(in srgb, var(--site-bg) 86%, transparent) 55%, color-mix(in srgb, var(--site-bg) 45%, transparent) 100%)",
            }}
          />
        </>
      ) : null}
      <div className={cn("relative px-6 py-10 @2xl:px-10 @2xl:py-14", centered && "mx-auto max-w-3xl text-center")}>{copy}</div>
    </section>
  );
}

function HeadingBlock({ text, size }: { text: string; size: "large" | "medium" }) {
  if (size === "large") return <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">{text}</h2>;
  return <h3 className="font-display text-xl font-semibold text-ink">{text}</h3>;
}

function TextBlock({ body }: { body: string }) {
  return (
    <div className="max-w-3xl space-y-3 text-base leading-7 text-body">
      {body.split(/\n{2,}/).map((paragraph, index) => (
        <p key={index}>{paragraph.trim()}</p>
      ))}
    </div>
  );
}

function ImageBlock({ src, alt, caption, width }: { src: string; alt: string; caption: string; width: "full" | "half" }) {
  return (
    <figure className={cn(width === "half" && "mx-auto max-w-xl")}>
      <SafeImage src={src} alt={alt || ""} className="w-full rounded-(--site-radius-card) object-cover" />
      {caption ? <figcaption className="mt-2 text-center text-sm text-muted">{caption}</figcaption> : null}
    </figure>
  );
}

function ImageCardBlock({
  src,
  title,
  description,
  linkLabel,
  page,
}: {
  src: string;
  title: string;
  description: string;
  linkLabel: string;
  page: string;
}) {
  return (
    <article className="overflow-hidden rounded-(--site-radius-card) border border-line bg-(--site-surface)">
      <SafeImage src={src} alt="" className="h-44 w-full object-cover" />
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
        {description ? <p className="mt-2 text-sm leading-6 text-body">{description}</p> : null}
        {linkLabel ? (
          <SiteLink page={page || "contact"} className="mt-4 inline-flex text-sm font-semibold" style={accentStyle}>
            {linkLabel}
          </SiteLink>
        ) : null}
      </div>
    </article>
  );
}

function CardGridBlock({
  heading,
  columns,
  items,
}: {
  heading: string;
  columns: "2" | "3";
  items: { src: string; title: string; description: string }[];
}) {
  return (
    <section>
      {heading ? <h2 className="font-display text-2xl font-semibold text-ink">{heading}</h2> : null}
      <ul className={cn("grid gap-4", heading && "mt-6", columns === "3" ? "@lg:grid-cols-3 @md:grid-cols-2" : "@md:grid-cols-2")}>
        {(items ?? []).map((item, index) => (
          <li key={`${item.title}-${index}`} className="overflow-hidden rounded-(--site-radius-card) border border-line bg-(--site-surface)">
            <SafeImage src={item.src} alt="" className="h-40 w-full object-cover" />
            <div className="p-5">
              <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
              {item.description ? <p className="mt-2 text-sm leading-6 text-body">{item.description}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CtaBlock({ title, text, buttonLabel, page }: { title: string; text: string; buttonLabel: string; page: string }) {
  return (
    <section className="rounded-(--site-radius-card) border border-line bg-(--site-surface) px-6 py-8 @md:px-10">
      <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
      {text ? <p className="mt-2 max-w-xl text-sm leading-6 text-body">{text}</p> : null}
      <SiteLink page={page || "contact"} className={cn(buttonClass, "mt-5")} style={buttonStyle}>{buttonLabel}</SiteLink>
    </section>
  );
}

function FeatureGridBlock({ heading, items }: { heading: string; items: { title: string; description: string }[] }) {
  return (
    <section>
      {heading ? <h2 className="font-display text-2xl font-semibold text-ink">{heading}</h2> : null}
      <ul className={cn("grid gap-4 @md:grid-cols-2", heading && "mt-6")}>
        {(items ?? []).map((item, index) => (
          <li key={`${item.title}-${index}`} className="rounded-(--site-radius-card) border border-line bg-(--site-surface) p-5">
            <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-body">{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FaqBlock({ heading, items }: { heading: string; items: { question: string; answer: string }[] }) {
  return (
    <section>
      {heading ? <h2 className="font-display text-2xl font-semibold text-ink">{heading}</h2> : null}
      <dl className={cn("space-y-4", heading && "mt-6")}>
        {(items ?? []).map((item, index) => (
          <div key={`${item.question}-${index}`} className="rounded-(--site-radius-card) border border-line bg-(--site-surface) p-4">
            <dt className="font-semibold text-ink">{item.question}</dt>
            <dd className="mt-2 text-sm leading-6 text-body">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function QuoteBlock({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <blockquote className="rounded-(--site-radius-card) border border-line bg-(--site-surface) px-6 py-8">
      <p className="font-display text-xl leading-8 text-ink">“{quote}”</p>
      {name ? <footer className="mt-4 text-sm font-semibold text-ink">{name}</footer> : null}
      {role ? <p className="text-sm text-muted">{role}</p> : null}
    </blockquote>
  );
}

function StatsBlock({
  heading,
  sample,
  items,
}: {
  heading: string;
  sample: "yes" | "no";
  items: { label: string; value: string; hint: string }[];
}) {
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        {heading ? <h2 className="font-display text-2xl font-semibold text-ink">{heading}</h2> : <span />}
        {sample !== "no" ? (
          <span className="rounded-full bg-canvas px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Illustrative</span>
        ) : null}
      </div>
      <ul className="mt-6 grid gap-4 @md:grid-cols-3">
        {(items ?? []).map((item, index) => (
          <li key={`${item.label}-${index}`} className="rounded-(--site-radius-card) border border-line bg-(--site-surface) p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{item.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-ink">{item.value}</p>
            {item.hint ? <p className="mt-1 text-sm text-body">{item.hint}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ButtonsBlock({
  align,
  size,
  items,
}: {
  align: "left" | "center" | "right";
  size: "small" | "medium";
  items: { label: string; page: string; style: "solid" | "outline" | "text" }[];
}) {
  const height = size === "small" ? "h-9 px-3.5 text-[13px]" : "h-11 px-5 text-sm";
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3",
        align === "center" && "justify-center",
        align === "right" && "justify-end",
      )}
    >
      {(items ?? [])
        .filter((item) => item.label?.trim())
        .map((item, index) => {
          const solid = item.style !== "outline" && item.style !== "text";
          return (
            <SiteLink
              key={`${item.label}-${index}`}
              page={item.page || "contact"}
              className={cn(
                "inline-flex items-center rounded-(--site-radius-button) font-semibold",
                height,
                item.style === "outline" && "border border-line-strong bg-transparent text-ink",
                item.style === "text" && "bg-transparent px-1",
              )}
              style={solid ? buttonStyle : item.style === "text" ? accentStyle : undefined}
            >
              {item.label}
            </SiteLink>
          );
        })}
    </div>
  );
}

function FrameBlock({
  radius,
  shadow,
  padding,
  content: Content,
  editing,
}: {
  radius: string;
  shadow: string;
  padding: "tight" | "normal" | "roomy";
  content?: SlotRender;
  editing?: boolean;
}) {
  const pad = padding === "tight" ? "p-3" : padding === "roomy" ? "p-8" : "p-5";
  return (
    <div
      className={cn(
        "border border-line bg-(--site-surface)",
        radiusClass[radius] ?? radiusClass.soft,
        shadowClass[shadow] ?? shadowClass.none,
        !editing && "overflow-hidden",
      )}
    >
      {typeof Content === "function" ? (
        <Content className={cn("min-h-24", pad)} minEmptyHeight={editing ? 96 : 0} />
      ) : (
        <div className={cn("min-h-24", pad)} />
      )}
    </div>
  );
}

function SpacerBlock({ size }: { size: "small" | "medium" | "large" }) {
  const height = size === "small" ? "h-6" : size === "medium" ? "h-12" : "h-20";
  return <div aria-hidden className={height} />;
}

function DividerBlock() {
  return <hr className="border-line" />;
}

const as = <T,>(props: unknown) => props as T;

export const puckConfig: Config = {
  root: {
    fields: { title: { type: "text", label: "Page label (internal)" } },
    render: ({ children }: { children?: ReactNode }) => <div className="space-y-10">{children}</div>,
  },
  categories: {
    layout: {
      title: "Layout",
      components: ["GridBlock", "ColumnsBlock", "FrameBlock", "ButtonsBlock", "SpacerBlock", "DividerBlock"],
    },
    content: {
      title: "Content",
      components: ["HeroBlock", "HeadingBlock", "TextBlock", "QuoteBlock"],
    },
    media: {
      title: "Images",
      components: ["ImageBlock", "ImageCardBlock", "CardGridBlock"],
    },
    sections: {
      title: "Sections",
      components: ["CtaBlock", "FeatureGridBlock", "FaqBlock", "StatsBlock"],
    },
  },
  components: {
    GridBlock: {
      label: "Grid",
      fields: {
        layout: {
          type: "radio",
          label: "Pattern",
          options: [
            { label: "Mosaic", value: "mosaic" },
            { label: "Feature + stack", value: "feature" },
            { label: "Four squares", value: "quad" },
            { label: "Three across", value: "row" },
          ],
        },
        gap: {
          type: "radio",
          label: "Gap",
          options: [
            { label: "Tight", value: "tight" },
            { label: "Normal", value: "normal" },
            { label: "Wide", value: "wide" },
          ],
        },
        ...frameFields,
        a: { type: "slot" },
        b: { type: "slot" },
        c: { type: "slot" },
        d: { type: "slot" },
        e: { type: "slot" },
        f: { type: "slot" },
      },
      defaultProps: {
        layout: "mosaic",
        gap: "normal",
        radius: "soft",
        shadow: "soft",
        a: [],
        b: [],
        c: [],
        d: [],
        e: [],
        f: [],
      },
      render: (props) => <GridBlock {...as<Parameters<typeof GridBlock>[0]>(props)} editing={editingOf(props)} />,
    },
    ColumnsBlock: {
      label: "Columns",
      fields: {
        layout: {
          type: "radio",
          label: "Width",
          options: [
            { label: "Full", value: "full" },
            { label: "Half / half", value: "half" },
            { label: "Thirds", value: "thirds" },
            { label: "Four", value: "four" },
            { label: "Narrow + wide", value: "sidebar" },
            { label: "Wide + narrow", value: "wide-left" },
          ],
        },
        ...frameFields,
        col0: { type: "slot" },
        col1: { type: "slot" },
        col2: { type: "slot" },
        col3: { type: "slot" },
      },
      defaultProps: { layout: "half", radius: "soft", shadow: "none", col0: [], col1: [], col2: [], col3: [] },
      render: (props) => <ColumnsBlock {...as<Parameters<typeof ColumnsBlock>[0]>(props)} editing={editingOf(props)} />,
    },
    FrameBlock: {
      label: "Frame",
      fields: {
        padding: {
          type: "radio",
          label: "Padding",
          options: [
            { label: "Tight", value: "tight" },
            { label: "Normal", value: "normal" },
            { label: "Roomy", value: "roomy" },
          ],
        },
        ...frameFields,
        content: { type: "slot" },
      },
      defaultProps: { padding: "normal", radius: "soft", shadow: "soft", content: [] },
      render: (props) => <FrameBlock {...as<Parameters<typeof FrameBlock>[0]>(props)} editing={editingOf(props)} />,
    },
    ButtonsBlock: {
      label: "Buttons",
      fields: {
        align: {
          type: "radio",
          label: "Align",
          options: [
            { label: "Left", value: "left" },
            { label: "Centre", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        size: {
          type: "radio",
          label: "Size",
          options: [
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
          ],
        },
        items: {
          type: "array",
          label: "Buttons",
          arrayFields: {
            label: { type: "text", label: "Label" },
            page: { type: "text", label: "Link — page key or https:// address" },
            style: {
              type: "radio",
              label: "Style",
              options: [
                { label: "Solid", value: "solid" },
                { label: "Outline", value: "outline" },
                { label: "Text", value: "text" },
              ],
            },
          },
          getItemSummary: (item) => (item as { label?: string }).label || "Button",
          defaultItemProps: { label: "Learn more", page: "about", style: "outline" },
        },
      },
      defaultProps: {
        align: "left",
        size: "medium",
        items: [
          { label: "Send an enquiry", page: "contact", style: "solid" },
          { label: "About the practice", page: "about", style: "outline" },
        ],
      },
      render: (props) => <ButtonsBlock {...as<Parameters<typeof ButtonsBlock>[0]>(props)} />,
    },
    HeroBlock: {
      label: "Hero",
      fields: {
        eyebrow: { type: "text", label: "Small line above title" },
        title: { type: "text", label: "Headline" },
        description: { type: "textarea", label: "Intro" },
        align: {
          type: "radio",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Centre", value: "center" },
            { label: "Split", value: "split" },
          ],
        },
        image: imageField,
        bullets: {
          type: "array",
          label: "Tick points",
          arrayFields: { text: { type: "text", label: "Point" } },
          getItemSummary: (item) => (item as { text?: string }).text || "Point",
        },
        primaryLabel: { type: "text", label: "Main button" },
        primaryPage: { type: "text", label: "Main link — page key or https:// address" },
        secondaryLabel: { type: "text", label: "Second button" },
        secondaryPage: { type: "text", label: "Second link — page key or https:// address" },
      },
      defaultProps: {
        eyebrow: "AMFI-registered Mutual Fund Distributor",
        title: "Your headline",
        description: "Explain who you help, in plain language.",
        align: "left",
        image: "",
        bullets: [{ text: "Conversations stay with you" }, { text: "No scheme recommendation on this page" }],
        primaryLabel: "Send an enquiry",
        primaryPage: "contact",
        secondaryLabel: "",
        secondaryPage: "about",
      },
      render: (props) => <HeroBlock {...as<Parameters<typeof HeroBlock>[0]>(props)} />,
    },
    HeadingBlock: {
      label: "Heading",
      fields: {
        text: { type: "text", label: "Heading text" },
        size: {
          type: "radio",
          options: [
            { label: "Large", value: "large" },
            { label: "Medium", value: "medium" },
          ],
        },
      },
      defaultProps: { text: "Section title", size: "large" },
      render: (props) => <HeadingBlock {...as<Parameters<typeof HeadingBlock>[0]>(props)} />,
    },
    TextBlock: {
      label: "Text",
      fields: { body: { type: "textarea", label: "Paragraphs (blank line between paragraphs)" } },
      defaultProps: { body: "Write in plain language. Mutual fund investments are subject to market risks." },
      render: (props) => <TextBlock {...as<Parameters<typeof TextBlock>[0]>(props)} />,
    },
    ImageBlock: {
      label: "Image",
      fields: {
        src: imageField,
        alt: { type: "text", label: "Description for screen readers" },
        caption: { type: "text", label: "Caption" },
        width: {
          type: "radio",
          label: "Width",
          options: [
            { label: "Full", value: "full" },
            { label: "Half", value: "half" },
          ],
        },
      },
      defaultProps: { src: "", alt: "", caption: "", width: "full" },
      render: (props) => <ImageBlock {...as<Parameters<typeof ImageBlock>[0]>(props)} />,
    },
    ImageCardBlock: {
      label: "Image card",
      fields: {
        src: imageField,
        title: { type: "text", label: "Title" },
        description: { type: "textarea", label: "Text" },
        linkLabel: { type: "text", label: "Link label" },
        page: { type: "text", label: "Link — page key or https:// address" },
      },
      defaultProps: { src: "", title: "Card title", description: "", linkLabel: "", page: "contact" },
      render: (props) => <ImageCardBlock {...as<Parameters<typeof ImageCardBlock>[0]>(props)} />,
    },
    CardGridBlock: {
      label: "Image card grid",
      fields: {
        heading: { type: "text", label: "Heading" },
        columns: {
          type: "radio",
          label: "Columns",
          options: [
            { label: "Two", value: "2" },
            { label: "Three", value: "3" },
          ],
        },
        items: {
          type: "array",
          label: "Cards",
          arrayFields: {
            src: imageField,
            title: { type: "text", label: "Title" },
            description: { type: "textarea", label: "Text" },
          },
          getItemSummary: (item) => (item as { title?: string }).title || "Card",
        },
      },
      defaultProps: {
        heading: "How we help",
        columns: "2",
        items: [
          { src: "", title: "First conversation", description: "Goals, timeline, and questions — before any paperwork." },
          { src: "", title: "Ongoing support", description: "Reviews after the first meeting. Not a scheme recommendation." },
        ],
      },
      render: (props) => <CardGridBlock {...as<Parameters<typeof CardGridBlock>[0]>(props)} />,
    },
    CtaBlock: {
      label: "Call to action",
      fields: {
        title: { type: "text", label: "Title" },
        text: { type: "textarea", label: "Supporting text" },
        buttonLabel: { type: "text", label: "Button label" },
        page: { type: "text", label: "Link — page key or https:// address" },
      },
      defaultProps: {
        title: "Ready to talk?",
        text: "Send a message. This is a conversation, not a scheme recommendation.",
        buttonLabel: "Send an enquiry",
        page: "contact",
      },
      render: (props) => <CtaBlock {...as<Parameters<typeof CtaBlock>[0]>(props)} />,
    },
    FeatureGridBlock: {
      label: "Feature cards",
      fields: {
        heading: { type: "text", label: "Section heading" },
        items: {
          type: "array",
          label: "Cards",
          arrayFields: {
            title: { type: "text", label: "Title" },
            description: { type: "textarea", label: "Description" },
          },
          getItemSummary: (item) => (item as { title?: string }).title || "Card",
        },
      },
      defaultProps: {
        heading: "How this practice helps",
        items: [
          { title: "Clear conversations", description: "Explain goals in simple words before any paperwork." },
          { title: "Ongoing support", description: "Reviews and questions after the first meeting." },
        ],
      },
      render: (props) => <FeatureGridBlock {...as<Parameters<typeof FeatureGridBlock>[0]>(props)} />,
    },
    FaqBlock: {
      label: "Questions and answers",
      fields: {
        heading: { type: "text", label: "Section heading" },
        items: {
          type: "array",
          label: "Items",
          arrayFields: {
            question: { type: "text", label: "Question" },
            answer: { type: "textarea", label: "Answer" },
          },
          getItemSummary: (item) => (item as { question?: string }).question || "Question",
        },
      },
      defaultProps: {
        heading: "Common questions",
        items: [
          {
            question: "Do you recommend one fund?",
            answer: "No. We discuss your situation first. Any scheme choice follows that conversation and the scheme documents.",
          },
        ],
      },
      render: (props) => <FaqBlock {...as<Parameters<typeof FaqBlock>[0]>(props)} />,
    },
    QuoteBlock: {
      label: "Quote",
      fields: {
        quote: { type: "textarea", label: "Quote" },
        name: { type: "text", label: "Name" },
        role: { type: "text", label: "Role" },
      },
      defaultProps: {
        quote: "The first meeting was a conversation about goals, not a product pitch.",
        name: "",
        role: "Investor",
      },
      render: (props) => <QuoteBlock {...as<Parameters<typeof QuoteBlock>[0]>(props)} />,
    },
    StatsBlock: {
      label: "Numbers",
      fields: {
        heading: { type: "text", label: "Heading" },
        sample: {
          type: "radio",
          label: "Label figures as illustrative",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No — these are real", value: "no" },
          ],
        },
        items: {
          type: "array",
          label: "Figures",
          arrayFields: {
            label: { type: "text", label: "Label" },
            value: { type: "text", label: "Value" },
            hint: { type: "text", label: "Hint" },
          },
          getItemSummary: (item) => (item as { label?: string }).label || "Figure",
        },
      },
      defaultProps: {
        heading: "",
        sample: "yes",
        items: [
          { label: "Years", value: "10+", hint: "Working with families" },
          { label: "Cities", value: "1", hint: "Where meetings happen" },
          { label: "Languages", value: "2", hint: "Used in conversations" },
        ],
      },
      render: (props) => <StatsBlock {...as<Parameters<typeof StatsBlock>[0]>(props)} />,
    },
    SpacerBlock: {
      label: "Spacer",
      fields: {
        size: {
          type: "radio",
          options: [
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
          ],
        },
      },
      defaultProps: { size: "medium" },
      render: (props) => <SpacerBlock {...as<Parameters<typeof SpacerBlock>[0]>(props)} />,
    },
    DividerBlock: {
      label: "Divider",
      fields: {},
      defaultProps: {},
      render: () => <DividerBlock />,
    },
  },
};
