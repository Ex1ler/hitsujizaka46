'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import data from '@/lib/data';
import type { Song } from '@/lib/types';
import {
  ORIGIN_ORDER,
  specialOrigins,
  HIDDEN_SPECIAL_SONGS,
  type SpecialOrigin,
} from '@/lib/specialOrigins';
import { mergeSpecialSongs } from '@/lib/specialSongGroups';
import './SpecialGrid.css';

interface Group {
  origin: SpecialOrigin;
  songs: Song[];
}

const ORIGIN_ART: Partial<Record<SpecialOrigin, string>> = {
  Solo: '/special-covers/solo.jpg',
  AKB48: '/special-covers/akb48.svg',
  Sakamichi: '/special-covers/sakamichi.png',
  Other: '/special-covers/others.webp',
};

function originOf(name: string): SpecialOrigin {
  return specialOrigins[name] ?? 'Other';
}

function isVisible(song: Song) {
  return !HIDDEN_SPECIAL_SONGS.has(song.name);
}

export default function SpecialGrid() {
  const special = data.regions.find(r => r.kind === 'special');

  const visibleSongs = useMemo(
    () => special?.songs.filter(isVisible) ?? [],
    [special]
  );

  const groups = useMemo<Group[]>(() => {
    if (!visibleSongs.length) return [];
    const byOrigin = new Map<SpecialOrigin, Song[]>();
    for (const s of visibleSongs) {
      const o = originOf(s.name);
      const list = byOrigin.get(o) ?? [];
      list.push(s);
      byOrigin.set(o, list);
    }
    return ORIGIN_ORDER.filter(o => byOrigin.has(o)).map(o => ({
      origin: o,
      songs: mergeSpecialSongs(o, byOrigin.get(o) ?? []),
    }));
  }, [visibleSongs]);
  const soloGroup = groups.find(g => g.origin === 'Solo');
  const rowGroups = groups
    .filter(g => g.origin !== 'Solo')
    .map(g => ({
      ...g,
      songs: g.origin === 'Sakamichi'
        ? [...g.songs.filter(s => s.name !== '坂道串烧'), ...g.songs.filter(s => s.name === '坂道串烧')]
        : g.songs,
    }));
  const soloPreview = soloGroup?.songs[0]?.name ?? '';
  const soloArt = ORIGIN_ART.Solo ?? '';

  if (!special) return null;

  return (
    <section
      className="special-section snap-section"
      id="region-special"
      data-fx-section
      data-fx-id="special"
    >
      <header className="special-head">
        <div className="special-text">
          <h2 className="special-zh reveal" style={{ ['--fx-delay' as any]: '0ms' }}>特殊舞台</h2>
          <p className="special-sub reveal" style={{ ['--fx-delay' as any]: '0ms' }}>查看分组与收录曲目</p>
        </div>
      </header>
      <div className="special-grid">
        {soloGroup && (
          <Link
            href="/special/Solo/"
            className="special-card special-card-solo is-solo is-single reveal fx-pop"
            style={{ ['--fx-delay' as any]: '320ms' }}
          >
            <div className="special-card-front">
              {soloArt && (
                <img
                  className="special-card-cover"
                  src={soloArt}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                />
              )}
            </div>
            <div className="special-card-hover" aria-hidden="true">
              <div className="special-card-solo-song" title={soloPreview}>
                {soloPreview}
              </div>
            </div>
          </Link>
        )}
        <div className="special-grid-row">
          {rowGroups.map((g, gi) => {
            const art = ORIGIN_ART[g.origin] ?? '';
            return (
              <Link
                key={g.origin}
                href={`/special/${g.origin}/`}
                className="special-card reveal fx-pop"
                style={{ ['--fx-delay' as any]: (440 + gi * 130) + 'ms' }}
              >
                <div className="special-card-front">
                  {art ? (
                    <img
                      className="special-card-logo"
                      src={art}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="special-card-hover" aria-hidden="true">
                  <ul className="special-card-songs">
                    {g.songs.map(s => (
                      <li key={s.name}>
                        <span title={s.name}>{s.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
