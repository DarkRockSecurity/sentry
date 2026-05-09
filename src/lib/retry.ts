// Generic retry-with-backoff wrapper. Intended for transient external
// failures (Supabase rate limits, SMTP throttles, transient 5xx).

interface RetryOptions {
  attempts?: number;       // default: 3
  baseMs?: number;         // default: 250
  factor?: number;         // exponential multiplier — default: 2
  maxMs?: number;          // cap — default: 5000
  retryOn?: (err: unknown) => boolean;
}

const DEFAULT_RETRY_ON = (err: unknown) => {
  // Supabase auth errors typically expose `status`; some transient ones use 429/503.
  const code = (err as { status?: number; statusCode?: number; message?: string })?.status
    ?? (err as { statusCode?: number }).statusCode
    ?? 0;
  if (code === 429 || code === 503 || code === 502 || code === 504) return true;
  const msg = ((err as { message?: string })?.message ?? "").toLowerCase();
  if (msg.includes("rate limit") || msg.includes("timeout") || msg.includes("temporarily")) return true;
  return false;
};

export async function retry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const { attempts = 3, baseMs = 250, factor = 2, maxMs = 5000, retryOn = DEFAULT_RETRY_ON } = opts;
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      if (i === attempts - 1) break;
      if (!retryOn(err)) throw err;
      const delay = Math.min(maxMs, baseMs * Math.pow(factor, i));
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw last;
}
