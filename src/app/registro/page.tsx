import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { SignupForm } from "@/components/SignupForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Crear cuenta" };
export const dynamic = "force-dynamic";

export default async function RegistroPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.onboardingComplete ? "/cuenta" : "/onboarding");

  return (
    <AuthShell
      kicker="Alta"
      title="Un apodo en público. Un correo por si hay que verificar."
      aside={
        <>
          <p>
            Reviu, en Catalunya, demostró que las reseñas de piso solo sirven si hay persona detrás y el texto sale
            anónimo. Aquí igual: firmas con apodo, no con DNI.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Sin titularidad catastral. Nunca.</li>
            <li>Sin linchamiento: hechos, fechas, qué pedían.</li>
            <li>Si hay delito, 112 y denuncia oficial además de este aviso.</li>
          </ul>
        </>
      }
    >
      <p className="kicker">Nueva cuenta</p>
      <h2 className="mt-2 font-display text-3xl">Únete a la memoria</h2>
      <p className="mt-2 mb-6 text-sm text-ink/65">Tres minutos. Luego te preguntamos en qué momento del alquiler estás.</p>
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
