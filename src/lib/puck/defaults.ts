import { DEFAULT_HERO_BUTTON } from "@/lib/design";
import { normalizePuckLayout } from "@/lib/puck/normalize";
import { parsePageLayout, type PageLayout } from "@/lib/puck/types";
import type { Tenant } from "@/lib/sample-data";

export function emptyLayout(): PageLayout {
  return { content: [], root: { props: { title: "" } }, zones: {} };
}

function heroAlign(layout: Tenant["heroLayout"]) {
  if (layout === "centered") return "center";
  if (layout === "split") return "split";
  return "left";
}

function item(type: string, id: string, props: Record<string, unknown>) {
  return { type, props: { id, ...props } };
}

/** First-time custom page: one hero and one text block the MFD can edit. */
export function starterLayout(pageTitle: string): PageLayout {
  return normalizePuckLayout({
    content: [
      item("HeroBlock", "page-hero", {
        eyebrow: "AMFI-registered Mutual Fund Distributor",
        title: pageTitle,
        description: "Write in plain language. Do not promise returns or guaranteed growth.",
        align: "left",
        image: "",
        bullets: [],
        primaryLabel: DEFAULT_HERO_BUTTON,
        primaryPage: "contact",
        secondaryLabel: "",
        secondaryPage: "about",
      }),
      item("ColumnsBlock", "page-columns", {
        layout: "half",
        radius: "soft",
        shadow: "none",
        col0: [
          item("HeadingBlock", "page-left-heading", { text: "On the left", size: "medium" }),
          item("TextBlock", "page-left-text", {
            body: "Drop a heading, text, or image into this column.",
          }),
        ],
        col1: [
          item("HeadingBlock", "page-right-heading", { text: "On the right", size: "medium" }),
          item("TextBlock", "page-right-text", {
            body: "This column stays beside the left one on desktop.",
          }),
        ],
        col2: [],
        col3: [],
      }),
    ],
    root: { props: { title: pageTitle } },
    zones: {},
  });
}

/** Home uses the visual editor layout from the first visit, matching Design tokens. */
export function homeLayoutFromPractice(practice: Tenant): PageLayout {
  const title = practice.heroTitle.trim() || practice.businessName;
  const services = practice.services.filter((service) => service.status === "published");
  return normalizePuckLayout({
    content: [
      item("HeroBlock", "home-hero", {
        eyebrow: "AMFI-registered Mutual Fund Distributor",
        title,
        description: practice.intro,
        align: heroAlign(practice.heroLayout),
        image: practice.heroImageDataUrl ?? "",
        bullets: [],
        primaryLabel: practice.heroButtonLabel.trim() || DEFAULT_HERO_BUTTON,
        primaryPage: "contact",
        secondaryLabel: "Calculators",
        secondaryPage: "calculators",
      }),
      item("StatsBlock", "home-stats", {
        heading: "",
        sample: "no",
        items: [
          { label: "ARN", value: practice.arn, hint: "" },
          { label: "Office", value: practice.address, hint: "" },
          { label: "Languages", value: practice.languages.join(", "), hint: "" },
        ],
      }),
      item("ColumnsBlock", "home-columns", {
        layout: "half",
        radius: "soft",
        shadow: "none",
        col0: [
          item("HeadingBlock", "home-left-heading", { text: "Who this is for", size: "medium" }),
          item("TextBlock", "home-left-text", {
            body: "Families who want a clear first conversation before any paperwork.",
          }),
        ],
        col1: [
          item("HeadingBlock", "home-right-heading", { text: "What happens next", size: "medium" }),
          item("TextBlock", "home-right-text", {
            body: "Send an enquiry. We reply with a time to talk. Nothing here is a scheme recommendation.",
          }),
        ],
        col2: [],
        col3: [],
      }),
      item("TextBlock", "home-intro", {
        body: `Conversations stay with ${practice.contactPerson}. Nothing here is a scheme recommendation.`,
      }),
      item("FeatureGridBlock", "home-features", {
        heading: "How this practice helps",
        items: services.map((service) => ({ title: service.title, description: service.description })),
      }),
    ],
    root: { props: { title: "Home" } },
    zones: {},
  });
}

/** Keeps the Home banner on Design in sync with the visual home hero. */
export function syncHomeBanner(layout: PageLayout, practice: Tenant): PageLayout {
  const next: PageLayout = {
    content: layout.content.map((block) => ({ ...block, props: { ...(block.props ?? {}) } })),
    root: layout.root,
    zones: layout.zones ?? {},
  };
  const title = practice.heroTitle.trim() || practice.businessName;
  const align = heroAlign(practice.heroLayout);
  const image = practice.heroImageDataUrl ?? "";
  const primaryLabel = practice.heroButtonLabel.trim() || DEFAULT_HERO_BUTTON;
  const hero = next.content.find((block) => block.type === "HeroBlock");
  if (hero) {
    hero.props = {
      ...hero.props,
      title,
      align,
      image,
      primaryLabel,
    };
  } else {
    next.content.unshift(
      item("HeroBlock", "home-hero", {
        eyebrow: "AMFI-registered Mutual Fund Distributor",
        title,
        description: practice.intro,
        align,
        image,
        bullets: [],
        primaryLabel,
        primaryPage: "contact",
        secondaryLabel: "Calculators",
        secondaryPage: "calculators",
      }),
    );
  }
  return normalizePuckLayout(next);
}

export function layoutForEditor(pageTitle: string, raw: unknown): PageLayout {
  const saved = parsePageLayout(raw);
  if (saved) return saved;
  return starterLayout(pageTitle);
}

export function layoutForHome(practice: Tenant, raw: unknown): PageLayout | "empty" {
  const saved = parsePageLayout(raw);
  if (saved) {
    if (!saved.content.length) return "empty";
    return saved;
  }
  return homeLayoutFromPractice(practice);
}
