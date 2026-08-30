'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import data from '@/lib/data';
import './Setlist.css';

export default function Setlist() {
  const { graduation } = data;
  const [lightboxOpen, setLightboxOpen] = useState(false);

  function openTrack(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function shouldIgnoreRowClick(target: EventTarget | null) {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest('a'));
  }

  const lightbox = lightboxOpen ? (
    <div
      className="lightbox"
      onClick={() => setLightboxOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="公演合影大图"
    >
      <div className="lightbox-center" onClick={e => e.stopPropagation()}>
        <img
          src="/graduation-stage.jpg"
          alt="王晓阳毕业公演 · 制服与太阳 20260816"
          className="lightbox-img"
        />
      </div>
      <button
        type="button"
        className="lightbox-close"
        onClick={e => {
          e.stopPropagation();
          setLightboxOpen(false);
        }}
        aria-label="关闭"
      >
        ×
      </button>
    </div>
  ) : null;

  // ESC 键关闭 lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightboxOpen(false);
    }
    window.addEventListener('keydown', onKey);
    document.body.classList.add('is-lightbox-open');
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-lightbox-open');
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  return (
    <section
      className="setlist snap-section is-auto"
      id="setlist"
      data-fx-section
      data-fx-id="setlist"
    >
      <div className="setlist-wrap">
        <header className="sec-head reveal" style={{ ['--fx-delay' as any]: '80ms' }}>
          <div className="sec-text">
            <h2 className="sec-zh">制服与太阳</h2>
          </div>
        </header>

        {/* 公演合影 · 点击放大 */}
        <figure
          className="setlist-hero reveal"
          style={{ ['--fx-delay' as any]: '180ms' }}
          onClick={() => setLightboxOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setLightboxOpen(true);
            }
          }}
          aria-label="点击查看大图"
        >
          <img
            src="/graduation-stage.jpg"
            alt="王晓阳毕业公演 · 制服与太阳 20260816"
            className="setlist-hero-img"
            loading="lazy"
          />
          <span className="setlist-hero-zoom" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <line x1="15.5" y1="15.5" x2="20" y2="20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="11" y1="8" x2="11" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
        </figure>

        <div className="setlist-body">
          <ol className="track">
            {graduation.songs.map((s, i) => (
              <li
                className="track-item reveal fx-rise"
                key={s.bvid}
                style={{ ['--fx-delay' as any]: (300 + Math.min(i, 22) * 55) + 'ms' }}
                data-song-name={s.name}
                role="link"
                tabIndex={0}
                aria-label={`播放「${s.name}」`}
                onClick={e => {
                  if (shouldIgnoreRowClick(e.target)) return;
                  if (window.getSelection()?.toString()) return;
                  openTrack(s.url);
                }}
                onKeyDown={e => {
                  if (e.target !== e.currentTarget) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openTrack(s.url);
                  }
                }}
              >
                <span className="track-no">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="track-nm">「{s.name}」</span>
                <a
                  className="track-lk"
                  href={s.url}
                  target="_blank"
                  rel="noopener"
                  aria-label={`${s.name} 观看链接`}
                  onClick={e => e.stopPropagation()}
                >
                  <span>观看</span>
                  <span className="arrow">→</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {lightboxOpen && typeof document !== 'undefined' ? createPortal(lightbox, document.body) : null}
    </section>
  );
}
