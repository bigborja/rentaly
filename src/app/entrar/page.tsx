import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Entrar" };
export const dynamic = "force-dynamic";

export default async function EntrarPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.onboardingComplete ? "/cuenta" : "/onboarding");

  return (
    <AuthShell
      kicker="Identidad"
      title="Entra para dejar rastro, no para que te vean."
      aside={
        <>
          <p>
            Puedes leer el mapa, las fichas del Catastro y la memoria vecinal sin cuenta. Entras para publicar: así hay
            una persona detrás del apodo y podemos pedir pruebas si un relato no encaja. El correo no se muestra junto al
            aviso.
          </p>
          <p>
            Si solo quieres probar, usa la cuenta de ejemplo del formulario. No sustituye tu propio registro si vas a
            dejar un aviso real.
          </p>
        </>
      }
    >
      <p className="kicker">Ya tengo cuenta</p>
      <h2 className="mt-2 font-display text-3xl">Entrar</h2>
      <p className="mt-2 mb-6 text-sm text-ink/65">
        Madrid capital. Sin anuncios y sin comisiones. Después de entrar, si aún no has elegido momento y barrio, te
        llevamos a esos cuatro pasos.
      </p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
