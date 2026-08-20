import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ipnqyejdfcwcltutrrvh.supabase.co";

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function prisma(): PrismaClient | null {
  if (!hasDatabase()) return null;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}
