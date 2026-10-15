import { findRestrictedTerm } from "@/lib/format";
import { countLayoutBlocks } from "@/lib/puck/normalize";
import type { PageLayout } from "@/lib/puck/types";

const MAX_STRING = 8000;
const MAX_IMAGE = 900_000;

function walkStrings(value: unknown, out: string[]) {
  if (typeof value === "string") {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => walkStrings(item, out));
    return;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => walkStrings(item, out));
  }
}

/** Runs on save so crafted API calls cannot store banned phrases in Puck JSON. */
export function puckLayoutProblem(layout: unknown): string | null {
  const data = layout as PageLayout | null;
  if (!layout) return null;
  if (!data || typeof data !== "object" || !Array.isArray(data.content)) {
    return "Page layout is not valid. Reopen the visual editor and save again.";
  }
  const sectionCount = countLayoutBlocks(data);
  if (sectionCount > 80) {
    return "Keep the page under 80 sections, including items inside columns. Split long content across pages.";
  }
  const strings: string[] = [];
  walkStrings(data.content, strings);
  walkStrings(data.zones ?? {}, strings);
  for (const text of strings) {
    if (/javascript:/i.test(text) || /<script/i.test(text)) {
      return "Scripts and script links cannot be added to a page.";
    }
    if (text.startsWith("data:")) {
      if (!/^data:image\/(png|jpeg|webp);base64,/i.test(text)) {
        return "Images must be PNG, JPG, or WebP files you upload in the editor.";
      }
      if (text.length > MAX_IMAGE) return "One image is too large. Use a smaller photo.";
      continue;
    }
    if (text.length > MAX_STRING) return "One section has too much text. Shorten it and try again.";
    const blocked = findRestrictedTerm(text);
    if (blocked) return `“${blocked}” cannot be used on the website.`;
  }
  return null;
}
