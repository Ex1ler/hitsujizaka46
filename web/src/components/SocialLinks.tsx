// 咩咩坂46 社交链接（仅文字版，无 PNG logo）
// 用户第 22 轮反馈：删掉 PNG logo（太糊），只保留文字（平台名 + 用户 ID），优化交互和排版

import './SocialLinks.css';

interface SocialItem {
  key: string;
  platform: string;
  id: string;
  url: string;
}

const SOCIALS: SocialItem[] = [
  {
    key: 'bilibili',
    platform: '哔哩哔哩',
    id: '小泉花羊ovo',
    url: 'https://space.bilibili.com/2062109',
  },
  {
    key: 'xhs',
    platform: '小红书',
    id: '咩咩教主',
    url: 'https://www.xiaohongshu.com/user/profile/658143fd00000000200316b3?xsec_token=ABFbnJnAsnF_GLtrQHLjyxwtrSV4-dhVsQ7LyWlOMv-XI%3D&xsec_source=pc_search',
  },
];

export default function SocialLinks() {
  return (
    <ul className="social-links">
      {SOCIALS.map(s => (
        <li key={s.key} className="social-link-item">
          <a
            href={s.url}
            target="_blank"
            rel="noopener"
            className={`social-link social-${s.key}`}
            aria-label={`${s.platform} ${s.id}`}
            title={`${s.platform} · ${s.id}`}
          >
            <span className="social-tx">
              <span className="social-platform">{s.platform}</span>
              <span className="social-id">{s.id}</span>
            </span>
            <span className="social-arrow" aria-hidden="true">↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}