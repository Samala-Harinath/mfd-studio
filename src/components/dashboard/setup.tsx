"use client";

import { useState } from "react";
import { useRequiredTenant as usePrototype } from "@/features/studio/hooks";
import { Button, Card, Field, fieldClass } from "@/components/ui/ui";
import { findRestrictedTerm } from "@/lib/format";

const steps = ["Business", "About", "Contact", "Review"];

export function SetupScreen() {
  const { activeTenant, updateActive } = usePrototype();
  const [step, setStep] = useState(0);
  const [notice, setNotice] = useState("");

  function saveBusiness(form: FormData) {
    const businessName = String(form.get("businessName") ?? "");
    const blocked = findRestrictedTerm(businessName);
    if (blocked) {
      setNotice(`“${blocked}” is blocked in a business name. Use the distributor designation instead.`);
      return false;
    }
    updateActive({
      businessName,
      legalName: String(form.get("legalName") ?? ""),
      arn: String(form.get("arn") ?? ""),
      contactPerson: String(form.get("contactPerson") ?? ""),
    });
    setNotice("Saved.");
    return true;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Setup</h1>
        <p className="mt-2 text-sm text-body">One step at a time. The public site stays as it is until you publish from Preview.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(index)}
            className={
              index === step
                ? "rounded-full bg-teal px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-full bg-surface px-3 py-1.5 text-sm text-body ring-1 ring-line"
            }
          >
            {index + 1}. {label}
          </button>
        ))}
      </div>
      <Card>
        {step === 0 ? (
          <form
            key={activeTenant.slug}
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (saveBusiness(new FormData(event.currentTarget))) setStep(1);
            }}
          >
            <Field label="Display name" hint="This is the name on the public header.">
              <input name="businessName" defaultValue={activeTenant.businessName} className={fieldClass} required />
            </Field>
            <Field label="Legal name">
              <input name="legalName" defaultValue={activeTenant.legalName} className={fieldClass} />
            </Field>
            <Field label="ARN">
              <input name="arn" defaultValue={activeTenant.arn} className={fieldClass} required />
            </Field>
            <Field label="Contact person">
              <input name="contactPerson" defaultValue={activeTenant.contactPerson} className={fieldClass} required />
            </Field>
            <Button type="submit">Save and continue</Button>
          </form>
        ) : null}
        {step === 1 ? (
          <form
            key={`${activeTenant.slug}-about`}
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              updateActive({
                intro: String(data.get("intro") ?? ""),
                languages: String(data.get("languages") ?? "")
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              });
              setNotice("Saved.");
              setStep(2);
            }}
          >
            <Field label="Short introduction">
              <textarea name="intro" defaultValue={activeTenant.intro} className={`${fieldClass} min-h-28`} />
            </Field>
            <Field label="Languages" hint="Separate with commas.">
              <input name="languages" defaultValue={activeTenant.languages.join(", ")} className={fieldClass} />
            </Field>
            <Button type="submit">Save and continue</Button>
          </form>
        ) : null}
        {step === 2 ? (
          <form
            key={`${activeTenant.slug}-contact`}
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              updateActive({
                phone: String(data.get("phone") ?? ""),
                email: String(data.get("email") ?? ""),
                address: String(data.get("address") ?? ""),
                hours: String(data.get("hours") ?? ""),
                showAddress: data.get("showAddress") === "on",
              });
              setNotice("Saved.");
              setStep(3);
            }}
          >
            <Field label="Phone">
              <input name="phone" defaultValue={activeTenant.phone} className={fieldClass} />
            </Field>
            <Field label="Email">
              <input name="email" type="email" defaultValue={activeTenant.email} className={fieldClass} />
            </Field>
            <Field label="Office address">
              <input name="address" defaultValue={activeTenant.address} className={fieldClass} />
            </Field>
            <Field label="Hours">
              <input name="hours" defaultValue={activeTenant.hours} className={fieldClass} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input name="showAddress" type="checkbox" defaultChecked={activeTenant.showAddress} />
              Show the address on the public site
            </label>
            <Button type="submit">Save and review</Button>
          </form>
        ) : null}
        {step === 3 ? (
          <div className="space-y-3 text-sm leading-6">
            <p><span className="font-medium">Name.</span> {activeTenant.businessName}</p>
            <p><span className="font-medium">ARN.</span> {activeTenant.arn}</p>
            <p><span className="font-medium">Languages.</span> {activeTenant.languages.join(", ")}</p>
            <p><span className="font-medium">Contact.</span> {activeTenant.phone} · {activeTenant.email}</p>
            <p className="text-body">{activeTenant.intro}</p>
            <Button type="button" onClick={() => setNotice("Review saved. Open Preview when you want visitors to see the latest draft.")}>
              Mark this step done
            </Button>
          </div>
        ) : null}
        {notice ? <p className="mt-4 text-sm text-teal">{notice}</p> : null}
      </Card>
    </div>
  );
}
