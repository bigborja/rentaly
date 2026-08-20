import Link from "next/link";

const links = [
  { href: "/", label: "Mapa" },
  { href: "/barrios", label: "Barrios" },
  { href: "/aportar", label: "Aportar" },
  { href: "/derechos", label: "Derechos" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-tight text-wine">Rentaly</span>
          <span className="hidden text-xs uppercase tracking-[0.18em] text-ink/60 sm:inline">Madrid capital</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-ink/80 transition hover:bg-ink hover:text-paper"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
