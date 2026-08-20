import Link from "next/link";
import { BrandMark } from "./BrandMark";

export function AuthShell({
  kicker,
  title,
  children,
  aside,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
  aside: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-6xl items-stretch gap-8 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="card flex flex-col justify-between bg-ink p-8 text-paper lg:min-h-[560px]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-gold">
            <BrandMark className="h-7 w-7" />
            <span className="font-display text-xl">Rentaly</span>
          </Link>
          <p className="mt-8 text-xs uppercase tracking-[0.18em] text-gold/80">{kicker}</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{title}</h1>
          <div className="mt-6 space-y-3 text-sm leading-6 text-paper/75">{aside}</div>
        </div>
        <p className="mt-10 text-xs text-paper/50">
          El email no se publica. En la memoria vecinal solo aparece tu apodo.
        </p>
      </aside>
      <div className="card p-6 sm:p-8">{children}</div>
    </div>
  );
}
