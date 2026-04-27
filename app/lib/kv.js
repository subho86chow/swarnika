import { createClient } from "@vercel/kv";

let kv;
let kvEnabled = false;

try {
  const kvUrl = process.env.SWARNIKA_KV_KV_REST_API_URL || process.env.SWARNIKA_KV_KV_URL;
  const kvToken = process.env.SWARNIKA_KV_KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    kv = createClient({
      url: kvUrl,
      token: kvToken,
    });
    kvEnabled = true;
  }
} catch (e) {
  console.warn("[KV] Failed to initialize Vercel KV:", e.message);
}

export function isKvEnabled() {
  return kvEnabled;
}

/** Get raw string value */
export async function kvGet(key) {
  if (!kvEnabled || !kv) return null;
  try {
    return await kv.get(key);
  } catch (e) {
    console.error("[KV] get error:", e.message);
    return null;
  }
}

/** Set raw string value with optional TTL (seconds) */
export async function kvSet(key, value, ttlSeconds = 300) {
  if (!kvEnabled || !kv) return false;
  try {
    await kv.set(key, value, { ex: ttlSeconds });
    return true;
  } catch (e) {
    console.error("[KV] set error:", e.message);
    return false;
  }
}

/** Delete a key */
export async function kvDel(key) {
  if (!kvEnabled || !kv) return false;
  try {
    await kv.del(key);
    return true;
  } catch (e) {
    console.error("[KV] del error:", e.message);
    return false;
  }
}

/** Delete keys by pattern (scans and deletes) */
export async function kvDelPattern(pattern) {
  if (!kvEnabled || !kv) return 0;
  try {
    const keys = [];
    let cursor = 0;
    do {
      const res = await kv.scan(cursor, { match: pattern, count: 100 });
      cursor = Number(res.cursor);
      keys.push(...res.keys);
    } while (cursor !== 0);

    if (keys.length > 0) {
      await kv.del(...keys);
    }
    return keys.length;
  } catch (e) {
    console.error("[KV] delPattern error:", e.message);
    return 0;
  }
}

/** Get parsed JSON */
export async function cacheGet(key) {
  const raw = await kvGet(key);
  if (raw === null || raw === undefined) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/** Store as JSON with TTL */
export async function cacheSet(key, value, ttlSeconds = 300) {
  return kvSet(key, JSON.stringify(value), ttlSeconds);
}

/** Wrapper: fetch from cache or execute fn and cache result */
export async function cacheOrFetch(key, fetchFn, ttlSeconds = 300) {
  const cached = await cacheGet(key);
  if (cached !== null) {
    return cached;
  }
  const data = await fetchFn();
  await cacheSet(key, data, ttlSeconds);
  return data;
}
