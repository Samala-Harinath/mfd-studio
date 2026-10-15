"use client";

import { useState } from "react";
import { modules, optionalServices, plans } from "@/lib/plans";
import { inr } from "@/lib/format";
import { Badge, Button, Card, Field, fieldClass, PageIntro } from "@/components/ui/ui";

export function FeaturesScreen() {
  const groups = ["All plans", "Growth & Pro", "Pro"] as const;
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <PageIntro
        eyebrow="What you get"
        title="One platform, four jobs"
        text="Look professional, answer from approved content, keep every enquiry in one place, and give search engines a clear site."
      />
      <div className="mt-10 space-y-10">
        {groups.map((group) => (
          <section key={group}>
            <h2 className="font-display text-xl font-semibold">{group}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {modules
                .filter((module) => module.group === group)
                .map((module) => (
                  <Card key={module.name} className="flex items-start justify-between gap-3 p-5">
                    <div>
                      <h3 className="font-medium">{module.name}</h3>
                      <p className="mt-1 text-sm text-body">
                        {module.soon
                          ? "Shown on the pricing page so the plan is honest. The workflow is not in this prototype."
                          : "Included in the clickable prototype."}
                      </p>
                    </div>
                    {module.soon ? <Badge tone="soon">Coming soon</Badge> : <Badge tone="published">In demo</Badge>}
                  </Card>
                ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

export function PricingScreen() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <PageIntro
        eyebrow="Plans and pricing"
        title="Three plans, set up for you"
        text="A one-time fee covers setup and year one. From year two, yearly AMC is 30% of the fee paid. Taxes are extra."
      />
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={
              plan.id === "growth"
                ? "rounded-3xl border-2 border-teal bg-white p-6"
                : "rounded-3xl border border-line bg-white p-6"
            }
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">{plan.name}</h2>
              {plan.id === "growth" ? <Badge tone="published">Most popular</Badge> : null}
            </div>
            <p className="mt-2 text-sm text-body">{plan.summary}</p>
            <p className="mt-6 text-sm text-muted line-through tabular-nums">List {inr(plan.listPrice)}</p>
            <p className="font-display text-4xl font-semibold tabular-nums">{inr(plan.launchPrice)}</p>
            <p className="mt-1 text-sm text-body">Launch price · one-time</p>
            <p className="mt-2 text-sm text-body">AMC {inr(plan.amc)} / year from year 2</p>
            <ul className="mt-6 space-y-2 text-sm leading-6 text-body">
              {plan.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <p className="mt-6 text-sm leading-6 text-muted">
        Launch prices are for the webinar-day example in the pricing deck. Payment in that offer is 100% in advance. AI use above the included credit comes from a prepaid wallet: ₹12 per chat conversation. Nothing in this prototype is billed.
      </p>
      <h2 className="mt-12 font-display text-2xl font-semibold">Optional services</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
        {optionalServices.map((service) => (
          <div key={service.name} className="grid gap-2 border-b border-line px-5 py-4 last:border-b-0 md:grid-cols-[1.2fr_2fr_1fr] md:items-center">
            <p className="font-medium">{service.name}</p>
            <p className="text-sm text-body">{service.detail}</p>
            <p className="text-sm font-medium tabular-nums md:text-right">{service.price}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

export function HowItWorksScreen() {
  const steps = [
    ["Share your details", "ARN, logo, photo, services, and languages. The setup wizard in the dashboard walks through the same list."],
    ["The site is assembled", "Templates made for distributors. Your colours and logo fill the header, buttons, and contact page."],
    ["You review it", "Draft pages stay private. Achievements that need a check stay in review."],
    ["You publish", "Visitors see the live site. New edits wait until you publish again."],
  ];
  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <PageIntro
        eyebrow="How it works"
        title="Four steps from details to a live site"
        text="The domain stays registered in the distributor’s name. The platform manages the pages, the enquiry inbox, and updates."
      />
      <ol className="mt-10 space-y-4">
        {steps.map(([title, text], index) => (
          <li key={title} className="rounded-2xl border border-line bg-white p-6">
            <p className="text-sm font-semibold text-teal">Step {index + 1}</p>
            <h2 className="mt-1 font-display text-xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-body">{text}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}

const faqs = [
  ["Do I need technical skills?", "No. The prototype uses simple forms: type, save, and publish. You do not edit code."],
  ["Can I use my existing domain?", "Yes. It stays in your name. The domain screen shows the DNS steps. This prototype does not connect a real domain."],
  ["Will the AI give investment advice?", "No. On Growth and Pro it answers only from approved lines, and it turns scheme questions into an enquiry."],
  ["Can investors see their portfolio?", "A Client login button can point to the back office you already use. This product does not store portfolios."],
  ["What if I use more AI than my credit?", "Usage would come from a prepaid wallet, with a warning before the balance runs out. The wallet screen shows the rates. It does not charge anyone."],
  ["Can I change plans later?", "Yes. The billing screen explains that an upgrade is quoted in writing first."],
];

export function FaqScreen() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <PageIntro eyebrow="FAQ" title="Questions distributors ask" text="Short answers you can read before you create your own website." />
      <div className="mt-8 space-y-3">
        {faqs.map(([question, answer]) => (
          <article key={question} className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-lg font-semibold">{question}</h2>
            <p className="mt-2 text-sm leading-6 text-body">{answer}</p>
          </article>
        ))}
      </div>
    </main>
  );
}

export function ContactScreen() {
  const [sent, setSent] = useState(false);
  return (
    <main className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      <PageIntro
        eyebrow="Next step"
        title="Book a 20-minute discovery call"
        text="In the real product this would reach the sales team. Here it only confirms the form."
      />
      {sent ? (
        <Card className="mt-8">
          <h2 className="font-display text-xl font-semibold">Request noted</h2>
          <p className="mt-2 text-sm leading-6 text-body">
            Nothing was emailed. After you create a website, investor enquiries land in that website’s private inbox.
          </p>
        </Card>
      ) : (
        <form
          className="mt-8 space-y-4 rounded-2xl border border-line bg-white p-6"
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
          }}
        >
          <Field label="Name">
            <input required className={fieldClass} name="name" />
          </Field>
          <Field label="Phone">
            <input required className={fieldClass} name="phone" />
          </Field>
          <Field label="Work email">
            <input required type="email" className={fieldClass} name="email" />
          </Field>
          <Field label="ARN">
            <input required className={fieldClass} name="arn" placeholder="ARN-00000" />
          </Field>
          <Field label="Plan interest">
            <select className={fieldClass} name="plan" defaultValue="growth">
              <option value="essential">Essential</option>
              <option value="growth">Growth</option>
              <option value="pro">Pro</option>
            </select>
          </Field>
          <Button type="submit">Request a call</Button>
        </form>
      )}
    </main>
  );
}

export function TermsScreen() {
  const sections = [
    ["Launch offer", "The deck’s launch prices apply to orders confirmed on the webinar day. List prices apply after that."],
    ["Payment", "The commercial example is 100% in advance, within 7 days of confirmation. Onboarding starts after payment. This prototype does not collect payment."],
    ["Yearly AMC", "30% of the one-time fee paid, in advance from year two."],
    ["Change requests", "Written request, written quote, approval, then work."],
    ["If AMC lapses", "A 15-day grace period, then the site is suspended. Data is kept 60 days for export."],
    ["Ownership", "The platform and templates stay with the product company. The distributor owns the domain, the words, the photos, and the enquiry list."],
  ];
  return (
    <Legal title="Commercial terms" note="Prototype wording so a reviewer can see the shape of the terms. This is not a contract." sections={sections} />
  );
}

export function PrivacyScreen() {
  const sections = [
    ["What a visitor sends", "Name, phone, email, and the message on the enquiry form, plus a record that they agreed to be contacted."],
    ["Who can see it", "Only people signed in to that distributor’s dashboard. Another distributor’s inbox is a different list."],
    ["Where it lives in the real product", "The plan is to store investor data in India. This prototype keeps it in the browser tab only."],
    ["Leaving", "The distributor can export enquiries from the inbox. Refreshing this demo clears anything you added."],
  ];
  return (
    <Legal title="Privacy" note="A plain-language preview of the privacy story. Have counsel review the real notice before launch." sections={sections} />
  );
}

function Legal({
  title,
  note,
  sections,
}: {
  title: string;
  note: string;
  sections: string[][];
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <PageIntro eyebrow="Draft" title={title} text={note} />
      <div className="mt-8 space-y-4">
        {sections.map(([heading, text]) => (
          <article key={heading} className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-lg font-semibold">{heading}</h2>
            <p className="mt-2 text-sm leading-6 text-body">{text}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
