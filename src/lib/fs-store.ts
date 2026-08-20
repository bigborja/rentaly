import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

function dataDir() {
  if (process.env.VERCEL) return "/tmp/rentaly-data";
  return join(process.cwd(), "data");
}

export function dataPath(file: string) {
  return join(dataDir(), file);
}

export async function readJsonFile<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(dataPath(file), "utf8")) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile(file: string, value: unknown) {
  const dir = dataDir();
  await mkdir(dir, { recursive: true });
  await writeFile(dataPath(file), JSON.stringify(value, null, 2), "utf8");
}
