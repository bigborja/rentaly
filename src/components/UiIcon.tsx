import type { LucideIcon } from "lucide-react";

const sizes = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function UiIcon({
  icon: Icon,
  size = "md",
  className = "",
}: {
  icon: LucideIcon;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return <Icon strokeWidth={1.5} absoluteStrokeWidth className={`${sizes[size]} shrink-0 ${className}`} aria-hidden />;
}
