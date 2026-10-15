import type { Data } from "@measured/puck";
import { normalizePuckLayout } from "@/lib/puck/normalize";

export type PageLayout = Data;

export function parsePageLayout(raw: unknown): PageLayout | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as PageLayout;
  if (!Array.isArray(candidate.content)) return null;
  return normalizePuckLayout({
    content: candidate.content,
    root: candidate.root ?? { props: { id: "root" } },
    zones: candidate.zones ?? {},
  });
}

export function hasPuckContent(layout: PageLayout | null | undefined) {
  return Boolean(layout && layout.content.length > 0);
}
