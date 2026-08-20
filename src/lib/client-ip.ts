/**
 * Client IP on Vercel Edge. Do not trust extra hops in X-Forwarded-For:
 * the leftmost address is the original client; later ones can be appended.
 */
export function clientIpFromRequest(input: {
  ip?: string | null;
  forwardedFor?: string | null;
}): string {
  const direct = input.ip?.trim();
  if (direct) return direct;

  const forwarded = input.forwardedFor?.split(",")[0]?.trim();
  if (forwarded) return forwarded;

  return "unknown";
}
