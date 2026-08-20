export class UpstreamError extends Error {
  readonly source: string;
  readonly status?: number;

  constructor(source: string, message: string, status?: number) {
    super(message);
    this.name = "UpstreamError";
    this.source = source;
    this.status = status;
  }
}

export async function getJson<T>(
  url: string,
  source: string,
  init?: RequestInit & { next?: { revalidate?: number } },
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        "User-Agent": "Rentaly/0.1 (tenant-transparency; https://github.com/bigborja/rentaly)",
        ...init?.headers,
      },
    });
  } catch {
    throw new UpstreamError(source, `No se ha podido contactar con ${source}.`);
  }
  if (!response.ok) {
    throw new UpstreamError(source, `${source} respondió HTTP ${response.status}`, response.status);
  }
  try {
    return (await response.json()) as T;
  } catch {
    throw new UpstreamError(source, `${source} no ha devuelto JSON válido.`, response.status);
  }
}

export async function getText(
  url: string,
  source: string,
  init?: RequestInit & { next?: { revalidate?: number } },
): Promise<string> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: "text/csv, text/plain, application/json;q=0.8, */*;q=0.1",
        "User-Agent": "Rentaly/0.1 (tenant-transparency; https://github.com/bigborja/rentaly)",
        ...init?.headers,
      },
    });
  } catch {
    throw new UpstreamError(source, `No se ha podido contactar con ${source}.`);
  }
  if (!response.ok) {
    throw new UpstreamError(source, `${source} respondió HTTP ${response.status}`, response.status);
  }
  return response.text();
}
