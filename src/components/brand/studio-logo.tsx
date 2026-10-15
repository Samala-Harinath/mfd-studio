import { cn } from "@/components/ui/ui";
import type { DashboardTheme } from "@/components/dashboard/theme";

const sources: Record<DashboardTheme, string> = {
  light: "/MFD-Studio-light.png",
  dark: "/MFD-Studio-dark.png",
};

/** Wordmark from public/. Dark mode drops the black plate so it sits on the office surface. */
export function StudioLogo({
  theme = "light",
  className,
}: {
  theme?: DashboardTheme;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sources[theme]}
      alt="MFD Studio"
      className={cn(
        "h-11 w-auto max-w-full object-contain object-left",
        theme === "dark" && "mix-blend-screen",
        className,
      )}
    />
  );
}
