"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/brand/image-upload";
import { useRequiredTenant as usePrototype } from "@/features/studio/hooks";
import { canUsePageBuilder } from "@/components/puck/page-builder";
import { parsePageLayout } from "@/lib/puck/types";
import { Badge, Button, ButtonLink, Card, Field, fieldClass } from "@/components/ui/ui";
import { LayoutTemplate } from "lucide-react";
import { findRestrictedTerm } from "@/lib/format";
import { getPlan } from "@/lib/plans";
import type { ContentStatus } from "@/lib/sample-data";
import { fontStyleVars } from "@/lib/themes";

export function BrandingScreen() {
  const { activeTenant, updateActive } = usePrototype();
  const [notice, setNotice] = useState("");

  return (
    <div className="space-y-6">
      <Header title="Branding" text="Logo, photo, contact details, and the name visitors see. The ARN line cannot be removed." />
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <form
            key={activeTenant.slug}
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const businessName = String(data.get("businessName") ?? "");
              const blocked = findRestrictedTerm(businessName);
              if (blocked) {
                setNotice(`“${blocked}” cannot be used in the public name.`);
                return;
              }
              updateActive({
                businessName,
                phone: String(data.get("phone") ?? ""),
                email: String(data.get("email") ?? ""),
                address: String(data.get("address") ?? ""),
                hours: String(data.get("hours") ?? ""),
                arnExpiry: String(data.get("arnExpiry") ?? ""),
                languages: String(data.get("languages") ?? "")
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              });
              setNotice("Branding saved. Open the public site to see it.");
            }}
          >
            <Field label="Display name">
              <input name="businessName" defaultValue={activeTenant.businessName} className={fieldClass} />
            </Field>
            <Field label="Phone">
              <input name="phone" defaultValue={activeTenant.phone} className={fieldClass} />
            </Field>
            <Field label="Email">
              <input name="email" defaultValue={activeTenant.email} className={fieldClass} />
            </Field>
            <Field label="Address">
              <input name="address" defaultValue={activeTenant.address} className={fieldClass} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Office hours">
                <input name="hours" defaultValue={activeTenant.hours} className={fieldClass} />
              </Field>
              <Field label="ARN expiry">
                <input name="arnExpiry" type="date" defaultValue={activeTenant.arnExpiry} className={fieldClass} />
              </Field>
            </div>
            <Field label="Languages" hint="Separate with commas.">
              <input name="languages" defaultValue={activeTenant.languages.join(", ")} className={fieldClass} />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-canvas px-4 py-3">
              <p className="text-[13px] leading-5 text-body">
                Template, colours, fonts, header, and home banner are on the Design screen, with a live preview.
              </p>
              <ButtonLink href="/dashboard/design" variant="secondary" size="sm">
                Open Design
              </ButtonLink>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ImageUpload
                label="Logo"
                hint="Replaces the letter mark on the public site and in this office."
                emptyLabel="Logo"
                value={activeTenant.logoDataUrl}
                onChange={(logoDataUrl) => {
                  updateActive({ logoDataUrl });
                  setNotice(logoDataUrl ? "Logo saved. It is already on the public header." : "Logo removed.");
                }}
                onError={setNotice}
              />
              <ImageUpload
                label="Your photo"
                hint="Shown on the About page."
                emptyLabel="Photo"
                value={activeTenant.photoDataUrl}
                onChange={(photoDataUrl) => {
                  updateActive({ photoDataUrl });
                  setNotice(photoDataUrl ? "Photo saved on the About page." : "Photo removed.");
                }}
                onError={setNotice}
              />
            </div>
            <Button type="submit">Save branding</Button>
          </form>
          {notice ? <p className="mt-4 text-sm text-brand">{notice}</p> : null}
        </Card>
        <Card>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Header preview</p>
          <div className="mt-4 rounded-2xl border border-line p-4" style={fontStyleVars(activeTenant.fontStyle)}>
            <div className="flex items-center gap-3">
              <Mark tenantName={activeTenant.businessName} logo={activeTenant.logoDataUrl} colour={activeTenant.primaryColour} />
              <div>
                <p className="font-display text-lg font-semibold">{activeTenant.businessName}</p>
                <p className="text-xs text-muted">AMFI-registered Mutual Fund Distributor · {activeTenant.arn}</p>
              </div>
            </div>
            <button
              type="button"
              className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-white"
              style={{ background: activeTenant.primaryColour }}
            >
              Send an enquiry
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function PagesScreen() {
  const { activeTenant, updatePage, setPageStatus, addPage, removePage } = usePrototype();
  const [selected, setSelected] = useState(activeTenant.pages[0]?.id ?? "");
  const [notice, setNotice] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const page = activeTenant.pages.find((item) => item.id === selected) ?? activeTenant.pages[0];
  const plan = getPlan(activeTenant.plan);
  const used = activeTenant.pages.filter((item) => item.status === "published").length;

  if (!page) return null;

  return (
    <div className="space-y-6">
      <Header
        title="Website pages"
        text={`${used} of ${plan.pages} pages published on ${plan.name}. Home is a visual-editor page from the start. Use Columns for left and right content. Reset home to restore the default visual layout.`}
      />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="p-3">
          <ul className="space-y-1">
            {activeTenant.pages.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelected(item.id)}
                  className={
                    item.id === page.id
                      ? "flex w-full items-center justify-between rounded-xl bg-canvas px-3 py-2 text-left text-sm"
                      : "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-canvas"
                  }
                >
                  <span>{item.title}</span>
                  <StatusBadge status={item.status} />
                </button>
              </li>
            ))}
          </ul>
          <form
            className="mt-3 space-y-2 border-t border-line px-1 pt-3"
            onSubmit={(event) => {
              event.preventDefault();
              const blocked = findRestrictedTerm(newTitle);
              const error = blocked ? `“${blocked}” is blocked.` : addPage(newTitle);
              if (error) {
                setNotice(error);
                return;
              }
              setNotice("Page added as a draft. Write it, then publish.");
              setNewTitle("");
            }}
          >
            <input
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="New page title, e.g. NRI investing"
              className={fieldClass}
            />
            <Button type="submit" size="sm" variant="secondary" className="w-full">Add page</Button>
          </form>
        </Card>
        <Card>
          <form
            key={`${activeTenant.slug}-${page.id}`}
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const title = String(data.get("title") ?? "");
              const blocked = findRestrictedTerm(`${title} ${data.get("body") ?? ""}`);
              if (blocked) {
                setNotice(`“${blocked}” is blocked. Rewrite that sentence.`);
                return;
              }
              updatePage(page.id, {
                title,
                body: String(data.get("body") ?? ""),
                seoTitle: String(data.get("seoTitle") ?? ""),
                seoDescription: String(data.get("seoDescription") ?? ""),
              });
              setNotice("Page text saved.");
            }}
          >
            <Field label="Title">
              <input name="title" defaultValue={page.title} className={fieldClass} />
            </Field>
            <Field label="Page text">
              <textarea name="body" defaultValue={page.body} className={`${fieldClass} min-h-28`} />
            </Field>
            <Field label="Search title">
              <input name="seoTitle" defaultValue={page.seoTitle} className={fieldClass} />
            </Field>
            <Field label="Search description">
              <textarea name="seoDescription" defaultValue={page.seoDescription} className={`${fieldClass} min-h-20`} />
            </Field>
            <div className="flex flex-wrap gap-2">
              {canUsePageBuilder(page) ? (
                <ButtonLink
                  href={`/dashboard/pages/${page.id}/builder`}
                  variant="secondary"
                  className="inline-flex gap-2"
                >
                  <LayoutTemplate className="h-4 w-4" aria-hidden />
                  Visual editor
                </ButtonLink>
              ) : null}
              <Button type="submit" variant="secondary">Save text</Button>
              <Button
                type="button"
                onClick={() => {
                  const error = setPageStatus(page.id, page.status === "published" ? "draft" : "published");
                  setNotice(error ?? (page.status === "published" ? "Moved back to draft." : "Published."));
                }}
                disabled={page.locked}
              >
                {page.status === "published" ? "Unpublish" : "Publish"}
              </Button>
              {page.id === "home" && parsePageLayout(page.layout) ? (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => {
                    updatePage(page.id, { layout: null });
                    setNotice("Home is reset. Visitors see the default visual layout again.");
                  }}
                >
                  Reset home layout
                </Button>
              ) : null}
              {page.custom ? (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => {
                    removePage(page.id);
                    setSelected(activeTenant.pages[0]?.id ?? "");
                    setNotice("Page deleted.");
                  }}
                >
                  Delete page
                </Button>
              ) : null}
            </div>
          </form>
          <p className="mt-3 text-sm text-muted">
            Public address: /site/{activeTenant.slug}
            {page.id === "home" ? "" : page.id === "tools" ? "/calculators" : `/${page.id}`}
          </p>
          {page.id === "home" ? (
            <p className="mt-3 text-sm text-muted">
              Visitors already see this visual layout. Open the visual editor to change sections, including left and right columns.
            </p>
          ) : null}
          {page.locked ? <p className="mt-3 text-sm text-muted">Disclosures stay on the public site.</p> : null}
          {notice ? <p className="mt-3 text-sm text-teal">{notice}</p> : null}
        </Card>
      </div>
    </div>
  );
}

export function ServicesScreen() {
  const { activeTenant, updateService, addService, moveService, removeService } = usePrototype();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Header title="Services" text="Published cards appear on the public services page. Drafts stay here." />
        <Button type="button" onClick={addService}>Add service</Button>
      </div>
      <div className="space-y-3">
        {activeTenant.services.map((service, index) => (
          <Card key={service.id}>
            <div className="mb-3 flex items-center justify-between">
              <StatusBadge status={service.status} />
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => moveService(service.id, -1)} disabled={index === 0}>Up</Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => moveService(service.id, 1)} disabled={index === activeTenant.services.length - 1}>Down</Button>
                <Button type="button" size="sm" variant="danger" onClick={() => removeService(service.id)}>Remove</Button>
              </div>
            </div>
            <div className="grid gap-3">
              <input
                value={service.title}
                onChange={(event) => updateService(service.id, { title: event.target.value })}
                className={fieldClass}
              />
              <textarea
                value={service.description}
                onChange={(event) => updateService(service.id, { description: event.target.value })}
                className={`${fieldClass} min-h-20`}
              />
              <div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    updateService(service.id, {
                      status: service.status === "published" ? "draft" : "published",
                    })
                  }
                >
                  {service.status === "published" ? "Move to draft" : "Publish"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AchievementsScreen() {
  const { activeTenant, updateAchievement, addAchievement, removeAchievement } = usePrototype();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Header title="Achievements" text="A new milestone stays in review until you confirm it is accurate. Only published items show publicly." />
        <Button type="button" onClick={addAchievement}>Add milestone</Button>
      </div>
      <div className="space-y-3">
        {activeTenant.achievements.map((item) => (
          <Card key={item.id}>
            <div className="flex items-center justify-between">
              <StatusBadge status={item.status} />
              <Button type="button" size="sm" variant="danger" onClick={() => removeAchievement(item.id)}>Remove</Button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr]">
              <input value={item.year} onChange={(event) => updateAchievement(item.id, { year: event.target.value })} className={fieldClass} />
              <input value={item.title} onChange={(event) => updateAchievement(item.id, { title: event.target.value })} className={fieldClass} />
            </div>
            <textarea
              value={item.description}
              onChange={(event) => updateAchievement(item.id, { description: event.target.value })}
              className={`${fieldClass} mt-3 min-h-20`}
            />
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.status === "published"}
                onChange={(event) =>
                  updateAchievement(item.id, { status: event.target.checked ? "published" : "review" })
                }
              />
              I confirm this is accurate and can be published
            </label>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function MediaScreen() {
  const { activeTenant, updateActive } = usePrototype();
  const files = [
    activeTenant.logoDataUrl ? { name: "Logo", src: activeTenant.logoDataUrl } : null,
    activeTenant.photoDataUrl ? { name: "Profile photo", src: activeTenant.photoDataUrl } : null,
  ].filter(Boolean) as { name: string; src: string }[];

  return (
    <div className="space-y-6">
      <Header title="Media" text="Logos and photos uploaded on the branding screen appear here. Other file types are refused." />
      {files.length === 0 ? (
        <Card>
          <p className="text-sm text-body">No files yet. Upload a logo from Branding and it will show on the public header.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {files.map((file) => (
            <Card key={file.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={file.src} alt={file.name} className="h-32 w-full rounded-xl bg-canvas object-contain" />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{file.name}</p>
                <button
                  type="button"
                  className="text-sm font-medium text-bad"
                  onClick={() => updateActive(file.name === "Logo" ? { logoDataUrl: null } : { photoDataUrl: null })}
                >
                  Remove
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function AnnouncementsScreen() {
  const { activeTenant, updateActive } = usePrototype();
  return (
    <div className="space-y-6">
      <Header title="Announcements" text="A short notice on the public home page. Leave it blank to hide the banner." />
      <Card>
        <textarea
          value={activeTenant.announcement}
          onChange={(event) => updateActive({ announcement: event.target.value })}
          className={`${fieldClass} min-h-28`}
        />
      </Card>
    </div>
  );
}

export function LearnScreen() {
  const { activeTenant } = usePrototype();
  return (
    <div className="space-y-6">
      <Header title="Investor education" text="Starter articles visitors can read. The risk note on each article cannot be removed." />
      <div className="space-y-3">
        {activeTenant.articles.map((article) => (
          <Card key={article.slug}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold">{article.title}</h2>
              <StatusBadge status={article.status} />
            </div>
            <p className="mt-2 text-sm leading-6 text-body">{article.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Header({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-body">{text}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: ContentStatus }) {
  const tone = status === "published" ? "published" : status === "review" ? "review" : "draft";
  const label = status === "published" ? "Published" : status === "review" ? "Needs review" : "Draft";
  return <Badge tone={tone}>{label}</Badge>;
}

function Mark({
  tenantName,
  logo,
  colour,
}: {
  tenantName: string;
  logo: string | null;
  colour: string;
}) {
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logo} alt="" className="h-12 w-12 rounded-xl object-cover" />
    );
  }
  return (
    <span
      className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-semibold text-white"
      style={{ background: colour }}
    >
      {tenantName.slice(0, 1)}
    </span>
  );
}
