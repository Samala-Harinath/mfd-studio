"use client";

import "@measured/puck/dist/index.css";
import { Puck } from "@measured/puck";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ExternalLink, LoaderCircle } from "lucide-react";
import { PuckSiteProvider } from "@/components/puck/puck-site-context";
import { useRequiredTenant } from "@/features/studio/hooks";
import { siteStyle } from "@/lib/design";
import { homeLayoutFromPractice, layoutForEditor } from "@/lib/puck/defaults";
import { puckConfig } from "@/lib/puck/config";
import { normalizePuckLayout } from "@/lib/puck/normalize";
import { puckLayoutProblem } from "@/lib/puck/validate";
import { parsePageLayout, type PageLayout } from "@/lib/puck/types";
import { cn } from "@/components/ui/ui";

const BUILDER_PAGES = new Set([
  "home",
  "about",
  "services",
  "achievements",
  "learn",
  "contact",
  "tools",
]);

const puckViewports = [
  { width: 1280, height: "auto" as const, icon: "Monitor" as const, label: "Desktop" },
  { width: 768, height: "auto" as const, icon: "Tablet" as const, label: "Tablet" },
  { width: 390, height: "auto" as const, icon: "Smartphone" as const, label: "Phone" },
];

export function canUsePageBuilder(page: { id: string; locked?: boolean; custom?: boolean }) {
  if (page.locked) return false;
  return page.custom || BUILDER_PAGES.has(page.id);
}

export function PageBuilderScreen() {
  const params = useParams<{ pageId: string }>();
  const router = useRouter();
  const { activeTenant, updatePage, sync } = useRequiredTenant();
  const pageId = params.pageId;
  const page = activeTenant.pages.find((item) => item.id === pageId);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedPageId = useRef<string | null>(null);
  const baseline = useRef("");
  const acceptEdits = useRef(false);

  const [editorData, setEditorData] = useState<PageLayout | null>(null);

  useEffect(() => {
    if (!page) {
      setEditorData(null);
      loadedPageId.current = null;
      return;
    }
    if (loadedPageId.current === page.id) return;
    loadedPageId.current = page.id;
    const saved = parsePageLayout(page.layout);
    const seeded = page.id === "home" && !saved ? homeLayoutFromPractice(activeTenant) : layoutForEditor(page.title, page.layout);
    baseline.current = JSON.stringify(seeded);
    setEditorData(seeded);
    if (page.id === "home" && !saved) updatePage(page.id, { layout: seeded });
  }, [page, activeTenant, updatePage]);

  useEffect(() => {
    acceptEdits.current = false;
    const timer = setTimeout(() => {
      acceptEdits.current = true;
    }, 500);
    return () => clearTimeout(timer);
  }, [page?.id]);

  const base = `/site/${activeTenant.slug}`;
  const previewPath = page?.custom ? `${base}/${page.id}` : page ? `${base}${page.path === "/" ? "" : page.path}` : base;

  const persist = useCallback(
    (data: PageLayout, immediate = false) => {
      if (!page) return;
      const normalized = normalizePuckLayout(data);
      const problem = puckLayoutProblem(normalized);
      if (problem) {
        setError(problem);
        return;
      }
      setError(null);
      const run = () => {
        updatePage(page.id, { layout: normalized });
        setNotice("Layout saved.");
      };
      if (immediate) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        run();
        return;
      }
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(run, 700);
    },
    [page, updatePage],
  );

  if (!page) {
    return (
      <main className="mx-auto max-w-lg py-16">
        <p className="font-display text-xl font-semibold">Page not found</p>
        <Link href="/dashboard/pages" className="mt-4 inline-flex text-sm font-semibold text-brand">
          Back to pages
        </Link>
      </main>
    );
  }

  if (!canUsePageBuilder(page)) {
    return (
      <main className="mx-auto max-w-lg space-y-4 py-16">
        <p className="font-display text-xl font-semibold">This page uses a fixed layout</p>
        <p className="text-sm leading-6 text-body">
          {page.locked
            ? "Disclosures and compliance wording stay locked. Edit the text fields on the Pages screen if your ARN details change."
            : "This page keeps its fixed layout. Use Pages for the text fields, or pick a page that opens in the visual editor."}
        </p>
        <Link href="/dashboard/pages" className="inline-flex text-sm font-semibold text-brand">Back to pages</Link>
      </main>
    );
  }

  if (!editorData) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/pages")}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-edge bg-surface px-3 text-sm font-medium text-body hover:bg-subtle"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Pages
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{page.title}</p>
            <p className="text-xs text-muted">
              {page.id === "home"
                ? "This is the page visitors see. Use Columns for left and right content. The Home banner follows Design."
                : "Add Columns for left and right content, then drop text, images, or cards into a column."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {sync === "saving" ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Saving…
            </span>
          ) : null}
          {error ? (
            <span role="alert" className="max-w-xs text-xs font-medium text-bad">{error}</span>
          ) : notice ? (
            <span className="text-xs text-muted">{notice}</span>
          ) : null}
          <Link
            href={previewPath}
            target="_blank"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-edge bg-surface px-3 text-sm font-semibold text-ink hover:bg-subtle"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Preview
          </Link>
        </div>
      </div>

      <div
        className={cn(
          "site-root min-h-0 flex-1 overflow-hidden rounded-2xl border border-edge shadow-sm",
          "[&_.Puck]:min-h-[640px]",
        )}
        style={siteStyle(activeTenant)}
      >
        <PuckSiteProvider base={base}>
          <Puck
            key={page.id}
            config={puckConfig}
            data={editorData}
            viewports={puckViewports}
            ui={{
              viewports: {
                controlsVisible: true,
                current: { width: 1280, height: "auto" },
                options: puckViewports,
              },
            }}
            iframe={{ enabled: true }}
            onChange={(data) => {
              const normalized = normalizePuckLayout(data as PageLayout);
              setEditorData(normalized);
              if (!acceptEdits.current) {
                baseline.current = JSON.stringify(normalized);
                return;
              }
              if (JSON.stringify(normalized) === baseline.current) return;
              setNotice(null);
              persist(normalized);
            }}
            onPublish={(data) => persist(normalizePuckLayout(data as PageLayout), true)}
            headerTitle={page.title}
            headerPath={previewPath}
          />
        </PuckSiteProvider>
      </div>
      <p className="mt-3 text-xs text-muted">
        Start with Columns (half / half, or narrow + wide), then drop Hero, text, or image cards into the left and right columns. ARN, risk wording, and Disclosures stay outside this editor. Button links use a page key such as{" "}
        <code className="rounded bg-subtle px-1">contact</code>.
      </p>
    </div>
  );
}
