"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/cuenta";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "No se ha podido entrar.");
      setLoading(false);
      return;
    }
    const destination = data.user?.onboardingComplete ? next : "/onboarding";
    router.push(destination);
    router.refresh();
  }

  async function demoLogin() {
    setLoading(true);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "inquilina@rentaly.madrid", password: "madrid131" }),
    });
    if (!response.ok) {
      setError("No se ha podido abrir la cuenta de ejemplo.");
      setLoading(false);
      return;
    }
    router.push("/cuenta");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block text-ink/70">Correo</span>
        <input name="email" type="email" required className="field-input" placeholder="tu@correo.com" autoComplete="email" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-ink/70">Contraseña</span>
        <input name="password" type="password" required className="field-input" autoComplete="current-password" />
      </label>
      {error ? <p className="text-sm text-wine">{error}</p> : null}
      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? "Entrando…" : "Entrar"}
      </button>
      <button type="button" onClick={demoLogin} className="btn btn-ghost w-full" disabled={loading}>
        Probar con la cuenta de ejemplo
      </button>
      <p className="text-sm text-ink/60">
        ¿Primera vez?{" "}
        <Link className="underline decoration-gold" href={`/registro${next ? `?next=${encodeURIComponent(next)}` : ""}`}>
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}
