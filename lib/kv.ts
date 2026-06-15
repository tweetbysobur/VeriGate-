/**
 * Tiny dependency-free KV client over the Upstash/Vercel-KV REST API.
 * Enabled automatically when the env vars are present (add a KV store in Vercel
 * → it injects KV_REST_API_URL / KV_REST_API_TOKEN). Until then, callers fall
 * back to in-process memory — so nothing breaks before provisioning.
 *
 * Server-only.
 */
import "server-only";

const URL_ =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

export const kvEnabled = Boolean(URL_ && TOKEN);

async function cmd(args: string[]): Promise<unknown> {
  const res = await fetch(URL_, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV ${res.status}`);
  const json = (await res.json()) as { result?: unknown };
  return json.result;
}

export async function kvGetJson<T>(key: string): Promise<T | null> {
  const v = (await cmd(["GET", key])) as string | null;
  if (v == null) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

export async function kvSetJson(key: string, value: unknown): Promise<void> {
  await cmd(["SET", key, JSON.stringify(value)]);
}
