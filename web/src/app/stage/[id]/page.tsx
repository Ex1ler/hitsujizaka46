import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import data from '@/lib/data';
import SongCard from '@/components/SongCard';
import ScrollToTopOnEnter from '@/components/ScrollToTopOnEnter';
import Topbar from '@/components/Topbar';
import ScrollControl from '@/components/ScrollControl';
import './page.css';

export async function generateStaticParams() {
  const stages = data.regions.filter(r => r.kind === 'stage');
  return stages.map((_, i) => ({ id: String(i) }));
}

interface Props {
  params: { id: string };
}

export default function StagePage({ params }: Props) {
  const idx = parseInt(params.id, 10);
  const stages = data.regions.filter(r => r.kind === 'stage');
  const region = stages[idx];
  if (!region || Number.isNaN(idx)) notFound();

  return (
    <>
      <Topbar />
      <ScrollToTopOnEnter />
      <main className="stage-page">
        <div className="stage-page-inner wrap">
          <Link href="/#stages" className="stage-back reveal" style={{ ['--fx-delay' as any]: '0ms' }}>← 返回</Link>
          <header className="stage-page-head reveal" style={{ ['--fx-delay' as any]: '80ms' }}>
            <h1 className="stage-page-name">{region.name}</h1>
          </header>
          <div className="stage-page-songs">
            <Suspense fallback={null}>
              {region.songs.map((s, i) => (
                <SongCard
                  song={s}
                  keyId={`stage-${idx}#${s.name}`}
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
