"use client";

import { useEffect, useState } from "react";

export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 border-b border-ink/10 backdrop-blur transition-shadow ${
        scrolled ? "bg-paper/97 shadow-float" : "bg-paper/82"
      }`}
    >
      <div className="folio-rule" />
      {children}
    </header>
  );
}
