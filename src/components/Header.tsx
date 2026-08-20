import Link from "next/link";
import { BookOpen, ListChecks, Map, PenLine, Scale, LogIn } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { LogoutButton } from "./LogoutButton";
import { HeaderShell } from "./HeaderShell";
import { UiIcon } from "./UiIcon";
import { getCurrentUser } from "@/lib/auth";

const links = [
  { href: "/como-funciona", label: "Cómo funciona", icon: BookOpen },
  { href: "/checklist", label: "Antes de firmar", icon: ListChecks },
  { href: "/barrios", label: "Barrios", icon: Map },
  { href: "/aportar", label: "Aportar", icon: PenLine },
  { href: "/derechos", label: "Derechos", icon: Scale },
];

export async function Header() {
  const user = await getCurrentUser();

  return (
    <HeaderShell>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark />
          <span className="font-display text-2xl font-semibold tracking-tight text-wine">Rentaly</span>
          <span className="hidden text-xs uppercase tracking-[0.18em] text-ink/60 sm:inline">Madrid capital</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-ink/80 transition hover:bg-ink hover:text-paper"
            >
              <UiIcon icon={link.icon} size="sm" />
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/cuenta" className="rounded-full bg-ink px-3 py-1.5 text-paper">
                {user.nickname}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/entrar"
              className="inline-flex items-center gap-1.5 rounded-full bg-wine px-3 py-1.5 text-paper"
            >
              <UiIcon icon={LogIn} size="sm" className="text-paper" />
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </HeaderShell>
  );
}
