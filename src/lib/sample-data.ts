import type { CalculatorId } from "@/lib/calculator-catalog";
import type { SiteDesign } from "@/lib/design";
import type { PageLayout } from "@/lib/puck/types";
import type { PlanId } from "@/lib/plans";

export type ContentStatus = "draft" | "review" | "published";
export type LeadStatus = "new" | "contacted" | "closed";
export type DomainStatus = "none" | "pending" | "verified";

export type SitePage = {
  id: string;
  title: string;
  path: string;
  summary: string;
  body: string;
  layout?: PageLayout | null;
  status: ContentStatus;
  locked?: boolean;
  custom?: boolean;
  seoTitle: string;
  seoDescription: string;
};

export type ServiceCard = {
  id: string;
  title: string;
  description: string;
  status: ContentStatus;
};

export type Achievement = {
  id: string;
  title: string;
  year: string;
  description: string;
  status: ContentStatus;
};

export type Article = {
  slug: string;
  title: string;
  body: string;
  status: ContentStatus;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  status: LeadStatus;
  note: string;
  createdAt: string;
};

export type TeamMember = {
  slug: string;
  name: string;
  euin: string;
  role: string;
};

export type Faq = {
  question: string;
  answer: string;
};

export type Tenant = SiteDesign & {
  slug: string;
  businessName: string;
  legalName: string;
  arn: string;
  arnExpiry: string;
  plan: PlanId;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  showAddress: boolean;
  languages: string[];
  intro: string;
  secondaryColour: string;
  customDomain: string;
  domainStatus: DomainStatus;
  published: boolean;
  logoDataUrl: string | null;
  photoDataUrl: string | null;
  heroImageDataUrl: string | null;
  clientLoginNote: string;
  pages: SitePage[];
  services: ServiceCard[];
  achievements: Achievement[];
  articles: Article[];
  leads: Lead[];
  announcement: string;
  faqs: Faq[];
  team: TeamMember[];
  visitors: number;
  meetings: number;
  /** Null means every calculator this plan allows. An empty list hides them all. */
  enabledCalculators: CalculatorId[] | null;
};
