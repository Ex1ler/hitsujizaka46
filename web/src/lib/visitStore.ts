import { Redis } from '@upstash/redis';

export const VISIT_COUNT_KEY = 'hitsuji:stats:site-visits';
export const VISIT_SESSION_COOKIE = 'hitsuji.visit.session';

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value : undefined;
}

function resolveRedisConfig() {
  const url = env('UPSTASH_REDIS_REST_URL') ?? env('KV_REST_API_URL');
  const token = env('UPSTASH_REDIS_REST_TOKEN') ?? env('KV_REST_API_TOKEN');
  if (!url || !token) return null;
  return { url, token };
}

const redisConfig = resolveRedisConfig();

export const visitStoreConfigured = Boolean(redisConfig);

export const visitRedis = redisConfig
  ? new Redis({
      url: redisConfig.url,
      token: redisConfig.token,
    })
  : null;

export async function readVisitCount(): Promise<number> {
  if (!visitRedis) return 0;
  const value = await visitRedis.get<number | string | null>(VISIT_COUNT_KEY);
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export async function incrementVisitCount(): Promise<number> {
  if (!visitRedis) return 0;
  return visitRedis.incr(VISIT_COUNT_KEY);
}
