'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Song } from '@/lib/types';
import './SongCard.css';

interface Props {
  song: Song;
  keyId: string;
  showCount?: boolean;
  index?: number;
}

export default function SongCard({ song, keyId, showCount = false, index = 0 }: Props) {
  // 公演/特殊舞台详情页：默认收起、只显示曲名，点击展开（用户第 19 轮要求）
  const [open, setOpen] = useState(false);
  const total = song.perfs.length;
  const params = useSearchParams();

  // URL ?expand=曲名 自动展开（来自 SearchBar 跳转）
  useEffect(() => {
    const target = params?.get('expand');
    if (!target) return;
    if (target === song.name) {
      setOpen(true);
      // 延迟到 DOM 更新完成再滚到该卡片
      requestAnimationFrame(() => {
        const el = document.getElementById(keyId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el?.classList.add('is-flash');
        setTimeout(() => el?.classList.remove('is-flash'), 2400);
      });
    }
  }, [params, keyId, song.name]);

  return (
    <article
      className={`song ${open ? 'is-open' : ''}`}
      id={keyId}
      style={{ ['--fx-delay' as any]: Math.min(index, 6) * 40 + 'ms' }}
    >
      <button
        type="button"
        className="song-head"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="song-bar" aria-hidden="true" />
        <div className="song-main">
          <span className="song-nm">「{song.name}」</span>
          {showCount && (
            <span className="song-ct">
              {total} <span>次</span>
            </span>
          )}
        </div>
        <span className="song-chev" aria-hidden="true">›</span>
      </button>

      <div className="song-body">
        <div className="song-body-inner">
          <div className="perf-list">
            {song.perfs.map((p, i) => (
              <a
                className="perf-row"
                href={p.url}
                target="_blank"
                rel="noopener"
                key={p.bvid + i}
              >
                <span className="perf-no">{String(i + 1).padStart(2, '0')}</span>
                <span className="perf-dt">{p.date}</span>
                <span className="perf-ti">{p.title}</span>
                <span className="perf-lk">观看 ↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
