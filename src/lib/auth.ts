import { randomBytes, randomUUID } from "crypto";
import { cookies } from "next/headers";
import type { Intent } from "./types";
import { getBarrio } from "./barrios-data";
import { readJsonFile, writeJsonFile } from "./fs-store";
import { hashPassword, verifyPassword } from "./auth-crypto";
import { prisma } from "./db";
import { ensureDatabase } from "./ensure-db";

export { hashPassword, verifyPassword } from "./auth-crypto";

const USERS_FILE = "users.json";
const SESSIONS_FILE = "sessions.json";
export const SESSION_COOKIE = "rentaly_session";

export interface UserRecord {
  id: string;
  email: string;
  nickname: string;
  passwordHash: string;
  createdAt: string;
  onboardingComplete: boolean;
  intent?: Intent;
  barrioId?: string;
}

export type PublicUser = Omit<UserRecord, "passwordHash">;

interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
}

let writeQueue: Promise<void> = Promise.resolve();

function toPublic(user: UserRecord): PublicUser {
  const { passwordHash, ...rest } = user;
  void passwordHash;
  return rest;
}

function fromRow(row: {
  id: string;
  email: string;
  nickname: string;
  passwordHash: string;
  createdAt: Date;
  onboardingComplete: boolean;
  intent: string | null;
  barrioId: string | null;
}): UserRecord {
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt.toISOString(),
    onboardingComplete: row.onboardingComplete,
    intent: (row.intent as Intent | null) || undefined,
    barrioId: row.barrioId || undefined,
  };
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  return readJsonFile(file, fallback);
}

async function writeJson(file: string, value: unknown) {
  await writeJsonFile(file, value);
}

async function ensureDemoUser(users: UserRecord[]): Promise<UserRecord[]> {
  if (users.some((user) => user.email === "inquilina@rentaly.madrid")) return users;
  users.push({
    id: "demo-inquilina",
    email: "inquilina@rentaly.madrid",
    nickname: "Inquilina 015",
    passwordHash: await hashPassword("madrid131"),
    createdAt: "2026-01-10T10:00:00.000Z",
    onboardingComplete: true,
    intent: "buscar",
    barrioId: "015",
  });
  await writeJson(USERS_FILE, users);
  return users;
}

export async function listUsers(): Promise<UserRecord[]> {
  const db = prisma();
  if (db) {
    await ensureDatabase();
    const rows = await db.user.findMany();
    return rows.map(fromRow);
  }
  return ensureDemoUser(await readJson<UserRecord[]>(USERS_FILE, []));
}

export async function createUser(input: { email: string; password: string; nickname: string }): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase();
  const nickname = input.nickname.trim();
  const password = input.password;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("El correo no parece válido.");
  if (password.length < 8) throw new Error("La contraseña necesita al menos 8 caracteres.");
  if (nickname.length < 2 || nickname.length > 40) throw new Error("El apodo debe tener entre 2 y 40 caracteres.");

  return enqueue(async () => {
    const db = prisma();
    if (db) {
      await ensureDatabase();
      const existing = await db.user.findUnique({ where: { email } });
      if (existing) throw new Error("Ya hay una cuenta con ese correo.");
      const user = await db.user.create({
        data: {
          id: randomUUID(),
          email,
          nickname,
          passwordHash: await hashPassword(password),
          createdAt: new Date(),
          onboardingComplete: false,
        },
      });
      return toPublic(fromRow(user));
    }
    const users = await listUsers();
    if (users.some((user) => user.email === email)) {
      throw new Error("Ya hay una cuenta con ese correo.");
    }
    const user: UserRecord = {
      id: randomUUID(),
      email,
      nickname,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
      onboardingComplete: false,
    };
    users.push(user);
    await writeJson(USERS_FILE, users);
    return toPublic(user);
  });
}

export async function authenticate(email: string, password: string): Promise<PublicUser> {
  const users = await listUsers();
  const user = users.find((item) => item.email === email.trim().toLowerCase());
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new Error("Correo o contraseña no coinciden.");
  }
  return toPublic(user);
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  return enqueue(async () => {
    const db = prisma();
    if (db) {
      await ensureDatabase();
      await db.session.create({ data: { token, userId, createdAt: new Date() } });
      return token;
    }
    const sessions = await readJson<SessionRecord[]>(SESSIONS_FILE, []);
    sessions.push({ token, userId, createdAt: new Date().toISOString() });
    await writeJson(SESSIONS_FILE, sessions);
    return token;
  });
}

export async function destroySession(token: string | undefined) {
  if (!token) return;
  await enqueue(async () => {
    const db = prisma();
    if (db) {
      await db.session.deleteMany({ where: { token } });
      return;
    }
    const sessions = await readJson<SessionRecord[]>(SESSIONS_FILE, []);
    await writeJson(
      SESSIONS_FILE,
      sessions.filter((session) => session.token !== token),
    );
  });
}

export async function userFromToken(token: string | undefined): Promise<PublicUser | null> {
  if (!token) return null;
  const db = prisma();
  if (db) {
    await ensureDatabase();
    const session = await db.session.findUnique({ where: { token }, include: { user: true } });
    return session?.user ? toPublic(fromRow(session.user)) : null;
  }
  const sessions = await readJson<SessionRecord[]>(SESSIONS_FILE, []);
  const session = sessions.find((item) => item.token === token);
  if (!session) return null;
  const users = await listUsers();
  const user = users.find((item) => item.id === session.userId);
  return user ? toPublic(user) : null;
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const jar = await cookies();
  return userFromToken(jar.get(SESSION_COOKIE)?.value);
}

export async function updateUser(
  userId: string,
  patch: { nickname?: string; intent?: Intent; barrioId?: string; onboardingComplete?: boolean },
): Promise<PublicUser> {
  if (patch.barrioId && !getBarrio(patch.barrioId)) {
    throw new Error("Ese barrio no está en Madrid capital.");
  }
  if (patch.intent && !["buscar", "alquilar", "avisar"].includes(patch.intent)) {
    throw new Error("Elige un momento del alquiler.");
  }
  return enqueue(async () => {
    const db = prisma();
    if (db) {
      await ensureDatabase();
      const current = await db.user.findUnique({ where: { id: userId } });
      if (!current) throw new Error("No encontramos esa cuenta.");
      const updated = await db.user.update({
        where: { id: userId },
        data: {
          intent: patch.intent ?? current.intent,
          barrioId: patch.barrioId ?? current.barrioId,
          onboardingComplete: patch.onboardingComplete ?? current.onboardingComplete,
          nickname: patch.nickname?.trim() ? patch.nickname.trim().slice(0, 40) : current.nickname,
        },
      });
      return toPublic(fromRow(updated));
    }
    const users = await listUsers();
    const index = users.findIndex((user) => user.id === userId);
    if (index < 0) throw new Error("No encontramos esa cuenta.");
    const current = users[index];
    const next: UserRecord = {
      ...current,
      intent: patch.intent ?? current.intent,
      barrioId: patch.barrioId ?? current.barrioId,
      onboardingComplete: patch.onboardingComplete ?? current.onboardingComplete,
      nickname: patch.nickname?.trim() ? patch.nickname.trim().slice(0, 40) : current.nickname,
    };
    users[index] = next;
    await writeJson(USERS_FILE, users);
    return toPublic(next);
  });
}

function enqueue<T>(work: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(work, work);
  writeQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
