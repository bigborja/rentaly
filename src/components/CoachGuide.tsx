export function CoachGuide({
  title,
  kicker = "Cómo funciona esto",
  children,
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <details className="texture-calco group rounded-3xl border border-ink/10 shadow-rest open:shadow-lift">
      <summary className="cursor-pointer list-none px-5 py-4 [&::-webkit-details-marker]:hidden">
        <p className="text-xs uppercase tracking-[0.16em] text-wine">{kicker}</p>
        <p className="mt-1 flex items-center justify-between gap-3 font-display text-2xl leading-tight">
          {title}
          <span className="text-sm font-sans text-ink/45 group-open:hidden">Abrir</span>
          <span className="hidden text-sm font-sans text-ink/45 group-open:inline">Cerrar</span>
        </p>
      </summary>
      <div className="space-y-3 px-5 pb-5 text-sm leading-6 text-ink/75">{children}</div>
    </details>
  );
}
