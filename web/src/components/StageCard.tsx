import Link from 'next/link';
import type { Region } from '@/lib/types';
import './StageCard.css';

interface Props {
  region: Region;
  index: number;
  revealDelay?: number;
}

const COVER_SRC: Record<string, string> = {
  '绯闻偶像': '/stage-covers/gossip-idol.webp',
  '遇见你后，夏天开始了': '/stage-covers/summer.webp',
  '缩略图': '/stage-covers/thumbnail.webp',
  '恋爱禁止条例': '/stage-covers/forbidden.webp',
};

export default function StageCard({ region, index, revealDelay = 0 }: Props) {
  const coverSrc = COVER_SRC[region.name] ?? '';
  return (
    <Link
      href={`/stage/${index}/`}
      className="stage-card reveal fx-pop"
      style={{ ['--fx-delay' as any]: revealDelay + 'ms' }}
      aria-label={region.name}
    >
      <div className="stage-card-front">
        {coverSrc ? (
          <img
            className="stage-card-cover"
            src={coverSrc}
            alt={region.name}
            loading="lazy"
          />
        ) : (
          <span className="stage-card-name">{region.name}</span>
        )}
      </div>
      <div className="stage-card-hover" aria-hidden="true">
        <div className="stage-card-head">
          <span className="stage-card-hover-name">{region.name}</span>
          <span className="stage-card-hint">曲目列表</span>
        </div>
        <ul className="stage-card-songs">
          {region.songs.map(s => (
            <li key={s.name}>
              <span title={s.name}>{s.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
