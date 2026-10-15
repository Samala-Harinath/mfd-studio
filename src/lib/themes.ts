import type { CSSProperties } from "react";

export const themePresets = [
  { id: "teal", name: "Teal", color: "#0D9488" },
  { id: "ocean", name: "Ocean", color: "#0284C7" },
  { id: "indigo", name: "Indigo", color: "#4F46E5" },
  { id: "amber", name: "Amber", color: "#E07A1A" },
  { id: "forest", name: "Forest", color: "#15803D" },
  { id: "rose", name: "Rose", color: "#BE185D" },
] as const;

export const fontPresets = [
  { id: "modern", name: "Modern", heading: "var(--font-jakarta-base)", body: "var(--font-inter)" },
  { id: "classic", name: "Classic", heading: "var(--font-lora)", body: "var(--font-inter)" },
  { id: "friendly", name: "Friendly", heading: "var(--font-poppins)", body: "var(--font-poppins)" },
  { id: "simple", name: "Simple", heading: "var(--font-inter)", body: "var(--font-inter)" },
  { id: "elegant", name: "Elegant", heading: "var(--font-playfair)", body: "var(--font-inter)" },
] as const;

export type FontId = (typeof fontPresets)[number]["id"];

export function isFontId(value: unknown): value is FontId {
  return fontPresets.some((font) => font.id === value);
}

/** `font-display` is compiled to `var(--font-jakarta)`, so overriding that variable re-skins every heading. */
export function fontStyleVars(id: FontId): CSSProperties {
  const font = fontPresets.find((item) => item.id === id) ?? fontPresets[0];
  return {
    ["--font-jakarta" as string]: font.heading,
    fontFamily: `${font.body}, ui-sans-serif, system-ui, sans-serif`,
  };
}

export function isHexColour(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}
