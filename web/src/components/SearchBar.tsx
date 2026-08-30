'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import data from '@/lib/data';
import { markInternalNavigation } from '@/lib/visitNavigation';
import {
  specialOrigins,
  ORIGIN_LABEL,
  HIDDEN_SPECIAL_SONGS,
  normalizeSongName,
} from '@/lib/specialOrigins';
import type { SpecialOrigin } from '@/lib/specialOrigins';
import './SearchBar.css';

type MatchType = 'setlist' | 'stage' | 'special';

interface SearchItem {
  songName: string;
  matchType: MatchType;
  matchKey: string;
  regionLabel: string;
  regionIndex?: number;
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[\s\u3000\.,，。、!！?？·「」『』《》()()【】\[\]]/g, '');
}

export default function SearchBar() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 索引全部曲目
  const allItems = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [];

    // 1. 毕业公演
    for (const s of data.graduation.songs) {
      items.push({
        songName: s.name,
        matchType: 'setlist',
        matchKey: s.name,
        regionLabel: '毕业公演',
      });
    }

    // 2. 公演（4 个 region）
    data.regions.forEach((r, i) => {
      if (r.kind !== 'stage') return;
      for (const s of r.songs) {
        items.push({
          songName: s.name,
          matchType: 'stage',
          matchKey: String(i),
          regionLabel: r.name,
          regionIndex: i,
        });
      }
    });

    // 3. 特殊舞台（按 origin 分组）
    const special = data.regions.find(r => r.kind === 'special');
    if (special) {
      for (const s of special.songs) {
        if (HIDDEN_SPECIAL_SONGS.has(s.name)) continue;
        const origin = (specialOrigins[s.name] ?? 'Other') as SpecialOrigin;
        items.push({
          songName: s.name,
          matchType: 'special',
          matchKey: origin,
          regionLabel: ORIGIN_LABEL[origin] ?? origin,
        });
      }
    }

    return items;
  }, []);

  // 模糊匹配 + 排序
  const results = useMemo<SearchItem[]>(() => {
    const query = q.trim();
    if (!query) return [];
    const q1 = query.toLowerCase();
    const q2 = normalize(query);

    const scored = allItems
      .map(it => {
        const name = it.songName.toLowerCase();
        const nName = normalize(it.songName);
        const nCanon = normalize(normalizeSongName(it.songName));
        let score = 0;
        if (name === q1) score = 100;
        else if (name.startsWith(q1)) score = 82;
        else if (name.includes(q1)) score = 64;
        else if (nName.includes(q2)) score = 48;
        else if (nCanon.includes(q2)) score = 40;
        return { it, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score);

    // 去重（同名按第一个）
    const seen = new Set<string>();
    const out: SearchItem[] = [];
    for (const { it } of scored) {
      if (out.length >= 8) break;
      const key = it.matchType + ':' + it.songName;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(it);
    }
    return out;
  }, [q, allItems]);

  function jumpTo(it: SearchItem) {
    if (it.matchType === 'setlist') {
      const el = document.getElementById('setlist');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        const item = document.querySelector(
          `[data-song-name="${CSS.escape(it.songName)}"]`
        );
        if (item) {
          item.classList.add('is-flash');
          item.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => item.classList.remove('is-flash'), 2400);
        }
      }, 650);
    } else if (it.matchType === 'stage') {
      const href = `${window.location.origin}/stage/${it.matchKey}/?expand=${encodeURIComponent(it.songName)}`;
      markInternalNavigation(href);
      router.push(`/stage/${it.matchKey}/?expand=${encodeURIComponent(it.songName)}`);
    } else {
      const href = `${window.location.origin}/special/${it.matchKey}/?expand=${encodeURIComponent(it.songName)}`;
      markInternalNavigation(href);
      router.push(`/special/${it.matchKey}/?expand=${encodeURIComponent(it.songName)}`);
    }
    setOpen(false);
    setQ('');
    inputRef.current?.blur();
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHi(h => Math.min(h + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHi(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      if (results.length > 0) {
        e.preventDefault();
        jumpTo(results[Math.min(hi, results.length - 1)]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQ('');
      inputRef.current?.blur();
    }
  }

  // 全局快捷键：/ 聚焦搜索
  useEffect(() => {
    function onGlobalKey(e: KeyboardEvent) {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      const isInput =
        tag === 'INPUT' || tag === 'TEXTAREA' || (document.activeElement as HTMLElement)?.isContentEditable;
      if (e.key === '/' && !isInput) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener('keydown', onGlobalKey);
    return () => window.removeEventListener('keydown', onGlobalKey);
  }, []);

  // 点击外部关闭
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // 高亮匹配片段
  function highlight(name: string) {
    const q1 = q.trim();
    if (!q1) return name;
    const i = name.toLowerCase().indexOf(q1.toLowerCase());
    if (i < 0) return name;
    return (
      <>
        {name.slice(0, i)}
        <mark className="searchbar-mark">{name.slice(i, i + q1.length)}</mark>
        {name.slice(i + q1.length)}
      </>
    );
  }

  const showPop = open && q.trim().length > 0;
  const noResult = showPop && results.length === 0;

  return (
    <div
      className={'searchbar ' + (open ? 'is-open ' : '') + (q ? 'has-q' : '')}
      ref={wrapRef}
    >
      <div className="searchbar-field">
        <svg className="searchbar-ic" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
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
        <input
          ref={inputRef}
          type="text"
          className="searchbar-input"
          placeholder="搜索"
          value={q}
          onChange={e => {
            setQ(e.target.value);
            setOpen(true);
            setHi(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          aria-label="搜索"
          autoComplete="off"
          spellCheck={false}
        />
        {q && (
          <button
            type="button"
            className="searchbar-clear"
            onClick={() => {
              setQ('');
              inputRef.current?.focus();
            }}
            aria-label="清空"
          >
            ×
          </button>
        )}
      </div>
      {showPop && (
        <div className="searchbar-pop" role="listbox">
          {noResult ? (
            <div className="searchbar-empty">
              <span className="searchbar-empty-zh">未找到「{q}」对应的曲目</span>
              <small>试试更短的关键词，或检查拼写</small>
            </div>
          ) : (
            <ul className="searchbar-list">
              {results.map((it, i) => (
                <li
                  key={it.matchType + ':' + it.songName + ':' + i}
                  className={'searchbar-item ' + (i === hi ? 'is-hi' : '')}
                  onMouseEnter={() => setHi(i)}
                  onMouseDown={e => {
                    e.preventDefault();
                    jumpTo(it);
                  }}
                  role="option"
                  aria-selected={i === hi}
                >
                  <span className="searchbar-item-name">{highlight(it.songName)}</span>
                  <span className={'searchbar-item-tag is-' + it.matchType}>
                    {it.regionLabel}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="searchbar-foot">
            <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
            <span><kbd>↵</kbd> 跳转</span>
            <span><kbd>Esc</kbd> 关闭</span>
          </div>
        </div>
      )}
    </div>
  );
}
