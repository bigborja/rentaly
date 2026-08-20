import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { LogoutButton } from "./LogoutButton";
import { getCurrentUser } from "@/lib/auth";

const links = [
  { href: "/checklist", label: "Antes de firmar" },
  { href: "/barrios", label: "Barrios" },
  { href: "/aportar", label: "Aportar" },
  { href: "/derechos", label: "Derechos" },
];

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur">
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
              className="rounded-full px-3 py-1.5 text-ink/80 transition hover:bg-ink hover:text-paper"
            >
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
            <Link href="/entrar" className="rounded-full bg-wine px-3 py-1.5 text-paper">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
