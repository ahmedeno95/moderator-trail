type RateLimitOptions = {
  intervalMs: number;
  max: number;
};

type Entry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Entry>();

function prune(now: number) {
  if (store.size < 500) return;
  for (const [k, v] of store.entries()) {
    if (v.resetAt <= now) store.delete(k);
  }
}

export function rateLimit(key: string, opts: RateLimitOptions) {
  const now = Date.now();
  prune(now);

  const existing = store.get(key);
  if (!existing || existing.resetAt <= now) {
    const entry: Entry = { count: 1, resetAt: now + opts.intervalMs };
    store.set(key, entry);
    return { ok: true, remaining: opts.max - entry.count, resetAt: entry.resetAt };
  }

  existing.count += 1;
  const ok = existing.count <= opts.max;
  const remaining = Math.max(0, opts.max - existing.count);

  return { ok, remaining, resetAt: existing.resetAt };
}
