import { defaultEnabledCalculators } from "@/lib/calculator-catalog";
import { getTemplate, type TemplateId } from "@/lib/design";
import { homeLayoutFromPractice } from "@/lib/puck/defaults";
import type { PlanId } from "@/lib/plans";
import { hasTeam } from "@/lib/plans";
import type { Tenant } from "@/lib/sample-data";
import type { FontId } from "@/lib/themes";

export type WebsiteDraft = {
  plan: PlanId;
  contactPerson: string;
  email: string;
  businessName: string;
  arn: string;
  city: string;
  phone: string;
  intro: string;
  languages: string[];
  template: TemplateId;
  primaryColour: string;
  fontStyle: FontId;
  services: { title: string; description: string }[];
  logoDataUrl: string | null;
  photoDataUrl: string | null;
  hours: string;
  arnExpiry: string;
};

export function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return slug || "my-practice";
}

export function sitePath(slug: string) {
  return `/site/${slug}`;
}

/** Subdomain address, e.g. http://sharma-investments.localhost:3000 — served by src/proxy.ts. */
export function siteSubdomainUrl(slug: string, origin: string) {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  if (!root || !origin) return "";
  const protocol = origin.startsWith("https") ? "https" : "http";
  return `${protocol}://${slug}.${root}`;
}

export function buildTenant(draft: WebsiteDraft, slug = slugify(draft.businessName)): Tenant {
  const city = draft.city.trim() || "your city";
  const name = draft.businessName.trim();
  const template = getTemplate(draft.template);
  const preset = template.tokens;
  const tenant: Tenant = {
    ...preset,
    template: template.id,
    // Templates whose buttons share the brand colour keep doing so after the MFD picks a colour.
    buttonColour: preset.buttonColour === preset.primaryColour ? draft.primaryColour : preset.buttonColour,
    heroTitle: "",
    heroButtonLabel: "",
    heroImageDataUrl: null,
    slug,
    businessName: name,
    legalName: name,
    arn: draft.arn.trim(),
    arnExpiry: draft.arnExpiry.trim() || "2027-03-31",
    plan: draft.plan,
    contactPerson: draft.contactPerson.trim(),
    phone: draft.phone.trim(),
    email: draft.email.trim(),
    address: city,
    hours: draft.hours.trim() || "Mon–Sat, 10:00–18:30",
    showAddress: true,
    languages: draft.languages.length ? draft.languages : ["English"],
    intro: draft.intro.trim(),
    primaryColour: draft.primaryColour,
    secondaryColour: "#0f172a",
    fontStyle: draft.fontStyle,
    customDomain: "",
    domainStatus: "none",
    published: true,
    logoDataUrl: draft.logoDataUrl,
    photoDataUrl: draft.photoDataUrl,
    clientLoginNote:
      "This button will later open the back office you already use. This prototype does not show portfolios.",
    pages: [
      page("home", "Home", "/", `Welcome page for ${name}.`, draft.intro, `${name} · Mutual fund distributor`, `AMFI-registered distributor in ${city}.`),
      page("about", "About", "/about", "Who investors meet.", `${draft.contactPerson} helps families in ${city}. Conversations can be in ${draft.languages.join(", ")}.`, `About ${name}`, `Meet ${draft.contactPerson}.`),
      page("services", "Services", "/services", "What you help with.", "Short descriptions of the help you actually provide.", `Services · ${name}`, "Services from this distributor."),
      page("achievements", "Achievements", "/achievements", "Milestones you confirm.", "Only items you mark as accurate appear here.", `Achievements · ${name}`, "Published milestones."),
      page("tools", "Calculators", "/calculators", "Calculators on one page.", "Estimates for SIP, goals, and inflation. Every result asks the visitor to talk to you.", `Calculators · ${name}`, "Estimates, not promises."),
      page("learn", "Learn", "/learn", "Short education notes.", "Plain-language notes a new investor can read before a meeting.", `Learn · ${name}`, "Investor education."),
      page("contact", "Contact", "/contact", "Enquiry form.", "Name, phone, and a message. Consent is required.", `Contact ${name}`, "Send an enquiry."),
      {
        ...page("disclosures", "Disclosures", "/disclosures", "Risk wording that stays on the site.", `${name} is an AMFI-registered Mutual Fund Distributor. This page cannot be removed.`, `Disclosures · ${name}`, "Market-risk disclaimer."),
        locked: true,
      },
    ],
    services: draft.services.map((service, index) => ({
      id: `service-${index}`,
      title: service.title,
      description: service.description,
      status: "published" as const,
    })),
    achievements: [
      {
        id: "practice",
        title: `Serving investors in ${city}`,
        year: "2026",
        description: "Added when the website was created. Edit it if you want different wording.",
        status: "published",
      },
    ],
    articles: [
      {
        slug: "what-is-a-sip",
        title: "What is a SIP?",
        body: "A systematic investment plan invests a fixed amount on a schedule, often every month. The value of the units can rise or fall. It is not a fixed-return product.",
        status: "published",
      },
      {
        slug: "inflation",
        title: "What is inflation?",
        body: "Inflation means the same rupee buys less later. A goal calculator uses a rate you type so a future cost is not stuck at today’s price.",
        status: "published",
      },
      {
        slug: "compounding",
        title: "How compounding works",
        body: "Compounding is growth on earlier growth. It depends on staying invested and on the market. It is not a guarantee.",
        status: "published",
      },
      {
        slug: "risks",
        title: "What are the risks of mutual funds?",
        body: "Equity funds can fall sharply. Debt funds can also lose value. Read the scheme document. Treat every calculator result as an illustration.",
        status: "published",
      },
    ],
    leads: [
      {
        id: "lead-example-1",
        name: "Riya Kulkarni",
        email: "riya@example.com",
        phone: "+91 98450 22011",
        message: "Can I start a SIP of ₹2,000 a month?",
        source: "Example · SIP calculator",
        status: "new",
        note: "Example enquiry so you can see the inbox. A real one appears when someone uses your contact form.",
        createdAt: "Today",
      },
      {
        id: "lead-example-2",
        name: "Arjun Mehta",
        email: "arjun@example.com",
        phone: "+91 90909 44112",
        message: "Please call me after 6 pm.",
        source: "Example · Contact page",
        status: "contacted",
        note: "Example. Change the status to see how follow-up works.",
        createdAt: "Yesterday",
      },
    ],
    announcement: `New visitors can send an enquiry to ${name}. This notice is yours to edit.`,
    faqs: [
      {
        question: "Can I start a SIP of ₹2,000 a month?",
        answer: "Many schemes accept SIPs from small amounts. The exact minimum depends on the scheme. I can check it with you on a call.",
      },
      {
        question: "What is a SIP?",
        answer: "A SIP invests a fixed amount on a schedule. The market value can rise or fall. It is not a fixed-return product.",
      },
    ],
    team: hasTeam(draft.plan)
      ? [
        {
          slug: slugify(draft.contactPerson),
          name: draft.contactPerson,
          euin: "E123456",
          role: "Principal distributor",
        },
      ]
      : [],
    visitors: 0,
    meetings: 0,
    enabledCalculators: defaultEnabledCalculators(draft.plan),
  };
  return {
    ...tenant,
    pages: tenant.pages.map((page) =>
      page.id === "home" ? { ...page, layout: homeLayoutFromPractice(tenant) } : page,
    ),
  };
}

function page(
  id: string,
  title: string,
  path: string,
  summary: string,
  body: string,
  seoTitle: string,
  seoDescription: string,
) {
  return {
    id,
    title,
    path,
    summary,
    body,
    status: "published" as const,
    seoTitle,
    seoDescription,
  };
}
