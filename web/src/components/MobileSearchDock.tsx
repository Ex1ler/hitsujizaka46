'use client';

import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import SearchBar from './SearchBar';
import './MobileSearchDock.css';

export default function MobileSearchDock() {
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    function syncTopbarH() {
      const el = document.getElementById('topbar');
      if (!el) return;
      const h = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--topbar-h', h + 'px');
    }
    syncTopbarH();
    window.addEventListener('resize', syncTopbarH);
    return () => window.removeEventListener('resize', syncTopbarH);
  }, []);

  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const root = document.querySelector('.msearch');
      if (root && root.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  const icon = useMemo(
    () => (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <line
          x1="15.5"
          y1="15.5"
          x2="20"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
    []
  );

  return (
    <div className={'msearch ' + (open ? 'is-open' : '')} aria-label="搜索">
      <button
        type="button"
        className="msearch-btn"
        aria-label={open ? '收起搜索' : '展开搜索'}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        {icon}
      </button>
      <div className="msearch-panel" aria-hidden={!open}>
        <SearchBar />
      </div>
    </div>
  );
}
