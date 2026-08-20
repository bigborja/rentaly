import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";
import { ConcurrencyLimiter } from "./limiter";

const WINDOW = 40;
const SECONDS = 10;
const processLimiter = new ConcurrencyLimiter(3);

let globalLimit: Ratelimit | null | undefined;

function redisGlobal(): Ratelimit | null {
  if (globalLimit !== undefined) return globalLimit;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    globalLimit = null;
    return null;
  }
  globalLimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(WINDOW, `${SECONDS} s`),
    prefix: "rentaly:ovc-global",
    ephemeralCache: new Map(),
    analytics: false,
    timeout: 800,
  });
  return globalLimit;
}

/** Caps Catastro OVC across all users on this deployment. Cache hits must skip this. */
export async function withOvcBudget<T>(work: () => Promise<T>): Promise<T> {
  const remote = redisGlobal();
  if (remote) {
    try {
      const result = await remote.limit("all");
      if (!result.success) {
        throw new Error("El Catastro está muy consultado ahora mismo. Prueba en un minuto.");
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("Catastro está muy consultado")) throw error;
      // Redis down → still cap this isolate.
    }
  }
  return processLimiter.run(work);
}
