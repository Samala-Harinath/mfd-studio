import Link from "next/link";
import type { ReactNode } from "react";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const buttonStyles = {
  primary:
    "bg-brand text-white hover:brightness-95 focus-visible:outline-brand",
  secondary:
    "border border-line-strong bg-surface text-ink hover:bg-canvas focus-visible:outline-teal",
  ghost: "text-body hover:bg-surface focus-visible:outline-teal",
  danger: "bg-bad text-white hover:bg-red-700 focus-visible:outline-bad",
};

const buttonSizes = {
  md: "h-11 px-4 text-sm",
  sm: "h-9 px-3 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonStyles;
  size?: keyof typeof buttonSizes;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        buttonStyles[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: keyof typeof buttonStyles;
  size?: keyof typeof buttonSizes;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        buttonStyles[variant],
        buttonSizes[size],
        className,
      )}
    >
      {children}
    </Link>
  );
}

const badgeStyles = {
  draft: "bg-subtle text-body",
  published: "bg-good-soft text-good",
  review: "bg-amber-soft text-amber",
  soon: "bg-indigo-soft text-indigo",
  plan: "bg-indigo-soft text-indigo",
  danger: "bg-bad-soft text-bad",
  neutral: "bg-subtle text-body",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: keyof typeof badgeStyles;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        badgeStyles[tone],
      )}
    >
      {tone === "published" ? (
        <span className="h-1.5 w-1.5 rounded-full bg-good" />
      ) : null}
      {children}
    </span>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-line bg-surface p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-[13px] text-bad">{error}</span> : null}
      {!error && hint ? (
        <span className="mt-1 block text-[13px] text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export const fieldClass =
  "w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_18%,transparent)]";

export function PageIntro({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow?: string;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink sm:text-[32px] sm:leading-10">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-body sm:text-base">{text}</p>
      </div>
      {action}
    </div>
  );
}
