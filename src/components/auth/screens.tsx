"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StudioLogo } from "@/components/brand/studio-logo";
import { usePrototype } from "@/features/studio/hooks";
import { registerRequest } from "@/lib/api/mfd";
import { PasswordInput } from "@/components/ui/password-input";
import { Button, Field, fieldClass } from "@/components/ui/ui";

export function LoginScreen() {
  const router = useRouter();
  const { login, status, user } = usePrototype();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "ready" && user) router.replace("/dashboard");
  }, [status, user, router]);

  return (
    <AuthCard
      title="Log in"
      text="Use the email and password from your registration. You will land in the dashboard."
      footer={
        <p className="mt-6 text-sm text-muted">
          New to MFD Studio?{" "}
          <Link href="/signup" className="font-medium text-teal">
            Register
          </Link>
        </p>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const email = String(data.get("email") ?? "").trim().toLowerCase();
          const password = String(data.get("password") ?? "");
          if (!email.includes("@")) {
            setError("Enter an email address.");
            return;
          }
          setBusy(true);
          void login(email, password).then((problem) => {
            setBusy(false);
            if (problem) {
              setError(problem);
              return;
            }
            router.push("/dashboard");
          });
        }}
      >
        <Field label="Work email" error={error}>
          <input name="email" type="email" required className={fieldClass} placeholder="you@firm.example" />
        </Field>
        <Field label="Password">
          <PasswordInput name="password" required autoComplete="current-password" />
        </Field>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Checking…" : "Continue"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-body">
        <Link href="/forgot-password" className="text-teal">
          Forgot password
        </Link>
      </p>
    </AuthCard>
  );
}

export function SignupScreen() {
  const router = useRouter();
  const { login } = usePrototype();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <AuthCard
      title="Create an account"
      text="These fields are required. After you register you open the dashboard, and you create the website from there."
      footer={
        <p className="mt-6 text-sm text-muted">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-teal">
            Log in
          </Link>
        </p>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const name = String(data.get("name") ?? "").trim();
          const email = String(data.get("email") ?? "").trim().toLowerCase();
          const phone = String(data.get("phone") ?? "").trim();
          const arn = String(data.get("arn") ?? "").trim();
          const password = String(data.get("password") ?? "");
          const confirm = String(data.get("confirm") ?? "");
          if (name.length < 2) {
            setError("Enter your full name.");
            return;
          }
          if (!email.includes("@")) {
            setError("Enter a work email.");
            return;
          }
          if (phone.replace(/\D/g, "").length < 10) {
            setError("Enter a mobile number with at least 10 digits.");
            return;
          }
          if (arn.length < 4) {
            setError("Enter your ARN. Example: ARN-18432.");
            return;
          }
          if (password.length < 8) {
            setError("Use a password with at least 8 characters.");
            return;
          }
          if (password !== confirm) {
            setError("The two passwords do not match.");
            return;
          }
          setError("");
          setBusy(true);
          void registerRequest({ name, email, phone, arn, password })
            .then(() => login(email, password))
            .then((problem) => {
              if (problem) {
                setBusy(false);
                setError(problem);
                return;
              }
              router.push("/dashboard");
            })
            .catch((reason: unknown) => {
              setBusy(false);
              setError(reason instanceof Error ? reason.message : "Could not create the account.");
            });
        }}
      >
        <Field label="Full name" error={error}>
          <input name="name" required autoComplete="name" className={fieldClass} />
        </Field>
        <Field label="Work email">
          <input name="email" type="email" required autoComplete="email" className={fieldClass} placeholder="you@firm.example" />
        </Field>
        <Field label="Mobile number">
          <input name="phone" type="tel" required autoComplete="tel" className={fieldClass} placeholder="98450 22011" />
        </Field>
        <Field label="ARN">
          <input name="arn" required className={fieldClass} placeholder="ARN-18432" />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <PasswordInput name="password" required autoComplete="new-password" minLength={8} />
        </Field>
        <Field label="Confirm password">
          <PasswordInput name="confirm" required autoComplete="new-password" minLength={8} />
        </Field>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Creating your account…" : "Register and open dashboard"}
        </Button>
      </form>
    </AuthCard>
  );
}

export function ForgotScreen() {
  const [sent, setSent] = useState(false);
  return (
    <AuthCard
      title="Reset password"
      text="Enter your login email. For privacy we never say whether an address is registered."
      footer={
        <p className="mt-6 text-sm text-muted">
          <Link href="/login" className="font-medium text-teal">
            Back to log in
          </Link>
        </p>
      }
    >
      {sent ? (
        <p className="text-sm leading-6 text-body">
          If this email is registered, a reset link is on its way. The link opens a page where you choose a new password.
        </p>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const email = String(new FormData(event.currentTarget).get("email") ?? "").trim().toLowerCase();
            void fetch("/api/users/forgot-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            }).finally(() => setSent(true));
          }}
        >
          <Field label="Work email">
            <input name="email" type="email" required className={fieldClass} />
          </Field>
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

function AuthCard({
  title,
  text,
  children,
  footer,
}: {
  title: string;
  text: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8">
        <Link href="/" className="inline-block">
          <StudioLogo />
        </Link>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-body">{text}</p>
        <div className="mt-6">{children}</div>
        {footer}
      </div>
    </main>
  );
}
