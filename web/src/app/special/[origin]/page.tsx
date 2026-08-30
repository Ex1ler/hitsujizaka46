import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import data from '@/lib/data';
import type { Song } from '@/lib/types';
import SongCard from '@/components/SongCard';
import ScrollToTopOnEnter from '@/components/ScrollToTopOnEnter';
import Topbar from '@/components/Topbar';
import ScrollControl from '@/components/ScrollControl';
import {
  ORIGIN_ORDER,
  ORIGIN_LABEL,
  specialOrigins,
  HIDDEN_SPECIAL_SONGS,
  type SpecialOrigin,
} from '@/lib/specialOrigins';
import { mergeSpecialSongs } from '@/lib/specialSongGroups';
import './page.css';

export async function generateStaticParams() {
  return ORIGIN_ORDER.map(origin => ({ origin }));
}

interface Props {
  params: { origin: string };
}

function originOf(name: string): SpecialOrigin {
  return specialOrigins[name] ?? 'Other';
}

export default function SpecialPage({ params }: Props) {
  const origin = params.origin as SpecialOrigin;
  if (!(origin in ORIGIN_LABEL)) notFound();

  const special = data.regions.find(r => r.kind === 'special');
  if (!special) notFound();

  const raw = special.songs.filter(
    s => !HIDDEN_SPECIAL_SONGS.has(s.name) && originOf(s.name) === origin
  );
  const songs = mergeSpecialSongs(origin, raw);

  return (
    <>
      <Topbar />
      <ScrollToTopOnEnter />
      <main className="special-page">
        <div className="special-page-inner wrap">
          <Link href="/#region-special" className="special-back reveal" style={{ ['--fx-delay' as any]: '0ms' }}>← 返回</Link>
          <header className="special-page-head reveal" style={{ ['--fx-delay' as any]: '80ms' }}>
            <h1 className="special-page-name">{ORIGIN_LABEL[origin]}</h1>
          </header>
          <div className={`special-page-songs ${songs.length === 1 ? 'is-single' : ''}`}>
            <Suspense fallback={null}>
              {songs.map((s, i) => (
                <SongCard
                  song={s}
                  keyId={`special-${origin}#${s.name}`}
                  showCount={false}
                  index={i}
                  key={s.name}
                />
              ))}
            </Suspense>
          </div>
        </div>
      </main>
      <ScrollControl />
    </>
  );
}
