"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/onboarding";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        nickname: form.get("nickname"),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "No se ha podido crear la cuenta.");
      setLoading(false);
      return;
    }
    router.push(`/onboarding${next && next !== "/onboarding" ? `?next=${encodeURIComponent(next)}` : ""}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block text-ink/70">Apodo público</span>
        <input name="nickname" required minLength={2} maxLength={40} className="field-input" placeholder="Anónimo del barrio" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-ink/70">Correo</span>
        <input name="email" type="email" required className="field-input" autoComplete="email" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-ink/70">Contraseña</span>
        <input name="password" type="password" required minLength={8} className="field-input" autoComplete="new-password" />
      </label>
      <p className="text-xs leading-5 text-ink/55">
        El correo sirve para verificar un relato si hace falta, como en Reviu. Nunca se muestra junto al aviso.
      </p>
      {error ? <p className="text-sm text-wine">{error}</p> : null}
      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? "Creando…" : "Crear cuenta y continuar"}
      </button>
      <p className="text-sm text-ink/60">
        ¿Ya tienes cuenta?{" "}
        <Link className="underline decoration-gold" href="/entrar">
          Entrar
        </Link>
      </p>
    </form>
  );
}
