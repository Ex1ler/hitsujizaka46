'use client';
import { useEffect, useState } from 'react';
import data from '@/lib/data';
import VisitCounter from './VisitCounter';
import SearchBar from './SearchBar';
import './Topbar.css';

export default function Topbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTarget, setActiveTarget] = useState<string | null>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // scroll-spy：监听页面内锚点对应的 section，激活对应 nav-link
  useEffect(() => {
    const links = document.querySelectorAll<HTMLElement>('.nav-link[data-target]');
    if (!links.length) return;
    const targets = Array.from(links)
      .map(l => l.dataset.target)
      .filter(Boolean) as string[];
    if (!targets.length) return;

    const map: Record<string, string> = {
      setlist: '#setlist',
      stages: '#stages',
      special: '#region-special',
    };

    function onSpy() {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const probe = scrollY + vh * 0.5;

      // ① Masthead（#top）section 内：不激活任何 nav-link
      const masthead = document.querySelector('#top') as HTMLElement | null;
      if (masthead) {
        const mTop = masthead.getBoundingClientRect().top + scrollY;
        const mBottom = mTop + masthead.offsetHeight;
        if (probe >= mTop && probe < mBottom) {
          setActiveTarget(null);
          return;
        }
      }

      // ② Footer（#foot）section 内：不激活任何 nav-link
      const foot = document.querySelector('#foot') as HTMLElement | null;
      if (foot) {
        const fTop = foot.getBoundingClientRect().top + scrollY;
        if (probe >= fTop) {
          setActiveTarget(null);
          return;
        }
      }

      // ③ 取距 viewport 中心最近的 section 作为当前激活态
      let cur: string | null = null;
      let minDist = Infinity;
      for (const t of targets) {
        const el = document.querySelector(map[t]) as HTMLElement | null;
        if (!el) continue;
        const top = el.getBoundingClientRect().top + scrollY;
        const center = top + el.offsetHeight / 2;
        const dist = Math.abs(probe - center);
        if (dist < minDist) {
          minDist = dist;
          cur = t;
        }
      }
      setActiveTarget(cur);
    }
    onSpy();
    window.addEventListener('scroll', onSpy, { passive: true });
    window.addEventListener('resize', onSpy);
    return () => {
      window.removeEventListener('scroll', onSpy);
      window.removeEventListener('resize', onSpy);
    };
  }, []);

  return (
    <header className={'topbar ' + (scrolled ? 'is-scrolled' : '')} id="topbar">
      <div className="topbar-inner">
        <div className="topbar-start">
          <a className="brand" href="/">
            <img src="/logo.png" alt="" className="brand-mark" draggable={false} />
            <span className="brand-zh">咩咩坂46</span>
          </a>
          <VisitCounter />
        </div>
        <div className="topbar-center">
          <SearchBar />
        </div>
        <nav className="nav">
          <a
            className={'nav-link ' + (activeTarget === 'setlist' ? 'is-active' : '')}
            href="#setlist"
            data-target="setlist"
          >
            <span className="nav-num">01</span>
            <span className="nav-zh">制服与太阳</span>
          </a>
          <a
            className={'nav-link ' + (activeTarget === 'stages' ? 'is-active' : '')}
            href="#stages"
            data-target="stages"
          >
            <span className="nav-num">02</span>
            <span className="nav-zh">公演舞台</span>
          </a>
          <a
            className={'nav-link ' + (activeTarget === 'special' ? 'is-active' : '')}
            href="#region-special"
            data-target="special"
          >
            <span className="nav-num">03</span>
            <span className="nav-zh">特殊舞台</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
