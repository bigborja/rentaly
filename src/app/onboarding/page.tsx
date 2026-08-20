import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { OnboardingWizard } from "@/components/OnboardingWizard";

export const metadata: Metadata = { title: "Empezar" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/registro?next=/onboarding");

  return (
    <Suspense>
      <OnboardingWizard nickname={user.nickname} barrioId={user.barrioId} />
    </Suspense>
  );
}
