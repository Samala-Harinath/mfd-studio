import type { CSSProperties } from "react";
import { findRestrictedTerm } from "@/lib/format";
import { fontStyleVars, isFontId, isHexColour, type FontId } from "@/lib/themes";

export const themeModes = [
  { id: "light", name: "Light" },
  { id: "dark", name: "Dark" },
] as const;

export const headerLayouts = [
  { id: "stacked", name: "Classic", hint: "Logo on the left, menu underneath" },
  { id: "inline", name: "Single row", hint: "Logo, menu, and button on one line" },
  { id: "centered", name: "Centred", hint: "Name in the middle, menu below" },
] as const;

export const heroLayouts = [
  { id: "left", name: "Left aligned", hint: "Headline on the left" },
  { id: "centered", name: "Centred", hint: "Headline in the middle" },
  { id: "split", name: "Split", hint: "Words left, picture right" },
] as const;

export const cornerStyles = [
  { id: "sharp", name: "Sharp", card: "4px", button: "4px" },
  { id: "soft", name: "Soft", card: "16px", button: "10px" },
  { id: "round", name: "Round", card: "28px", button: "999px" },
] as const;

export type ThemeMode = (typeof themeModes)[number]["id"];
export type HeaderLayout = (typeof headerLayouts)[number]["id"];
export type HeroLayout = (typeof heroLayouts)[number]["id"];
export type CornerStyle = (typeof cornerStyles)[number]["id"];

/** Choices a template sets in one click. Words, pages, and images are never part of a template. */
export type DesignTokens = {
  themeMode: ThemeMode;
  backgroundColour: string;
  textColour: string;
  primaryColour: string;
  buttonColour: string;
  fontStyle: FontId;
  headerLayout: HeaderLayout;
  heroLayout: HeroLayout;
  cornerStyle: CornerStyle;
};

export type SiteDesign = DesignTokens & {
  template: TemplateId;
  heroTitle: string;
  heroButtonLabel: string;
};

export const templates = [
  {
    id: "classic",
    name: "Classic",
    description: "Calm and familiar. Suits most practices.",
    tokens: {
      themeMode: "light",
      backgroundColour: "#ffffff",
      textColour: "#0f172a",
      primaryColour: "#0D9488",
      buttonColour: "#0D9488",
      fontStyle: "modern",
      headerLayout: "stacked",
      heroLayout: "left",
      cornerStyle: "soft",
    },
  },
  {
    id: "bold",
    name: "Bold",
    description: "Big centred headline and round buttons.",
    tokens: {
      themeMode: "light",
      backgroundColour: "#fffbf5",
      textColour: "#1c1917",
      primaryColour: "#E07A1A",
      buttonColour: "#1c1917",
      fontStyle: "friendly",
      headerLayout: "inline",
      heroLayout: "centered",
      cornerStyle: "round",
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Plain type, sharp edges, lots of space.",
    tokens: {
      themeMode: "light",
      backgroundColour: "#ffffff",
      textColour: "#111827",
      primaryColour: "#4F46E5",
      buttonColour: "#111827",
      fontStyle: "simple",
      headerLayout: "inline",
      heroLayout: "left",
      cornerStyle: "sharp",
    },
  },
  {
    id: "heritage",
    name: "Heritage",
    description: "Serif headings and warm paper tones.",
    tokens: {
      themeMode: "light",
      backgroundColour: "#faf7f2",
      textColour: "#292524",
      primaryColour: "#15803D",
      buttonColour: "#15803D",
      fontStyle: "elegant",
      headerLayout: "centered",
      heroLayout: "centered",
      cornerStyle: "soft",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark background with a bright accent.",
    tokens: {
      themeMode: "dark",
      backgroundColour: "#0b1220",
      textColour: "#e5e7eb",
      primaryColour: "#38BDF8",
      buttonColour: "#38BDF8",
      fontStyle: "modern",
      headerLayout: "centered",
      heroLayout: "split",
      cornerStyle: "soft",
    },
  },
] as const satisfies readonly { id: string; name: string; description: string; tokens: DesignTokens }[];

export type TemplateId = (typeof templates)[number]["id"];

export const modeDefaults: Record<ThemeMode, { backgroundColour: string; textColour: string }> = {
  light: { backgroundColour: "#ffffff", textColour: "#0f172a" },
  dark: { backgroundColour: "#0b1220", textColour: "#e5e7eb" },
};

export const DEFAULT_HERO_BUTTON = "Book a conversation";
export const MIN_TEXT_CONTRAST = 4.5;
export const MIN_ACCENT_CONTRAST = 3;

const designKeys = Object.keys(templates[0].tokens) as (keyof DesignTokens)[];

function isOneOf<T extends string>(list: readonly { id: T }[], value: unknown): value is T {
  return list.some((item) => item.id === value);
}

export function getTemplate(id: string) {
  return templates.find((template) => template.id === id) ?? templates[0];
}

export function templateDesign(id: TemplateId): DesignTokens {
  return { ...getTemplate(id).tokens };
}

/** True when the MFD has changed at least one colour, font, or layout since picking the template. */
export function isCustomised(design: SiteDesign) {
  const preset = getTemplate(design.template).tokens;
  return designKeys.some((key) => String(design[key]).toLowerCase() !== String(preset[key]).toLowerCase());
}

function channel(value: number) {
  const scaled = value / 255;
  return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  return 0.2126 * channel((value >> 16) & 255) + 0.7152 * channel((value >> 8) & 255) + 0.0722 * channel(value & 255);
}

/** WCAG contrast ratio, from 1 (identical) to 21 (black on white). */
export function contrastRatio(a: string, b: string) {
  if (!isHexColour(a) || !isHexColour(b)) return 1;
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** White or near-black, whichever is easier to read on `background`. */
export function readableOn(background: string) {
  return contrastRatio(background, "#ffffff") >= contrastRatio(background, "#0f172a") ? "#ffffff" : "#0f172a";
}

/**
 * The one rulebook for look-and-feel. The dashboard runs it before saving and the server
 * runs it again on every save, so a hand-made request cannot store an unreadable site.
 */
export function designProblem(design: SiteDesign): string | null {
  if (!isOneOf(templates, design.template)) return "Choose a template from the list.";
  if (!isOneOf(themeModes, design.themeMode)) return "Choose light or dark.";
  if (!isOneOf(headerLayouts, design.headerLayout)) return "Choose a header layout from the list.";
  if (!isOneOf(heroLayouts, design.heroLayout)) return "Choose a hero layout from the list.";
  if (!isOneOf(cornerStyles, design.cornerStyle)) return "Choose a corner style from the list.";
  if (!isFontId(design.fontStyle)) return "Choose a font from the list.";
  const colours = [design.backgroundColour, design.textColour, design.primaryColour, design.buttonColour];
  if (!colours.every(isHexColour)) return "Enter colours as a # followed by six characters, for example #0D9488.";
  if (contrastRatio(design.textColour, design.backgroundColour) < MIN_TEXT_CONTRAST) {
    return "That text colour is too hard to read on this background. Pick a darker or lighter one.";
  }
  if (design.heroTitle.length > 80) return "Keep the headline under 80 characters.";
  if (design.heroButtonLabel.length > 28) return "Keep the button label under 28 characters.";
  const blocked = findRestrictedTerm(`${design.heroTitle} ${design.heroButtonLabel}`);
  if (blocked) return `“${blocked}” cannot be used on the website.`;
  return null;
}

/** Advice that does not block saving. */
export function designWarning(design: SiteDesign): string | null {
  if (contrastRatio(design.primaryColour, design.backgroundColour) < MIN_ACCENT_CONTRAST) {
    return "The brand colour is faint on this background. Links and small labels may be hard to see.";
  }
  return null;
}

/** Reads stored values, falling back to the Classic template for anything missing or invalid. */
export function designFromRecord(record: Record<string, unknown>): SiteDesign {
  const template = isOneOf(templates, record.template) ? record.template : "classic";
  const preset = getTemplate(template).tokens;
  const colour = (value: unknown, fallback: string) => (typeof value === "string" && isHexColour(value) ? value : fallback);
  const text = (value: unknown) => (typeof value === "string" ? value : "");
  return {
    template,
    themeMode: isOneOf(themeModes, record.themeMode) ? record.themeMode : preset.themeMode,
    backgroundColour: colour(record.backgroundColour, preset.backgroundColour),
    textColour: colour(record.textColour, preset.textColour),
    primaryColour: colour(record.primaryColour, preset.primaryColour),
    buttonColour: colour(record.buttonColour, colour(record.primaryColour, preset.buttonColour)),
    fontStyle: isFontId(record.fontStyle) ? record.fontStyle : preset.fontStyle,
    headerLayout: isOneOf(headerLayouts, record.headerLayout) ? record.headerLayout : preset.headerLayout,
    heroLayout: isOneOf(heroLayouts, record.heroLayout) ? record.heroLayout : preset.heroLayout,
    cornerStyle: isOneOf(cornerStyles, record.cornerStyle) ? record.cornerStyle : preset.cornerStyle,
    heroTitle: text(record.heroTitle),
    heroButtonLabel: text(record.heroButtonLabel),
  };
}

const mix = (colour: string, amount: number, base: string) => `color-mix(in srgb, ${colour} ${amount}%, ${base})`;

/**
 * The public header does not follow the page colours.
 * Light sites get a white bar with dark text. Dark sites get a dark bar with white text.
 */
export function headerBarStyle(mode: ThemeMode): CSSProperties {
  const dark = mode === "dark";
  return {
    ["--ink" as string]: dark ? "#f8fafc" : "#0f172a",
    ["--body" as string]: dark ? "#cbd5e1" : "#475569",
    ["--muted" as string]: dark ? "#94a3b8" : "#64748b",
    ["--line" as string]: dark ? "#1e293b" : "#e2e8f0",
    ["--line-strong" as string]: dark ? "#334155" : "#cbd5e1",
    ["--canvas" as string]: dark ? "#1e293b" : "#f1f5f9",
    backgroundColor: dark ? "#0f172a" : "#ffffff",
    color: dark ? "#f8fafc" : "#0f172a",
  };
}

/**
 * CSS variables for one public site. The Tailwind colours `ink`, `body`, `muted`, `line`,
 * and `canvas` read these variables, so overriding them on the site wrapper re-themes every page.
 */
export function siteStyle(design: DesignTokens): CSSProperties {
  const { backgroundColour: bg, textColour: text } = design;
  const corners = cornerStyles.find((item) => item.id === design.cornerStyle) ?? cornerStyles[1];
  return {
    ...fontStyleVars(design.fontStyle),
    ["--site-bg" as string]: bg,
    ["--site-surface" as string]: mix(text, 3, bg),
    ["--site-accent" as string]: design.primaryColour,
    ["--site-button" as string]: design.buttonColour,
    ["--site-button-text" as string]: readableOn(design.buttonColour),
    ["--site-radius-card" as string]: corners.card,
    ["--site-radius-button" as string]: corners.button,
    ["--brand" as string]: design.primaryColour,
    ["--ink" as string]: text,
    ["--body" as string]: mix(text, 80, bg),
    ["--muted" as string]: mix(text, 62, bg),
    ["--line" as string]: mix(text, 12, bg),
    ["--line-strong" as string]: mix(text, 24, bg),
    ["--canvas" as string]: mix(text, 4, bg),
    colorScheme: design.themeMode,
    background: bg,
    color: text,
  };
}
