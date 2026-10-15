"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { StudioLogo } from "@/components/brand/studio-logo";
import { ButtonLink, cn } from "@/components/ui/ui";

const links = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
];

export function MarketingFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-full bg-canvas">
      <div className="border-b border-indigo/20 bg-indigo-soft">
        <p className="mx-auto max-w-6xl px-4 py-2 text-center text-[13px] text-indigo sm:px-6">
          Register first. After you log in, the dashboard is where you create and edit the website.
        </p>
      </div>
      <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="min-w-0">
            <StudioLogo />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium",
                  pathname === link.href ? "text-teal" : "text-body hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <ButtonLink href="/login" variant="ghost" size="sm">
              Log in
            </ButtonLink>
            <ButtonLink href="/signup" size="sm">
              Register
            </ButtonLink>
          </div>
          <button
            type="button"
            className="rounded-lg border border-line px-3 py-2 text-sm font-medium md:hidden"
            onClick={() => setOpen((value) => !value)}
          >
            Menu
          </button>
        </div>
        {open ? (
          <div className="space-y-2 border-t border-line px-4 py-3 md:hidden">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="block py-2 text-sm" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="block py-2 text-sm" onClick={() => setOpen(false)}>
              Log in
            </Link>
            <Link href="/signup" className="block py-2 text-sm font-semibold text-teal" onClick={() => setOpen(false)}>
              Register
            </Link>
          </div>
        ) : null}
      </header>
      {children}
      <footer className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <StudioLogo />
            <p className="mt-2 max-w-sm text-sm leading-6 text-body">
              A website platform for AMFI-registered mutual fund distributors.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <Link href="/features" className="block text-body hover:text-ink">Features</Link>
            <Link href="/pricing" className="block text-body hover:text-ink">Pricing</Link>
            <Link href="/contact" className="block text-body hover:text-ink">Book a call</Link>
          </div>
          <div className="space-y-2 text-sm">
            <Link href="/faq" className="block text-body hover:text-ink">FAQ</Link>
            <Link href="/terms" className="block text-body hover:text-ink">Terms</Link>
            <Link href="/privacy" className="block text-body hover:text-ink">Privacy</Link>
            <Link href="/signup" className="block text-body hover:text-ink">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
