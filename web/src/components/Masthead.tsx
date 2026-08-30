'use client';

import { useEffect, useState } from 'react';
import Logo from './Logo';
import SocialLinks from './SocialLinks';
import './Masthead.css';

export default function Masthead() {
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    const markReady = () => setFontsReady(true);

    if (typeof document !== 'undefined' && 'fonts' in document && document.fonts) {
      document.fonts.ready.then(markReady);
      // 兜底：最长等待 0.8s，动画仅做增强，不再负责让内容“出现”
      timer = window.setTimeout(markReady, 800);
    } else {
      markReady();
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return (
    <section className={`masthead snap-section ${fontsReady ? 'is-ready' : ''}`}>
      <div className="masthead-grid">
        <div className="masthead-brand">
          <Logo />
          <div className="masthead-brand-text">
            <h1 className="masthead-title">
              <span className="masthead-zh">咩咩坂</span>
              <span className="masthead-num">46</span>
            </h1>
            <p className="masthead-sub">HITSUJIZAKA46</p>
          </div>
        </div>
        {/* 社交链接 — 第一页内（Masthead 底部，不单独成页） */}
        <div className="home-social-wrap">
          <span className="home-social-en">FOLLOW · 关注</span>
          <SocialLinks />
        </div>
      </div>
    </section>
  );
}
