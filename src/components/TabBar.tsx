"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MagnifyingGlassIcon,
  MapTrifoldIcon,
  PencilSimpleIcon,
  UserIcon,
} from "@phosphor-icons/react/ssr";
import { UiIcon } from "./UiIcon";

const tabs = [
  { href: "/", label: "Buscar", icon: MagnifyingGlassIcon, match: (path: string) => path === "/" },
  {
    href: "/barrios",
    label: "Mapa",
    icon: MapTrifoldIcon,
    match: (path: string) => path.startsWith("/barrios") || path.startsWith("/inmueble"),
  },
  {
    href: "/aportar",
    label: "Aportar",
    icon: PencilSimpleIcon,
    match: (path: string) => path.startsWith("/aportar"),
  },
  {
    href: "/cuenta",
    label: "Cuenta",
    icon: UserIcon,
    match: (path: string) =>
      path.startsWith("/cuenta") || path.startsWith("/entrar") || path.startsWith("/registro") || path.startsWith("/onboarding"),
  },
];

export function TabBar() {
  const path = usePathname() || "/";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/95 pb-[env(safe-area-inset-bottom)] shadow-float backdrop-blur md:hidden"
      aria-label="Principal"
    >
      <ul className="grid grid-cols-4">
        {tabs.map((tab) => {
          const active = tab.match(path);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-2.5 text-[11px] tracking-wide ${
                  active ? "text-wine" : "text-ink/55"
                }`}
              >
                <UiIcon icon={tab.icon} size="lg" weight={active ? "fill" : "duotone"} className={active ? "text-wine" : ""} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
