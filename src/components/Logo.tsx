import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

type LogoVariant = "default" | "header" | "drawer" | "hero" | "auth";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  alt?: string;
}

export function Logo({ variant = "default", className, alt = "DigiTuuls" }: LogoProps) {
  const sizeByVariant: Record<LogoVariant, string> = {
    default: "h-10 sm:h-12",
    header: "h-10 sm:h-11",
    drawer: "h-11",
    hero: "h-16 sm:h-20 md:h-24",
    auth: "h-24 sm:h-28",
  };

  return <img src={logo} alt={alt} className={cn("w-auto", sizeByVariant[variant], className)} />;
}
