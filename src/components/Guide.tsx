export function Guide({
  kicker = "Cómo funciona esto",
  title,
  children,
}: {
  kicker?: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="rounded-3xl border border-ink/10 bg-mist/55 px-5 py-5">
      <p className="text-xs uppercase tracking-[0.16em] text-wine">{kicker}</p>
      {title ? <h2 className="mt-1 font-display text-2xl leading-tight">{title}</h2> : null}
      <div className={`space-y-3 text-sm leading-6 text-ink/75 ${title ? "mt-3" : "mt-2"}`}>{children}</div>
    </aside>
  );
}

export function Steps({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, index) => (
        <li key={item.title} className="flex gap-3">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-medium text-paper">
            {index + 1}
          </span>
          <span>
            <span className="block font-medium text-ink">{item.title}</span>
            <span className="mt-0.5 block text-sm leading-6 text-ink/70">{item.body}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function Glossary({ terms }: { terms: { term: string; meaning: string }[] }) {
  return (
    <dl className="space-y-4">
      {terms.map((item) => (
        <div key={item.term}>
          <dt className="font-display text-xl">{item.term}</dt>
          <dd className="mt-1 text-sm leading-6 text-ink/75">{item.meaning}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Callout({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl bg-white/70 px-4 py-3 text-sm leading-6 text-ink/75">{children}</p>;
}
