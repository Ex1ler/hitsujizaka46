'use client';

import { useEffect, useState } from 'react';
import './VisitCounter.css';

const LEGACY_KEYS = [
  'hitsuji.visit.v2.count',
  'hitsuji.visit.v2.last',
  'hitsuji.visit.v3.count',
  'hitsuji.visit.v3.session-entered',
  'hitsuji.visit.v4.count',
  'hitsuji.visit.v4.session-entered',
  'hitsuji.visit.v6.count',
  'hitsuji.visit.internal-nav',
];

function safeRemove(storage: Storage, key: string): void {
  try { storage.removeItem(key); } catch {}
}

export default function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    LEGACY_KEYS.forEach(key => safeRemove(localStorage, key));
    LEGACY_KEYS.forEach(key => safeRemove(sessionStorage, key));

    let cancelled = false;

    async function loadVisitCount() {
      try {
        const response = await fetch('/api/visit', {
          method: 'POST',
          credentials: 'same-origin',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error(`Visit API ${response.status}`);
        const data = (await response.json()) as { count?: number };
        if (!cancelled) {
          setCount(typeof data.count === 'number' ? data.count : 0);
        }
      } catch {
        if (!cancelled) setCount(0);
      }
    }

    void loadVisitCount();

    return () => {
      cancelled = true;
    };
  }, []);

  const countText = count == null ? '...' : count.toLocaleString();
  const ariaLabel = count == null ? '累计访问次数加载中' : `累计访问 ${count.toLocaleString()} 次`;

  return (
    <span className="visit-counter" title="本站累计访问次数" aria-label={ariaLabel}>
      <span className="vc-dot" aria-hidden="true" />
      <span className="vc-label">累计访问</span>
      <span className="vc-num">{countText}</span>
      <span className="vc-unit">次</span>
    </span>
  );
}
