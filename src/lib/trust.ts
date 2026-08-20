export type Verification = "anonimo" | "cuenta" | "evidencia";
export type TrustBand = "bajo" | "medio" | "alto";

export function trustFrom(input: { userId?: string; hasEvidence?: boolean }): {
  verification: Verification;
  trustBand: TrustBand;
} {
  if (input.hasEvidence) return { verification: "evidencia", trustBand: "alto" };
  if (input.userId) return { verification: "cuenta", trustBand: "medio" };
  return { verification: "anonimo", trustBand: "bajo" };
}
