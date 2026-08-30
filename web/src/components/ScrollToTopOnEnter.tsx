'use client';

import { useEffect } from 'react';

export default function ScrollToTopOnEnter() {
  useEffect(() => {
    const expand = new URLSearchParams(window.location.search).get('expand');
    if (expand) return;
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, []);

  return null;
}
