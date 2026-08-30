'use client';

const KEY_INTERNAL_NAV = 'hitsuji.visit.internal-nav';
const INTERNAL_NAV_TTL = 2500;

interface InternalNavPayload {
  at: number;
  href: string;
}

function safeReadSession<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteSession(key: string, val: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

function safeRemoveSession(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(key);
  } catch {}
}

export function markInternalNavigation(href: string): void {
  if (typeof window === 'undefined') return;
  safeWriteSession(KEY_INTERNAL_NAV, {
    at: Date.now(),
    href,
  } satisfies InternalNavPayload);
}

export function consumeInternalNavigation(currentHref: string): boolean {
  if (typeof window === 'undefined') return false;
  const payload = safeReadSession<InternalNavPayload | null>(KEY_INTERNAL_NAV, null);
  if (!payload) return false;
  safeRemoveSession(KEY_INTERNAL_NAV);
  if (payload.href !== currentHref) return false;
  return Date.now() - payload.at <= INTERNAL_NAV_TTL;
}
