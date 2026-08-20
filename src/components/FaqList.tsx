import Link from "next/link";
import { PLATFORM_FAQS, type FaqItem } from "@/lib/faqs";

function isInternal(href: string) {
  return href.startsWith("/");
}

export function FaqList({
  items = PLATFORM_FAQS,
  id = "preguntas",
}: {
  items?: FaqItem[];
  id?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section id={id} className="scroll-mt-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="kicker">Preguntas cortas</p>
      <h2 className="mt-2 font-display text-3xl sm:text-4xl">Lo que suele preguntarse</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">
        Misión, cómo usarlo, de dónde sale cada cifra y a quién llamar si hace falta algo más que una ficha.
      </p>
      <div className="mt-6 divide-y divide-ink/10 overflow-hidden rounded-3xl border border-ink/10 bg-white/75 shadow-rest">
        {items.map((item, index) => (
          <details key={item.question} className="group" open={index === 0}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
              <span className="font-display text-xl leading-snug text-ink">{item.question}</span>
              <span className="mt-1 shrink-0 text-sm text-ink/40 group-open:hidden" aria-hidden>
                +
              </span>
              <span className="mt-1 hidden shrink-0 text-sm text-ink/40 group-open:inline" aria-hidden>
                −
              </span>
            </summary>
            <div className="space-y-3 px-5 pb-5 text-sm leading-6 text-ink/75">
              <p>{item.answer}</p>
              {item.links?.length ? (
                <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  {item.links.map((link) =>
                    isInternal(link.href) ? (
                      <Link key={link.href} href={link.href} className="underline decoration-gold">
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        key={link.href}
                        href={link.href}
                        className="underline decoration-gold"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {link.label}
                      </a>
                    ),
                  )}
                </p>
              ) : null}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
