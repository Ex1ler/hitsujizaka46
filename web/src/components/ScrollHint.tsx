'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import './ScrollHint.css';

export default function ScrollHint() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [visible, setVisible] = useState(false);
  const dismissedRef = useRef(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleClick() {
    dismissedRef.current = true;
    setVisible(false);
    const sections = Array.from(document.querySelectorAll('.snap-section'));
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const next = sections.find((el) => {
      const top = el.getBoundingClientRect().top + scrollY;
      return top > scrollY + vh * 0.12;
    });
    if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  useEffect(() => {
    dismissedRef.current = false;
    setVisible(false);
    if (!isHome) return;
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    showTimerRef.current = setTimeout(() => {
      if (!dismissedRef.current && window.scrollY < 24) setVisible(true);
    }, 360);

    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
    };
  }, [isHome]);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => {
      if (window.scrollY > 24) {
        dismissedRef.current = true;
        setVisible(false);
      } else if (!dismissedRef.current) {
        setVisible(true);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  if (!isHome) return null;

  return (
    <div
      className={`scroll-hint is-down ${visible ? 'is-visible' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="继续浏览"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <span className="scroll-hint-text">
        <span className="scroll-hint-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="11" height="11">
            <path
              d="M6 9 L12 15 L18 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span>继续浏览</span>
      </span>
    </div>
  );
}
