import data from '@/lib/data';
import Topbar from '@/components/Topbar';
import Masthead from '@/components/Masthead';
import Setlist from '@/components/Setlist';
import StageGrid from '@/components/StageGrid';
import SpecialGrid from '@/components/SpecialGrid';
import ScrollControl from '@/components/ScrollControl';

export default function HomePage() {
  const stages = data.regions.filter(r => r.kind === 'stage');
  return (
    <>
      <Topbar />
      <main>
        <section id="top">
          <Masthead />
        </section>
        <Setlist />
        <StageGrid regions={stages} />
        <SpecialGrid />
      </main>
      {/* 移除独立社交链接 section（已搬回 Masthead 内部） */}
      <footer className="foot snap-section" id="foot" data-fx-section data-fx-id="foot">
        <div className="foot-inner">
          <div className="foot-bless reveal" style={{ ['--fx-delay' as any]: '0ms' }}>
            <svg
              className="foot-sun"
              viewBox="0 0 48 48"
              aria-hidden="true"
              width="40"
              height="40"
            >
              <g fill="none" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="24" cy="24" r="8" fill="var(--green-bg-2)" />
                <line x1="24" y1="6" x2="24" y2="12" />
                <line x1="24" y1="36" x2="24" y2="42" />
                <line x1="6" y1="24" x2="12" y2="24" />
                <line x1="36" y1="24" x2="42" y2="24" />
                <line x1="11" y1="11" x2="15" y2="15" />
                <line x1="33" y1="33" x2="37" y2="37" />
                <line x1="37" y1="11" x2="33" y2="15" />
                <line x1="15" y1="33" x2="11" y2="37" />
              </g>
            </svg>
            <p className="foot-bless-tx">希望拂晓的阳光也可以温暖你</p>
          </div>
          <p className="foot-thanks reveal" style={{ ['--fx-delay' as any]: '120ms' }}>
            谢谢你成为偶像！毕业快乐！
          </p>

          <div className="foot-brand reveal" style={{ ['--fx-delay' as any]: '160ms' }}>
            <img src="/logo.webp" alt="" className="foot-mark" draggable={false} />
            <span className="foot-name">
              <span className="foot-name-main">咩咩坂</span>
              <wbr />
              <span className="foot-name-suffix">46</span>
            </span>
            <span className="foot-en">HITSUJIZAKA46</span>
          </div>
          <nav className="foot-links reveal" style={{ ['--fx-delay' as any]: '320ms' }}>
            <a href="#top">回到顶部</a>
            <a href="#setlist">制服与太阳</a>
            <a href="#stages">公演舞台</a>
            <a href="#region-special">特殊舞台</a>
          </nav>
          <div className="foot-fine reveal" style={{ ['--fx-delay' as any]: '420ms' }}>
            <p className="foot-copy">© 2026 咩咩坂46</p>
            <details className="foot-note">
              <summary className="foot-note-summary">
                <span className="foot-note-title">版权与免责声明</span>
                <span className="foot-note-toggle" aria-hidden="true">查看详细说明</span>
              </summary>
              <div className="foot-note-panel">
                <div className="foot-note-body">
                  <p>本网站为非官方粉丝整理页面，仅用于信息归档、内容索引与交流展示，不构成任何官方立场、授权关系或商业用途声明。</p>
                  <p>站内所涉图片、音乐、视频、人物形象及相关素材，其著作权、商标权与其他权利均归原权利方或所属平台所有。</p>
                  <p>页面内容在合理整理与引用范围内展示；如权利方认为相关内容不宜继续呈现，请联系处理，本站将在核实后及时调整或删除。</p>
                </div>
                <p className="foot-note-thanks">
                  特别致谢：
                  <a href="https://space.bilibili.com/2684628" target="_blank" rel="noreferrer">
                    @只想做小羊小姐的
                  </a>
                </p>
              </div>
            </details>
          </div>
        </div>
      </footer>
      <ScrollControl />
    </>
  );
}
