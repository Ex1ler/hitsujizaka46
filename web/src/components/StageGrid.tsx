import type { Region } from '@/lib/types';
import StageCard from './StageCard';
import './StageGrid.css';

interface Props {
  regions: Region[];
}

export default function StageGrid({ regions }: Props) {
  return (
    <section
      className="stage-section snap-section"
      id="stages"
      data-fx-section
      data-fx-id="stages"
    >
      <header className="stage-section-head">
        <div className="stage-section-text">
          <h2 className="stage-section-zh reveal" style={{ ['--fx-delay' as any]: '0ms' }}>公演舞台</h2>
          <p className="stage-section-sub reveal" style={{ ['--fx-delay' as any]: '0ms' }}>浏览曲目与详情</p>
        </div>
      </header>
      <div className="stage-grid">
        {regions.map((r, i) => (
          <StageCard
            region={r}
            index={i}
            key={r.name}
            revealDelay={300 + i * 110}
          />
        ))}
      </div>
    </section>
  );
}
