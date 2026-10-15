/**
 * Root layout for MFD Studio UI only (marketing, auth, dashboard, public sites).
 * Payload admin uses app/(payload)/layout.tsx so each side can own <html>/<body>.
 */
import type { Metadata } from "next";
import { Inter, Lora, Playfair_Display, Plus_Jakarta_Sans, Poppins } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta-base",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: {
    default: "MFD Studio",
    template: "%s · MFD Studio",
  },
  description: "A website platform for AMFI-registered mutual fund distributors.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} ${lora.variable} ${poppins.variable} ${playfair.variable} h-full`}
    >
      <body className="min-h-full bg-canvas text-ink antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
