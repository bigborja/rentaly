import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { clientIpFromRequest } from "@/lib/client-ip";

const WINDOW_REQUESTS = 15;
const WINDOW_SECONDS = 10;

type RequestWithOptionalIp = NextRequest & { ip?: string | null };

let limiter: Ratelimit | null | undefined;

function getLimiter(): Ratelimit | null {
  if (limiter !== undefined) return limiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  // No credentials → fail-open (local `next dev` and preview without Upstash).
  if (!url || !token) {
    limiter = null;
    return null;
  }

  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(WINDOW_REQUESTS, `${WINDOW_SECONDS} s`),
    prefix: "rentaly:api",
    // Hot isolates can reject repeat offenders without another Redis round-trip.
    ephemeralCache: new Map(),
    analytics: false,
    // If Redis is slow, let the request through instead of stalling the app.
    timeout: 1000,
  });
  return limiter;
}

function isPrefetch(request: NextRequest): boolean {
  return (
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("x-middleware-prefetch") === "1"
  );
}

function tooManyRequests(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      error: "Demasiadas peticiones",
      message:
        "Has superado el límite de consultas a la API. Espera unos segundos antes de repetir para no saturar el Catastro ni las APIs oficiales.",
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }
  if (isPrefetch(request) || request.method === "OPTIONS") {
    return NextResponse.next();
  }

  const ratelimit = getLimiter();
  if (!ratelimit) return NextResponse.next();

  const ip = clientIpFromRequest({
    ip: (request as RequestWithOptionalIp).ip,
    forwardedFor: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip"),
  });

  try {
    const result = await ratelimit.limit(ip);
    event.waitUntil(result.pending);
    if (result.success) return NextResponse.next();

    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    return tooManyRequests(retryAfter);
  } catch {
    // Redis / network failure must not take the API down (fail-open).
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    {
      // Only /api/*. Static assets, images and favicon never enter this matcher.
      source: "/api/:path*",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
