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
            En los portales de anuncios la información suele estar del lado de quien alquila. Rentaly es el cuaderno de
            quien vive el contrato: Catastro, barrio y memoria vecinal.
          </p>
          <p>Puedes leer el mapa sin cuenta. Para publicar, sí: así podemos pedir pruebas si un relato no encaja.</p>
        </>
      }
    >
      <p className="kicker">Ya tengo cuenta</p>
      <h2 className="mt-2 font-display text-3xl">Entrar</h2>
      <p className="mt-2 mb-6 text-sm text-ink/65">Madrid capital. Sin anuncios, sin comisiones.</p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
