const DEFAULT_URL = "https://ipnqyejdfcwcltutrrvh.supabase.co";

export function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_URL;
}

export function supabaseSecret() {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function hasSupabase() {
  return Boolean(supabaseSecret());
}

/** PostgREST equality filter; values are percent-encoded so URLs and emails stay intact. */
export function sbEq(column: string, value: string) {
  return `${column}=eq.${encodeURIComponent(value)}`;
}

export function sbIn(column: string, values: string[]) {
  return `${column}=in.(${values.map((value) => encodeURIComponent(value)).join(",")})`;
}

async function request<T>(path: string, init: RequestInit & { prefer?: string } = {}): Promise<T> {
  const key = supabaseSecret();
  if (!key) throw new Error("Falta SUPABASE_SECRET_KEY.");
  const headers: Record<string, string> = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (init.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  if (init.prefer) headers.Prefer = init.prefer;
  const response = await fetch(`${supabaseUrl()}/rest/v1/${path}`, { ...init, headers });
  const text = await response.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { message: text };
    }
  }
  if (!response.ok) {
    const err = json as { message?: string; code?: string };
    throw new Error(err.message || `Supabase HTTP ${response.status}`);
  }
  return json as T;
}

export async function sbSelect<T>(table: string, query = ""): Promise<T[]> {
  const path = query ? `${table}?${query}` : table;
  const rows = await request<T[]>(path, { method: "GET" });
  return Array.isArray(rows) ? rows : [];
}

export async function sbInsert<T>(table: string, row: unknown): Promise<T[]> {
  return request<T[]>(table, {
    method: "POST",
    body: JSON.stringify(row),
    prefer: "return=representation",
  });
}

export async function sbUpsert<T>(table: string, row: unknown, onConflict: string): Promise<T[]> {
  return request<T[]>(`${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
    method: "POST",
    body: JSON.stringify(row),
    prefer: "resolution=merge-duplicates,return=representation",
  });
}

export async function sbPatch<T>(table: string, query: string, row: unknown): Promise<T[]> {
  return request<T[]>(`${table}?${query}`, {
    method: "PATCH",
    body: JSON.stringify(row),
    prefer: "return=representation",
  });
}

export async function sbDelete(table: string, query: string): Promise<void> {
  await request(`${table}?${query}`, { method: "DELETE", prefer: "return=minimal" });
}
