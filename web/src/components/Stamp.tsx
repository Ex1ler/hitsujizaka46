// 印泥印 SVG — 咩 + 桜 / 苔藓绿
export default function Stamp() {
  return (
    <div className="stamp-wrap" aria-hidden="true">
      <svg viewBox="0 0 200 200" className="stamp-svg">
        <defs>
          <filter id="rough">
            <feTurbulence baseFrequency="0.85" numOctaves="2" seed="3" />
            <feDisplacementMap in="SourceGraphic" scale="6" />
          </filter>
        </defs>
        <rect
          x="6" y="6" width="188" height="188"
          fill="#3f7a32"
          filter="url(#rough)"
          opacity="0.92"
        />
        <text
          x="100" y="118"
          textAnchor="middle"
          fontFamily='"Songti SC","STSong",serif'
          fontSize="92"
          fontWeight="600"
          fill="#fcfdf9"
          filter="url(#rough)"
        >
          咩
        </text>
      </svg>
      <div className="stamp-caption">
        <span className="cap-zh">咩咩坂 · 私印</span>
        <span className="cap-en">PRIVATE SEAL · 2026</span>
      </div>
    </div>
  );
}
