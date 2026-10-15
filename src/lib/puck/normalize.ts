import type { PageLayout } from "@/lib/puck/types";

function blockId(type: string) {
  const slug = type.replace(/Block$/i, "").toLowerCase() || "block";
  const unique = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;
  return `${slug}-${unique.replace(/-/g, "").slice(0, 10)}`;
}

type PuckItem = PageLayout["content"][number];

function isPuckList(value: unknown): value is PuckItem[] {
  if (!Array.isArray(value)) return false;
  if (value.length === 0) return true;
  const first = value[0];
  return Boolean(first && typeof first === "object" && "type" in first && typeof (first as PuckItem).type === "string");
}

/** DropZone names used before Puck 0.20 slots. */
function slotNameForZone(zone: string) {
  if (/^col-\d+$/.test(zone)) return zone.replace("-", "");
  const aliases: Record<string, string> = {
    main: "a",
    top: "b",
    bottom: "c",
    q1: "a",
    q2: "b",
    q3: "c",
    q4: "d",
    r1: "a",
    r2: "b",
    r3: "c",
  };
  return aliases[zone] ?? zone;
}

function findItem(items: PuckItem[], id: string): PuckItem | undefined {
  for (const item of items) {
    const props = (item.props ?? {}) as Record<string, unknown>;
    if (props.id === id) return item;
    for (const value of Object.values(props)) {
      if (isPuckList(value) && value.length > 0 && typeof value[0].type === "string") {
        const nested = findItem(value, id);
        if (nested) return nested;
      }
    }
  }
  return undefined;
}

function ensureContentIds(items: PuckItem[]): PuckItem[] {
  const seen = new Set<string>();
  return items.map((item) => {
    if (!item || typeof item !== "object" || typeof item.type !== "string") return item;
    const props = { ...(item.props ?? {}) } as Record<string, unknown>;
    let id = typeof props.id === "string" && props.id.trim() ? props.id.trim() : blockId(item.type);
    while (seen.has(id)) id = blockId(item.type);
    seen.add(id);
    for (const [key, value] of Object.entries(props)) {
      if (isPuckList(value) && (value.length === 0 || typeof value[0]?.type === "string")) {
        props[key] = ensureContentIds(value);
      }
    }
    return { ...item, props: { ...props, id } };
  });
}

function attachZones(content: PuckItem[], zones: Record<string, PuckItem[]>) {
  for (const [key, items] of Object.entries(zones)) {
    if (!Array.isArray(items)) continue;
    const splitAt = key.lastIndexOf(":");
    if (splitAt <= 0) continue;
    const parentId = key.slice(0, splitAt);
    const slot = slotNameForZone(key.slice(splitAt + 1));
    const parent = findItem(content, parentId);
    if (!parent) continue;
    const props = (parent.props ?? {}) as Record<string, unknown>;
    const existing = isPuckList(props[slot]) ? (props[slot] as PuckItem[]) : [];
    props[slot] = existing.length > 0 ? existing : items;
    parent.props = props;
  }
}

function countPuckItems(items: PuckItem[]): number {
  let count = 0;
  for (const item of items) {
    if (!item || typeof item !== "object" || typeof item.type !== "string") continue;
    count += 1;
    for (const value of Object.values((item.props ?? {}) as Record<string, unknown>)) {
      if (isPuckList(value) && (value.length === 0 || typeof value[0]?.type === "string")) {
        count += countPuckItems(value);
      }
    }
  }
  return count;
}

export function countLayoutBlocks(layout: PageLayout) {
  const nested = countPuckItems(layout.content ?? []);
  const zones = Object.values(layout.zones ?? {}).flatMap((items) => (Array.isArray(items) ? items : []));
  return nested + zones.length;
}

/** Puck indexes layers by `props.id`. Missing ids, duplicate ids, and leftover DropZone maps break columns. */
export function normalizePuckLayout(data: PageLayout): PageLayout {
  const content = ensureContentIds(data.content ?? []);
  attachZones(content, data.zones ?? {});

  const rootProps = { ...(data.root?.props ?? {}) } as Record<string, unknown>;
  if (typeof rootProps.id !== "string" || !rootProps.id) rootProps.id = "root";

  return {
    content: ensureContentIds(content),
    root: { ...data.root, props: rootProps },
    zones: {},
  };
}
