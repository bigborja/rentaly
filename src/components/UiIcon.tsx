import type { Icon, IconWeight } from "@phosphor-icons/react";

const sizes = {
  sm: 14,
  md: 16,
  lg: 20,
} as const;

export function UiIcon({
  icon: Icon,
  size = "md",
  className = "",
  weight = "duotone",
}: {
  icon: Icon;
  size?: keyof typeof sizes;
  className?: string;
  weight?: IconWeight;
}) {
  return <Icon size={sizes[size]} weight={weight} className={`shrink-0 ${className}`} aria-hidden />;
}

export type { Icon };
