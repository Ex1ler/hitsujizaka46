# 咩咩坂46 · 项目交接文档（HITSUJIZAKA46）

> **目标受众**：接手本项目的下一位智能体（或开发人员）。
> **读完本文你能**：开一个新任务，照着「§11 接手后第一步」就能立刻起预览、改东西、构建、部署，无需再追问环境细节。
> **项目根**：`C:\Users\Windows11\WorkBuddy\hitsujizaka46\`
> **站点名**：咩咩坂46 / HITSUJIZAKA46
> **数据源**：B 站 UP 主所有公演 / 直拍 / 单曲投稿（统一以「B 站 UP 主」指代，不标注具体账号）
> **最后更新**：2026-08-30（已迭代 30+ 轮；当前确认快照已留存为 `V6`；当前工作树新增：真实访问计数 API、Redis/KV 持久化支持、准备迁移到 GitHub + Vercel 正常部署）

---

## 1. 一句话现状（TL;DR）

- **栈**：Next.js 14（App Router）+ TypeScript + 静态页面预渲染 + App Router API Route；当前已支持轻量服务端能力（真实访问计数），不再使用 `output: 'export'`。
- **风格**：绿白侘寂（wabi-sabi）——宋体衬线 + 大量留白 + 发丝暖灰绿边 + 克制卡片化 + 品牌绿 `#3f7a32` / `#2e6025` / `#63b853`。
- **已删除的功能（别恢复）**：深色/浅色主题切换（含 `ThemeToggle`、layout 防 FOUC 脚本、`[data-theme="dark"]` 变量）。
- **数据主链路**：`all_videos.json`（B 站原始）→ `build_website.py` 解析归并 → `web/src/data/site.json` → React Server Components 静态渲染。
- **特殊舞台**是独立数据分支：「出处分组」**不**在脚本里，手工维护在 `web/src/lib/specialOrigins.ts`（改出处只改这一处）。
- **页面**：首页（顶栏 + 主标题 + 毕业公演 + 公演舞台 4 卡 + 特殊舞台 4 卡 + Footer）；详情页 `/stage/[id]/`（4 个公演）和 `/special/[origin]/`（4 个出处分组）—— SSG 预渲染。
- **常驻全局组件（挂在 `layout.tsx` `<body>` 末尾）**：`SakuraPetals`（樱花特效）、`BgmPlayer`（背景音乐，跨页常驻，**音量 0.3**；窄屏默认收起为图标，点击展开）、`MobileSearchDock`（窄屏右上角折叠搜索按钮，点击展开搜索面板）、`ScrollHint`（滚动提示，详情页自动隐藏）、`FxObserver`（滚动进入动画触发器）。
- **移动端（≤780px）关键策略**：顶栏不硬挤搜索栏；搜索改为右上角折叠按钮；BGM 改为左下角折叠按钮，避免底部拥挤。
- **特殊舞台卡片（首页）**：全部改为“无文字正面 + 图片/Logo”风格，卡片统一按 1:1 比例适配图片长宽比（图片可放大占比更高）。
- **部署**：当前工作树以 **GitHub + Vercel + Cloudflare 域名** 为后续主部署方向；CloudStudio 仅保留为旧的静态预览链路。
- **状态**：`V6` 快照仍可回退；当前工作树已切换到“真实访问计数”方案：前端显示由 `/api/visit` 提供，服务端持久化使用 Vercel 上可接入的 Upstash Redis / KV 环境变量。**当前待办**：完成 GitHub / Vercel / Redis 集成配置，并继续处理毕业公演 20260816 新增 10 条直拍（见 §8）。

---

## 2. 目录结构（实际最新）

```
hitsujizaka46/
├── HANDOVER.md                       ← 本文件（项目文档）
├── all_videos.json                   ← B 站原始投稿（~2MB，1895 条）
├── build_website.py                  ← 主数据处理脚本
├── 王晓阳表演曲目整理*.xlsx            ← 用户给的原始数据表（人工核对用）
├── check_candidates.mjs               ← 遗漏排查工具①：对比 all_videos.json + site.json（直给 BV）
├── check2.mjs / check3.mjs            ← 遗漏排查工具②③：WebSearch/新浪枚举候选 t.cn → resolve → 比对（2026-08-29 用，可复用）
├── fetch_bili2.mjs / fetch_bili.py    ← B 站抓取脚本（被 -352 风控挡，参考用，勿当主力）
├── resolve_links.mjs                  ← t.cn 短链 → BV 解析器（t.cn 失效时可用 URL 跟随）
├── snapshots/
│   ├── V0/                            ← 首个确认版源码快照 + 恢复脚本
│   ├── V1/                            ← 早期确认版源码快照 + 恢复脚本
│   ├── V3/                            ← 中期确认版源码快照 + 恢复脚本
│   └── V6/                            ← 当前确认版源码快照 + 恢复脚本
│
└── web/                              ← ← 当前主项目（Next.js）
    ├── package.json                  ← 依赖：next@14.2.x + react + typescript + @fontsource/noto-* + @upstash/redis
    ├── tsconfig.json
    ├── next.config.mjs               ← trailingSlash:true + unoptimized images（已移除 `output:'export'`，以支持 API Route）
    ├── public/                       ← 静态资源（直接拷贝到 out/）
    │   ├── logo.png                  ← 顶栏 / Masthead / Footer 用 logo（透明背景，已清理边缘）
    │   ├── logo-original.png         ← logo 原始备份（处理前）
    │   ├── graduation-stage.jpg       ← 毕业公演合影横幅（lightbox 用）
    │   ├── bgm.m4a / bgm.mp3          ← BGM 音频（PRIDE / 遥远的黄金乡 ED，桌面资源转码）
    │   ├── bgm-icon.png               ← BGM 折叠按钮图标（透明底，桌面资源处理后导入）
    │   ├── fonts/                     ← 关键中文子集 woff2（7 子集 × 600/700 两档，~552KB）
    │       ├── noto-serif-sc-80-600-normal.woff2 …（101/111/115/117/118/119 同款 + 各 -700-）
    │   ├── stage-covers/              ← 公演舞台卡片封面（用户提供 4 张）
    │   │   ├── gossip-idol.jpg
    │   │   ├── summer.jpg
    │   │   ├── thumbnail.jpg
    │   │   └── forbidden.png
│   └── special-covers/            ← 特殊舞台卡片封面/Logo（移动端与 PC 共用）
│       ├── solo.jpg               ← 个人单曲卡片封面（已做高清化处理）
│       ├── akb48.svg              ← 开闭系 Logo（SVG）
│       ├── sakamichi.png          ← 坂道系图片（当前已恢复原图版本）
│       └── others.webp            ← 其他图片（桌面 Μ's_logo.svg.webp）
    └── src/
        ├── app/
        │   ├── layout.tsx            ← 全局 layout（Metadata + 字体 preload + 常驻全局组件）
        │   ├── page.tsx              ← 首页（所有 section 组合 + Footer）
        │   ├── globals.css           ← 设计令牌 + 全局排版 + snap scroll + reveal 动画系统
        │   ├── _font_optional.css    ← 关键子集 @font-face（font-display:optional，防 swap 闪烁）
        │   ├── icon.png              ← favicon（512×512，由 logo 生成）
        │   ├── stage/[id]/           ← 公演详情页（SSG）
        │   │   ├── page.tsx
        │   │   └── page.css
        │   └── special/[origin]/     ← 特殊舞台详情页（SSG）
        │       ├── page.tsx
        │       └── page.css
        ├── components/               ← 组件一一配对 .tsx + .css
        │   ├── Topbar(.tsx/.css)           ← sticky 顶栏（logo + 访问计数 + 搜索 + 3 项 nav）
        │   ├── Masthead(.tsx/.css)         ← 主标题区（CLIENT：等字体就绪再播动画，防抖动）
        │   ├── Setlist(.tsx/.css)          ← 毕业公演（合影 lightbox + 双列曲目）
        │   ├── StageGrid(.tsx/.css)        ← 4 个公演 region 网格
        │   ├── StageCard(.tsx/.css)        ← 单个公演卡（CSS hover 显示双列曲目列表）
        │   ├── SpecialGrid(.tsx/.css)      ← 特殊舞台卡片（个人单曲置顶 + 3 列分组）
        │   ├── SongCard(.tsx/.css)         ← 单首歌（默认收起、点击展开；`reveal-once` 永久可见 + index 错峰入场）
        │   ├── SearchBar(.tsx/.css)        ← 顶栏搜索（模糊匹配 + 跳转）
        │   ├── MobileSearchDock(.tsx/.css) ← 窄屏右上角折叠搜索（默认收起，点放大镜展开）
        │   ├── VisitCounter(.tsx/.css)     ← 累计访问（客户端请求 `/api/visit`，显示真实全站计数）
        │   ├── SocialLinks(.tsx/.css)      ← 2 个社交文字卡片（B 站 / 小红书）
        │   ├── ScrollHint(.tsx/.css)       ← 向下/向上滚动提示（CLIENT，路由感知，详情页隐藏）
        │   ├── ScrollControl(.tsx/.css)    ← 回到顶部按钮（>520px 显示）
        │   ├── BgmPlayer(.tsx/.css)        ← 背景音乐播放器（CLIENT，layout 常驻，跨页不断）
        │   ├── FxObserver(.tsx)            ← 滚动进入动画触发器（CLIENT，无配套 css）
        │   ├── SakuraPetals(.tsx/.css)     ← 全局樱花飘落 canvas 特效
        │   ├── Logo(.tsx/.css)             ← Masthead 大 logo 包装
        │   └── Stamp.tsx                   ← 装饰性「印泥印」SVG（咩+桜）
        ├── lib/
        │   ├── types.ts                ← Perf / Song / Region / SiteData 类型
        │   ├── numerals.ts             ← 数字 → 壹/贰/叁 + 01/02/03
        │   ├── data.ts                 ← import site.json + 类型断言
        │   ├── visitStore.ts           ← 真实访问计数存储封装（Redis/KV 环境变量适配）
        │   └── specialOrigins.ts       ← ★ 特殊舞台分组映射（手工维护，核心）
        └── data/
            └── site.json               ← 由 build_website.py 生成
```

> **client/server 区分**：所有页面 + 大多数组件是 server component。**`'use client'` 的有**：`Topbar`（scroll 监听 + scroll-spy）、`SearchBar`、`MobileSearchDock`、`VisitCounter`、`Setlist`（lightbox + ESC）、`SongCard`（展开 + URL `?expand`）、`SocialLinks`、`ScrollHint`（点击翻页/回顶 + 路由感知）、`ScrollControl`、`BgmPlayer`、`SakuraPetals`（canvas）、`FxObserver`（IntersectionObserver）、`Masthead`（等字体就绪）。新增 section 优先 server component，避免 bundle 体积膨胀。

---

## 3. 数据层

### 3.1 主数据流程

```
all_videos.json (B 站原始)
  ↓ build_website.py
  ├─ HTML 实体反转（修复双重转义）
  ├─ 路由判定 route(v)：「曲名」/live/show/AKB-LIVE/【段】
  ├─ 公演归属 detect_stage：正则匹配 4 个公演名
  ├─ 同曲变体合并（核心！）：
  │   ├─ ALIASES：'恋爱幸运曲奇' → '恋爱幸运饼干'
  │   ├─ norm_key：去标点小写
  │   ├─ ultra_key：极简（字母+CJK+假名）
  │   ├─ canonical：rank 排序（有符号/次数多/带空格/小写/更长）
  │   └─ prettify：LOVE TRIP → Love Trip
  ├─ 诊断 [DIAG]：用 ultra_key 反查 norm_key 未合并 → 必为空
  ├─ 毕业公演 HERO_BVID='BV1X9b86UEw5'：制服与太阳 王晓阳 20260816
  └─ 输出 web/src/data/site.json
  ↓ React 组件 import site from '@/data/site.json'
  ↓ next build 静态渲染
  ↓ out/*.html
```

**跑数据脚本**（数据源有更新时）：

```bash
cd C:\Users\Windows11\WorkBuddy\hitsujizaka46
C:/Users/Windows11/.workbuddy/binaries/python/versions/3.13.12/python.exe build_website.py
```

### 3.2 特殊舞台分组（★ 手工维护）

`web/src/lib/specialOrigins.ts` 是特殊舞台分组的**单一真相**。每次调整出处只改这一处，组件无需改动。

**分组（4 组，`ORIGIN_ORDER` 即展示顺序）**：

| key | 展示名 | 含义 | 当前去重首数 |
| --- | --- | --- | --- |
| `Solo` | 个人单曲 | 个人名义发行单曲 | 1（Chocolate♡Love）|
| `AKB48` | 开闭系 | AKB48 本家曲 | 66 |
| `Sakamichi` | 坂道系 | 乃木坂/樱坂/日向坂等 | 5 |
| `Other` | 其他 | 未明确出处 / 来源较少 | 10 |

**文件关键导出**：

- `type SpecialOrigin`：联合类型，新增分组必须同步加到这里和 `ORIGIN_LABEL`。
- `ORIGIN_ORDER`：卡片展示顺序（Solo 置顶居中、最突出）。
- `ORIGIN_LABEL`：`Record<SpecialOrigin,string>`，展示中文名。
- `HIDDEN_SPECIAL_SONGS`：`Set<string>`，不希望在特殊舞台出现的占位/合集项。
- `SONG_ALIASES` + `normalizeSongName()`：同一首歌的不同写法 → 规范化展示名（用于去重合并）。
- `specialOrigins: Record<string, SpecialOrigin>`：**歌曲名 → 出处的核心映射**。
  - **未在此映射中的曲目，默认归入 `Other`**（`originOf()` 的 fallback）。
  - **绝不瞎编**：用户会逐步修正此处。

**新增/修改分组的步骤**：

1. 编辑 `web/src/lib/specialOrigins.ts`
2. 在 `type SpecialOrigin` 加新 key
3. 在 `ORIGIN_ORDER` 数组加新 key
4. 在 `ORIGIN_LABEL` 加新展示名
5. （可选）在 `specialOrigins` 加歌名映射
6. 重新构建并部署（详情页 SSG 会自动预渲染新分组）

### 3.3 类型（`lib/types.ts`）

```ts
interface Perf  { date: string; title: string; url: string; bvid: string }
interface Song  { name: string; perfs: Perf[] }
interface Region{
  name: string;
  kind: 'stage' | 'special';
  songCount: number;
  perfCount: number;
  songs: Song[];
  spotlight?: { name: string; count: number };
}
interface SiteData {
  hero: { bvid: string; title: string; url: string };
  graduation: {
    name: string;
    date: string;
    songs: GradSong[];
    full: GradFull[];
  };
  regions: Region[];
  totals: { songs: number; perfs: number; videos: number; regions: number; coverage: number };
  generated: string;
}
```

### 3.4 B 站抓取与遗漏排查（★ 重要，2026-08-29 实测）

**B 站 API 风控（无登录态时不可用）**：
- `x/space/wbi/arc/search`（wbi 签名）与 `bili_ticket` 在**本环境沙箱 IP 均被 `-352 风控校验失败`** 挡住；`WebFetch` 空间页只返回空状态、搜索页返回泛化结果（会混入同名其他 UP 主）。
- 因此**无 B 站登录态 Cookie（SESSDATA / bili_jct）时，无法全量枚举「上次抓取后的真正新增投稿」。** 需要增量时请向用户索取 Cookie，或用下方退路。

**可用的枚举退路（2026-08-29 已验证）**：
1. WebSearch 关键词（如「王晓阳 直拍」「王晓阳 bilibili」「王晓阳 TSH48 直拍 搬运」）；
2. 抓新浪微博镜像（博主「只想做小羊小姐的」`sina.cn/media/2286245281`，其帖文带 `t.cn` 短链，能枚举到比搜索更全的带日期直拍清单）；
3. `resolve_links.mjs` 把 t.cn 跟随重定向解析出 BV（个别 B 链到 `passport.weibo.com` = 微博原生视频，非 B 站、不收录）；
4. `check_candidates.mjs` / `check2.mjs` / `check3.mjs` 比对 `site.json` 与 `all_videos.json`，输出「已链接 / 数据源有站点缺 / 全新」。

**最近一次结论（2026-08-29）**：公开可检索的 B 站王晓阳直拍中，**发现 20260816 毕业公演 10 条新直拍**不在 `all_videos.json`，待用户审核后补数据（清单见 §8）。

---

## 4. 组件与页面结构（当前实际状态）

### 4.1 首页（`app/page.tsx`）section 组合

```
<Topbar />                                  ← sticky 顶栏（无主题切换按钮）
<main>
  <section id="top">                        ← Masthead 区（100vh）
    <Masthead />                            ← logo + 咩咩坂46 + HITSUJIZAKA46 + SocialLinks
  </section>
  <Setlist />                               ← 制服与太阳 + 合影 lightbox
  <StageGrid regions={stages} />            ← 4 个公演 region 网格
  <SpecialGrid />                           ← 特殊舞台卡片网格
</main>
<footer id="foot" className="snap-section">  ← 整页 footer（带 .reveal 入场动画）
  ...（太阳 + 祝福 + brand + 4 个胶囊导航 + 版权）
</footer>
<ScrollControl />                           ← 回到顶部按钮
```

> `SakuraPetals` / `BgmPlayer` / `ScrollHint` / `FxObserver` 不在 `page.tsx` 里，而是在 `layout.tsx` 的 `<body>` 末尾常驻全站。

### 4.2 顶栏 Topbar（3 项 + 搜索）

- 左侧：Logo + 「咩咩坂46」品牌 + VisitCounter
- 中间：SearchBar（模糊匹配所有曲目，Enter 跳转）
- **移动端（≤780px）**：顶栏内的 SearchBar 隐藏；改为右上角 `MobileSearchDock` 的折叠放大镜按钮，点击展开搜索面板（不与页眉重叠）。
- 右侧：3 项 nav-link「01 制服与太阳 / 02 公演舞台 / 03 特殊舞台」
- **无下拉菜单**（用户要求删除）
- **无主题切换按钮**（深色模式已删除）
- **scroll-spy**：取距 viewport 中心最近的 section 作为 active；Masthead（#top）内和 Footer（#foot）内 `cur=null`、所有 nav-link 无下划线

### 4.3 主标题 Masthead（CLIENT）

- 结构：Logo + 「咩咩坂」+ 「46」+ 「HITSUJIZAKA46」副标
- **已改为 Client Component**：`useEffect` 里 `await document.fonts.ready`（1.2s 兜底）后给 `.masthead` 加 `is-ready`；CSS 中所有入场动画初始 `animation-play-state: paused`，就绪后才 `running`——**避免字体 swap 导致的标题文字抖动**。
- Logo 已清理边缘白边：用 PIL 根据 HSV 绿色/白色保留后保存 `public/logo.png`。
- 下方 FOLLOW 区（SocialLinks，2 个文字卡片），标签左对齐到社交卡片左边缘。

### 4.4 制服与太阳 Setlist

- 标题「制服与太阳」+ 英文小标「GRADUATION LIVE · 2026.08.16」
- 公演合影：横幅照片 `public/graduation-stage.jpg`，**点击放大**进入 lightbox（ESC 关闭、× 按钮关闭、点击遮罩关闭）
- lightbox 现已改为挂载到 `body` 的全局弹层：放大时会隐藏 BGM / 搜索 / 向下滚动 / 回顶，只保留关闭按钮；窄屏居中与点击热区问题已修复。
- 双列曲目布局：序号 + 曲名 + 「观看 →」胶囊按钮
- 悬停效果：所有曲目统一向两侧延伸（`padding-left/right` + `transform: scaleX` + 左侧绿色短边线）

### 4.5 公演舞台 StageGrid + StageCard

- 标题「公演舞台」+ 描述「悬停预览曲目 · 点击进入详情」（**两者 `--fx-delay:0ms` 同步播放动画**）
- 4 个公演 region 网格 2×2（缩略图 / 恋爱禁止条例 / 遇见你后夏天开始了 / 绯闻偶像）
- StageCard hover（纯 CSS）：绿色背景 + 序号 + 曲名双列列表（带垂直滚动条）
- 点击进入 `/stage/[id]/` 详情页

### 4.6 特殊舞台 SpecialGrid

- 标题「特殊舞台」+ 描述「悬停预览曲目 · 点击进入详情」（**两者 `--fx-delay:0ms` 同步播放动画**）
- 布局：标题区与卡片区整体在 section 内做垂直居中；个人单曲（Solo）置顶；其余 3 张卡片进入网格（开闭系 / 坂道系 / 其他）。
- 当前尺寸策略：个人单曲卡片约为下方普通卡片的 `1.2x`；下方 3 张卡片已在最近一轮放大到上一版的 `1.2x`，整体与标题区重新拉开间距并下移。
- 卡片正面全部无文字：正面仅显示图片/Logo；卡片统一 `aspect-ratio: 1/1`，通过 `object-fit: contain` 适配不同 Logo 长宽比，减少留白、提升图片占比。
- 资源位置：`web/public/special-covers/*`（见 §2）
- 卡片 hover（纯 CSS，不再用 React `active` 状态，避免重渲染丢失 `is-visible` 导致卡片悬停消失）
- 点击进入 `/special/[origin]/` 详情页

### 4.7 详情页（公演 / 特殊舞台）

两个详情页结构类似：

- 「← 返回」胶囊按钮（距顶 120px），href 指向入场时的 section（`/#stages` 或 `/#region-special`）
- 42px 衬线标题 + 80px 绿色短线
- **2 列布局** SongCard（`grid-template-columns:repeat(auto-fill,minmax(440px,1fr))`）
- SongCard **默认收起**，点击 chev 展开；展开后 perf-row 显示 序号 / 日期 / 视频标题 / 「观看 ↗」胶囊按钮
- **滚动进入动画**：返回链接、标题、每个 SongCard 单独 `reveal`（按 `index` 错峰入场）；SongCard 用 `reveal-once`（首入视口即永久可见，避免展开/操作时被 toggle 隐藏）。`<main>` 本身**不加** `data-fx-section`（否则整页会被隐藏，造成「打不开」）。
- **二级详情页不显示 ScrollHint**（见 4.8）。

### 4.8 滚动提示 ScrollHint（CLIENT，路由感知）

- 底部居中 fixed 胶囊按钮，由 `usePathname()` 驱动。
- 模式：
  - 顶部区域外：显示「向下滚动」+ 向下箭头，**可点击**，点击平滑滚动到下一个 `.snap-section`
  - 接近底部：显示「回到顶部」+ 向上箭头，点击回顶
- **详情页自动隐藏**：`/stage/*`、`/special/*` 路由直接 `return null`。
- 路由切换时立即隐藏上一页的提示，等页面动画 ≈1.2s 后再渐显。
- 无上下晃动，仅极柔呼吸。

### 4.9 滚动进入动画 FxObserver（CLIENT）+ reveal 系统

- `FxObserver.tsx` 挂在 `layout.tsx`，全站常驻。
- 用 `IntersectionObserver` 给所有 `[data-fx-section]` / `.reveal` 元素加/去 `is-visible`：
  - **进入视口** → 加 `is-visible`（播放动画）；**离开视口** → 去掉 `is-visible`（复位）。因此**每次滚动回到该区域都会重新播放**（toggle 模式）。
  - 配合 `MutationObserver` 监听 DOM 新增/移除节点，解决 React 重渲染替换元素后丢失 `is-visible` 的问题（这是「动画只播一次」的经典坑）。
  - `usePathname()` 作为 effect 依赖，路由切换时整体复位重播。
- CSS reveal 系统（`globals.css`）：`.reveal` / `[data-fx-section]` 初始 `opacity:0` + `transform` + 模糊，可见后归位；提供三种变体：
  - `.fx-pop`：回弹缩放（卡片用）
  - `.fx-rise`：大幅浮现（曲目项用）
  - `.fx-soft`：温和上浮（区块用）
  - 单条动画 0.62–0.7s，错峰延迟封顶后整屏 ≤ 2.4s；`--fx-delay` 控制错峰。
  - `prefers-reduced-motion: reduce` 时直接全部显示、无动画。
- **注意**：不要把需要一直可见的内容整体包进 `data-fx-section` 又依赖它可见——首页 Masthead 保留自身动画、不加 reveal。

### 4.10 背景音乐 BgmPlayer（CLIENT，常驻）

- 挂在 `layout.tsx`，**跨页不断**（audio 元素在 layout 里，路由切换不卸载）。
- 固定左下角（避开右下 ScrollControl）。显示名 `PRIDE`、时间 `当前/05:14`、播放/暂停、静音（SVG 喇叭+叉）、可拖动进度条。
- 音频：`public/bgm.m4a` + `public/bgm.mp3`（PRIDE / 遥远的黄金乡 ED，桌面资源转码，loop）。
- **非静音、首次交互起播**：浏览器拦截带声音的冷启动自动播放，故首屏尝试播放被拒时不强制静音，而是保持非静音状态，在用户首次交互（pointerdown/keydown/touch/scroll/wheel/mousemove，且非播放器内部控件）时再起播；起播成功后移除全局补播监听。
- **音量**：`VOLUME = 0.3`（用户 2026-08-29 要求；起播 effect 里 `a.volume = VOLUME`）。
- **进度条**：拖动修复（2026-08-29）——`onChange` 拖动中只更新 UI 预览不 seek；`draggingRef` 守卫让拖动期间 `timeupdate` 不回写（否则手柄会跳回播放位置）；`onPointerUp/onPointerCancel/onKeyUp/onBlur` 时一次性 `commitSeek`。解决了「拖动进度条跳回开头」。
- **窄屏折叠（≤780px）**：默认收起为一个按钮图标（`/bgm-icon.png`，透明底），点击展开完整播放器；展开态也提供同图标的收起按钮。
- 桌面 BGM 资源转码链路见历史（音频文件已就位，无需重做）。

### 4.11 社交链接 SocialLinks

- 2 个文字卡片，无 PNG 图标。
- 卡片结构：`哔哩哔哩 / 小泉花羊ovo` + `小红书 / 咩咩教主`
- B 站：`https://space.bilibili.com/2062109`
- 小红书：`https://www.xiaohongshu.com/user/profile/658143fd00000000200316b3?xsec_token=...`
- hover：边框变绿 + 上浮 + 阴影 + 渐变高光 + 平台名变绿 + ↗ 箭头滑入 + ID 字距撑开

### 4.12 Footer（整页）

- 太阳 SVG（旋转 16s）+ 祝福语「希望拂晓的阳光也可以温暖你」+ 感谢语 + 品牌（logo 48x48 + 咩咩坂46 30px + HITSUJIZAKA46 16px）+ 4 个胶囊导航 + 版权
- **带 `.reveal` 入场动画**：滚动离开后再进入会重新获得 `is-visible` 并播放进入动画。

### 4.13 VisitCounter（CLIENT）

- `localStorage` 存累计次数；`sessionStorage` 仅用于暂存“最近一次是否由站内主动跳转触发”
- **只要不是站内主动跳转，就会累计 +1**：外部进入、直接打开、新开标签、重开站点、浏览器刷新都计数；站内 `Link` / 同源 `<a>` / 搜索跳转不计数
- 当前计数键为 `hitsuji.visit.v6.count`；`v2`/`v3`/`v4` 旧键会在运行时自动清理，用于本轮“访问次数清零”

### 4.14 SearchBar

- 模糊匹配所有 region 的曲名（精确 > 前缀 > 包含 > 规范化名 > 紧凑）
- 下拉建议：最多 8 条、按分数排序、`<mark>` 高亮匹配片段
- 快捷键：↑↓ 选择 / Enter 跳转 / Esc 关闭 / `/` 全局聚焦
- 跳转：
  - **毕业公演**：scrollIntoView #setlist + `.track-item.is-flash` 高亮
  - **公演**：navigate `/stage/[id]/?expand=曲名` → SongCard 自动展开
  - **特殊舞台**：navigate `/special/[origin]/?expand=曲名` → 同理

### 4.15 窄屏搜索 MobileSearchDock（CLIENT）

- 仅在 `max-width:780px` 显示，默认以“放大镜”按钮收起。
- 位置：页面右上角，`top: calc(var(--topbar-h) + 10px)`，其中 `--topbar-h` 由运行时测量 `#topbar` 高度写入，保证不与页眉重叠。
- 点击按钮展开搜索面板（沿用 `SearchBar` 组件），点击外部区域自动收起。
- 相关文件：`web/src/components/MobileSearchDock.tsx`、`web/src/components/MobileSearchDock.css`。

### 4.16 樱花特效 SakuraPetals

- 全局 canvas 绘制，`position:fixed; inset:0; z-index:40; pointer-events:none`
- 20 片稀疏樱花，5 瓣形状 + 淡黄花蕊
- 配色：白 / 淡粉 / 极淡粉（已去掉浅绿）
- 动态：独立下落速度 + 水平漂移 + sin 摆动 + 旋转
- `prefers-reduced-motion: reduce` 时自动隐藏

---

## 5. 设计系统（`globals.css`）

### 5.1 配色（仅浅色模式，深色已删除）

```css
--paper:        #fcfdf9;      /* 主纸面（极浅米白） */
--paper-2:      #f5f7f0;      /* 次纸面 */
--white:        #ffffff;      /* 主标题区纯白 */
--ink:          #1a1a1a;      /* 主字 */
--ink-2:        #2c2c2c;      /* 次字 */
--muted:        #6f6f6f;      /* 静音字 */
--green:        #3f7a32;      /* 主绿（深） */
--green-2:      #2e6025;      /* 更深绿（重点字） */
--green-3:      #63b853;      /* 品牌亮绿 */
--green-4:      #8acf78;      /* 飘色 */
--green-bg:     #e8f1de;      /* 浅绿背景 */
--green-bg-2:   #f0f7eb;      /* 极浅绿 */
--line:         #e6e9e0;      /* 发丝线 暖灰绿 */
--line-2:       #d5dccd;
--line-green:   rgba(63,122,50,.18);
--glass:        rgba(252,253,249,.86);   /* 顶栏/滚动提示玻璃背景 */
--glass-strong: rgba(255,255,255,.94);
```

> **没有深色模式**：`[data-theme="dark"]` 相关变量、`ThemeToggle` 组件、`layout.tsx` 防 FOUC 脚本均已删除，不要恢复。

### 5.2 字体

```css
--font-sans: "Noto Sans SC","PingFang SC","Microsoft YaHei","Hiragino Sans GB",-apple-system,BlinkMacSystemFont,"Segoe UI","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji","Apple Color Emoji",sans-serif;
--font-serif:"Noto Serif SC","Songti SC","STSong","Source Han Serif SC","STFangsong","FangSong","SimSun","Segoe UI Symbol","Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji",serif;
--font-mono: "SF Mono","JetBrains Mono",Consolas,"Segoe UI Symbol","Noto Color Emoji",monospace;
```

- 思源黑体/宋体通过 `@fontsource/noto-sans-sc` / `@fontsource/noto-serif-sc` 引入，unicode-range 分片按需加载。
- **字体防闪烁优化（已做）**：`@fontsource` 默认 `font-display: swap`，网络慢时会先显示系统字体再 swap，造成「字体不对」的闪烁。
  - `web/src/app/_font_optional.css` 后定义同名 `@font-face`，对首页/topbar/标题常用的 7 个 Noto Serif SC 子集（80/101/111/115/117/118/119）的 600/700 权重设置 **`font-display: optional`**，覆盖 swap 行为。
  - 这些子集 woff2 已复制到 `web/public/fonts/`（`next build` 会拷贝到 `out/fonts/`）。
  - `layout.tsx` 的 `<head>` 里 `preload` 这 7 个 600 权重子集，让品牌文字更快可用。
  - **改字体栈时不要移除 emoji 回退项**（♡ 等靠 emoji 回退）。

### 5.3 布局约定

- `html { scroll-behavior: smooth; scroll-snap-type: y mandatory; }`
- `.snap-section { min-height: 100vh; scroll-snap-align: start; }`
- `.snap-section.is-auto { height: auto; justify-content: flex-start; }`（用于内容超过一屏的 section）
- 最大容器 `--maxw: 1180px`，紧凑版 `--maxw-tight: 900px`
- 毕业公演区标题/合影/列表对齐 `max-width: calc(var(--maxw) * 0.8)`（≈944px）居中（用户要求：标题合影不拉太宽、列表与之对齐）。
- **首页关注区入场延迟**：`.home-social-wrap` 的 `animation-delay` 当前为 **`1s`**（标题出现后约 1s 淡入；曾调过 1.85s / 1.3s / 0.75s，最终定 1s）。

---

## 6. 构建与部署

### 6.1 本地预览

```powershell
# 1. 开发预览（推荐，支持 /api/visit）
cd "C:\Users\Windows11\WorkBuddy\hitsujizaka46\web"
npm run dev
# → http://localhost:3000/

# 2. 生产预览（模拟 Vercel 运行）
npm run build
npm run start
# → http://localhost:3000/
```

> 现在访问计数走 `/api/visit`，因此**不要再用 `web/out + http.server` 作为主验证方式**；那套只适合历史静态导出版本。

### 6.2 重新构建（★ 含沙箱避坑，照抄即可）

> **重要：本环境有 safe-delete 沙箱**。直接用 Bash 的 `rm -rf .next` 清理可能被拦截。**可靠做法是用 PowerShell 清理 + 清空会话环境变量**，再跑 `next build`：

```powershell
cd "C:\Users\Windows11\WorkBuddy\hitsujizaka46\web"
# 1. 关掉旧的 Node 预览（如有）
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
# 2. 清理上一次产物
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
# 3. 清空会话环境变量
$env:CODEBUDDY_SESSION_ID = ""
$env:CLAUDE_SESSION_ID = ""
$env:NEXT_TELEMETRY_DISABLED = "1"
# 4. 构建（node 走托管运行时；若 node 不在 PATH 用全路径 C:/Users/Windows11/.workbuddy/binaries/node/versions/22.22.2/node.exe）
Write-Host "building..."
node node_modules/next/dist/bin/next build
```

- 成功输出会包含首页、4 个公演、4 个特殊舞台，以及新增的 `/api/visit` 路由能力。
- 若要本地模拟生产环境，再继续执行 `npm run start`。

### 6.3 部署（当前主路线）

- **推荐**：GitHub 仓库接入 Vercel，域名走 Cloudflare。
- **Vercel Root Directory**：`web`
- **运行要求**：给项目接入 Upstash Redis / Vercel Redis，并提供 `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`（也兼容旧 `KV_REST_API_URL` / `KV_REST_API_TOKEN` 命名）。
- **说明**：若未配置 Redis/KV，站点仍能运行，但顶栏真实访问计数会返回 `0`，不会累加。
- **旧方案**：CloudStudio 静态托管只保留给历史快照或纯静态演示使用，不再作为真实访问计数版本的主部署方式。

---

## 7. 当前已实现功能

### 数据/功能
- ✅ B 站 1895 条原始投稿解析
- ✅ 159 首曲目（去重后）全部带 B 站外链
- ✅ 12 首毕业公演曲目（制服与太阳 王晓阳 20260816）
- ✅ 4 个公演 region（缩略图 / 恋爱禁止条例 / 遇见你后夏天开始了 / 绯闻偶像）
- ✅ 特殊舞台分组（个人单曲 + 开闭系 + 坂道系 + 其他）
- ✅ 公演 + 特殊舞台详情页（SSG）
- ✅ 真实累计访问计数（客户端调用 `/api/visit`；服务端用 session cookie 去重，同步读写 Redis/KV 总数）

### UI/交互
- ✅ 顶栏 sticky + 模糊搜索 + scroll-spy（无主题切换）
- ✅ Masthead 中轴线对齐 + Logo 边缘透明清理 + 等字体就绪防抖动
- ✅ 制服与太阳 双列曲目 + lightbox 公演合影 + 悬停向两侧延伸
- ✅ 合影 lightbox 改为全局弹层，放大时隐藏悬浮按钮，仅保留关闭按钮
- ✅ 公演/特殊舞台卡片：CSS hover 双列序号 + 曲名列表（标题与副标动画同步）
- ✅ 特殊舞台区块已按最近一轮调整为“标题区 + 卡片区整体居中、卡片比例重新分配”的版式
- ✅ 详情页「← 返回」胶囊按钮 + 2 列 SongCard + 「观看 ↗」胶囊按钮 + 滚动入场
- ✅ 社交链接 2 个文字卡片
- ✅ Footer 整页（带 reveal 入场动画）
- ✅ 滚动提示（点击向下翻页 / 点击向上回顶）+ 回到顶部按钮（详情页自动隐藏）
- ✅ 全局樱花飘落特效（稀疏柔和，20 片 5 瓣樱花）
- ✅ 思源宋体/黑体 WebFont + 关键子集 `font-display:optional` 防 swap 闪烁 + 预加载
- ✅ 路由感知的滚动进入动画（FxObserver，每次进入重播；卡片 fx-pop / 曲目 fx-rise / 区块 fx-soft）
- ✅ 背景音乐播放器（PRIDE，**音量 0.3、非静音、首次交互起播、跨页常驻、可暂停/静音/拖进度——拖动已修复不跳回开头）

### 部署/工程
- ✅ Next.js 14 页面预渲染 + App Router API Route
- ✅ 为 GitHub + Vercel 部署保留正常运行模式（已移除 `output: 'export'`）
- ✅ 9 条页面路由预渲染 + 1 条访问计数 API 路由

---

## 8. 待办 / 后续方向

### 最高优先（接手后立刻处理）
- ➕ **核对「其他」组出处**：用户会继续在 `specialOrigins.ts` 里修正未明确出处的曲目。
  - **绝不瞎编出处**——不确定就放「其他」，等用户确认。
- ➕ **毕业公演 20260816 新增 10 条直拍待用户审核后入库**（均不在 `all_videos.json`，是上次 8/23 抓取后新发布的投稿）：
  - BV1fb886fE2A 唇上Be My Baby / BV1gK8861E4k 彩瞳Wink / BV1tu886CEmN 未散落的樱 / BV1QA886mEG7 47条美丽的街 / BV1Ft886hEMh 大声钻石 / BV1pN8h6KEGd 借口而已Maybe / BV1SD8861EM6 喜欢你 喜欢你 喜欢你 / BV1YH8h6WEaC 坏路姬 / BV1RJ8h6REwT 拼图48 / BV1Aj8t6cE6J River（均为日期 20260816）
  - 处理方式参考：等用户确认后，跑数据脚本补入（`all_videos.json` 补条目 + `build_website.py` 归并，或手动 patch `site.json` 的 graduation）再构建部署。

### 中优先
- ➕ 添加更多社交平台（微博 / 抖音等，等用户提供 ID 和链接）
- ➕ 部署自动化 / 自定义域名

### 已废弃（不要恢复）
- ❌ 深色/浅色主题切换（用户要求删除：删 `ThemeToggle`、layout 防 FOUC 脚本、`[data-theme="dark"]` 变量）
- ❌ V8 之前的 `AdminGate` + `EditableText` + `lib/edit.ts`
- ❌ 嵌入式 hero 视频
- ❌ Footer 独立路由 `/about/`
- ❌ Topbar 下拉菜单
- ❌ DotNav 右侧圆点导航
- ❌ 进度条 + 小羊球图标
- ❌ BGM 自动播放 + 静音按钮（**注意：这是早期第 28 轮的决定；后续已重新做并常驻为 BgmPlayer，当前 BGM 是生效的**）

### 低优先（远期）
- ➕ 直播回放板块
- ➕ 美图 gallery
- ➕ 时间轴
- ➕ 小游戏
- ➕ 数据搜索/筛选增强（按日期范围、按分组、按 UP 等）

---

## 9. 关键坑与注意事项

### 沙箱 / 命令
1. **不要 `rm -rf` Windows 个人目录**（Desktop/Downloads/Documents）；项目内 `.next/` 可删。
2. **构建前建议先关旧的 `node` 预览进程**，避免端口和缓存状态干扰验证。
3. **构建用 PowerShell + 清空 `CODEBUDDY_SESSION_ID`/`CLAUDE_SESSION_ID`**（见 §6.2），不要用 Bash 直接 `rm -rf .next`（会被 safe-delete shim 拦截）。
4. 历史上的 `web/out + http.server` 只适用于旧静态导出版本；当前工作树验证真实访问计数时，必须跑 `npm run dev` 或 `npm run start`。
5. PIL 路径用绝对 `C:/...` 正斜杠。

### 字体
- 思源字体本身渲染清晰，**不需要**再叠加 `text-shadow` 抗锯齿。
- 改排版时**不要移除** `--font-sans`/`--font-serif` 的 emoji 回退项。
- 若以后新增常用汉字导致显示成 fallback：把对应 `@fontsource` 子集 woff2 加进 `public/fonts/` 与 `_font_optional.css`，并在 `layout.tsx` 补 `preload`。
- `text-rendering: optimizeLegibility` + `font-synthesis: none`。

### 动画（FxObserver / reveal）
- 若某区块「加载出来是空白/打不开」：检查该元素是否被正确加了 `reveal`/`data-fx-section`，且**没有被包在一个整体隐藏的父容器里**（`<main>` 不要加 `data-fx-section`，否则整页隐藏——二级详情页的坑）。
- 动画「只播一次不重播」通常是 React 重渲染替换了元素导致 `is-visible` 丢失；`FxObserver` 已用 `MutationObserver` 兜底，一般无需再改。若仍异常，确认 `FxObserver` 的 `pathname` 依赖与 `io`/`mo` 未提前 disconnect。
- 特殊舞台卡片**必须用纯 CSS `:hover` 驱动**，不要引入 React `active`/`hover` state（重渲染会移除 `is-visible` 让卡片悬停时消失）。

### 数据
- 改特殊舞台出处 = 改 `web/src/lib/specialOrigins.ts` 一处即可，组件无需改动。
- 详情页是 SSG：`generateStaticParams` 只返回 `ORIGIN_ORDER`；**新增分组必须同步更新** `ORIGIN_ORDER` + `ORIGIN_LABEL` + `SpecialOrigin` 类型 + `specialOrigins` 映射，否则新分组既不在首页也不预渲染。
- 同曲合并诊断（`build_website.py` 末尾 `[DIAG]` 输出）应始终为空；若有未合并变体 → 扩展 `PUNCT_CHARS` 或 `ALIASES`。
- **B 站 API 在本环境无登录态会被 `-352 风控` 挡住**（wbi + bili_ticket 均无效），**先此坑会浪费 1~2 小时**；增量枚举/遗漏排查直接走 §3.4 的 WebSearch + 新浪微博镜像退路。若用户能给 SESSDATA/bili_jct，才走 API。
- 校准数据不入库原则：**发现新直拍先发用户审核，确认后才补数据再构建部署**（20260816 毕业公演 10 条正在等待，见 §8）。

### 图片/logo
- `public/logo.png` 已经过透明边缘清理，原图备份为 `public/logo-original.png`。
- 若以后需要重新处理 logo，参考 `outputs/clean_logo.py` 的 HSV 保留逻辑（保留绿色 + 白色文字，去除高光白边）。

### 部署
- 真实访问计数版本的主部署方式是 **GitHub → Vercel**，不是 `out/` 静态上传。
- 部署前必须先在 Vercel 项目里配置 Redis/KV 环境变量，否则页面可打开，但顶栏计数会一直显示 `0`。
- 运行时兼容两套变量名：`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`，以及旧 `KV_REST_API_URL` / `KV_REST_API_TOKEN`。
- `@vercel/kv` 已废弃；当前项目实际接的是 Vercel 可集成的 Upstash Redis REST 方案。

---

## 10. 用户协作偏好（重要，接手必读）

- 用户**全程中文**沟通。
- 习惯以「**截图 + 编号清单**」提出 UI 调整需求，期望按编号规格逐项落实，便于对照执行。
- **「当前任务已完成」这句话放在回复的最后，且必须真的把所有事全做完才允许发**（用户明确立过规矩：开头说过的版本已改为结尾说）。
- 遇到阻碍**不要停下**，清晰说明卡点后继续推进。
- 对交付质量有自检要求：输出前多次检查是否遗漏。
- UI 变更偏好「编号列表 + 明确规格」格式。
- **「其他」组是暂存区，绝不瞎编出处**——不确定就先放「其他」，等用户确认。
- 用户经常会反复改主意，不要觉得来回改就是浪费——这是迭代过程。
- 接到反馈后**立刻动手**。
- 用户明确说"不要小巧思"——优先经典、简单、克制。
- 大改动后写 `.workbuddy/memory/YYYY-MM-DD.md` 日志。

### 10.1 命名与数据源口径（重要，接手必守）

- **站点名只叫「咩咩坂46 / HITSUJIZAKA46」**，**不要带「（王晓阳粉丝典藏站）」这类括注**（用户明确要求去掉）。
- **数据源统一表述为「B 站 UP 主所有公演 / 直拍 / 单曲投稿」**，**不要点名具体 UP 主账号或 UID**（如「只想做小羊小姐 / 2684628」）。
  - 内容里的表演者名（王晓阳）是素材本身，可保留；但**数据来源**不标注具体 UP 主。
  - 站内社交链接（B 站 小泉花羊ovo / 小红书 咩咩教主）是站点自己的粉丝账号，可保留，与数据源 UP 主无关。
- 涉及文档、元数据、文案时，统一按上面口径，避免再次出现「（王晓阳粉丝典藏站）」或具体 UP 主名。

---

## 11. 接手后第一步（立刻动手）

```powershell
# 1. 起本地预览看现状（先关旧进程避免端口占用）
Stop-Process -Name python -Force -ErrorAction SilentlyContinue
cd "C:\Users\Windows11\WorkBuddy\hitsujizaka46\web\out"
Start-Process -NoNewWindow C:/Users/Windows11/.workbuddy/binaries/python/versions/3.13.12/python.exe -ArgumentList "-m","http.server","8235","--bind","127.0.0.1"
# 浏览器开 http://127.0.0.1:8235/  （详情页带尾斜杠 /stage/0/）

# 2. 改组件（例：修改公演卡 hover 列表样式）
#    编辑 web/src/components/StageCard.css

# 3. 改数据/出处（例：把某歌从 其他 改到 开闭系）
#    编辑 web/src/lib/specialOrigins.ts，加一行 '歌名':'AKB48'

# 4. 重新构建（照 §6.2，必须清空会话环境变量）
cd "C:\Users\Windows11\WorkBuddy\hitsujizaka46\web"
Stop-Process -Name python -Force -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force out, .next -ErrorAction SilentlyContinue
$env:CODEBUDDY_SESSION_ID = ""; $env:CLAUDE_SESSION_ID = ""; $env:NEXT_TELEMETRY_DISABLED = "1"
node node_modules/next/dist/bin/next build

# 5. 截图验证（用 agent-browser）
#    agent-browser open "http://127.0.0.1:8235/stage/1/"
#    agent-browser screenshot --screenshot-dir outputs/

# 6. 部署（覆盖同一 shareLink）
#    用 workbuddy_cloudstudio_deploy 工具，目录 web/out，端口 3000
```

---

## 12. 联系 / 数据源

- 数据源：B 站 UP 主所有公演 / 直拍 / 单曲投稿（统一以「B 站 UP 主」指代，**不标注具体账号**，详见 §10 协作偏好）。
- 毕业公演：`制服与太阳 王晓阳毕业公演 20260816`（Hero BV `BV1X9b86UEw5`）。
- B 站粉丝账号：小泉花羊ovo（`https://space.bilibili.com/2062109`）。
- 小红书粉丝账号：咩咩教主（profile/658143fd00000000200316b3）。
- 站点态度：**非官方粉丝站**，仅供粉丝交流。

---

## 13. 最近改动速查（第 30 轮起，覆盖旧版 §13）

> 旧版文档停留在「第 29 轮」。以下为之后所有关键改动，开新任务直接看这里即可接上。

| 阶段 | 用户核心反馈 | 关键改动文件 / 行为 |
|---|---|---|
| 清理与改名 | 删深色模式、59 对齐、列表常态加宽、TOP→首页、站名只叫咩咩坂46、logo 作 favicon、列表整体左右拉宽、标题合影 0.8× 收缩对齐、删英文副标 | 删 `ThemeToggle.tsx/.css` + layout 防 FOUC 脚本 + `[data-theme="dark"]`；`VisitCounter.css` baseline；`Setlist.css` padding；`ScrollControl` 中文「首页」；`layout.tsx` 标题；`icon.png`；`StageGrid/SpecialGrid` 删英文小标；`globals.css` `max-width:calc(var(--maxw)*.8)` |
| 加载顺序 | 标题先、关注区后淡入 | `.home-social-wrap` 入场延迟 1.85s → 1.3s → 0.75s → **最终 1s** |
| BGM | 自动播放、PRIDE、非静音、跨页常驻、不要默认静音 | 新增 `BgmPlayer.tsx/.css`（挂 layout 常驻）；`public/bgm.{m4a,mp3}`；首次交互起播（非静音兜底）；修了「点击自动取消」「自动播放不响」「跨页断掉」三个 bug |
| ScrollHint + 动画 | 路由感知、首页显示、翻页立即隐藏、滚动进入动画 | `ScrollHint.tsx` 重写（`usePathname`，详情页 `return null`）；新增 `FxObserver.tsx`（IntersectionObserver + `[data-fx-section]`/`.reveal`）；`globals.css` reveal 基础系统 |
| 重播 + 丰富 + 细节 | 每次进入重播、动画更丰富、标题副标同步、footer 动画、修悬停消失、修字体抖动 | `FxObserver` 改 toggle + `MutationObserver`（修复只播一次/二级页空白）；`globals.css` 加 `.fx-pop/.fx-rise/.fx-soft`（总时长 ≤2.4s）；`StageGrid/SpecialGrid` 标题副标 `--fx-delay:0` 同步；`Masthead` 改 client 等 `fonts.ready` 防抖动；`SpecialGrid` 去 React `active` 状态改纯 CSS hover（修悬停消失）；`page.tsx` footer 加 `.reveal` |
| 字体优化 | 避免延迟/卡顿时显示成 fallback 字体 | 新增 `src/app/_font_optional.css`（`font-display:optional`）；拷贝 7 子集×2 权重 woff2 到 `public/fonts/`；`layout.tsx` `<head>` `preload` 关键子集；`globals.css` `--font-serif` fallback 调整 |
| 命名与数据源口径 | 站点名去掉「（王晓阳粉丝典藏站）」括注；数据源统一称「B 站 UP 主所有公演/直拍/单曲投稿」，不点名具体 UP 主 | `layout.tsx` 的 `description` 改为 `基于 B 站 UP 主投稿整理`（去除 @UP主）；HANDOVER §1/§12/§10.1 同步更新口径 |
| 曲目列表优化 | 点击展开后悬停/操作消失；长列表（66 首）上下滑空屏 | `FxObserver.tsx` 增 `reveal-once` 持久可见（首入视口即 unobserve，不再随滚动隐藏）+ `rootMargin` 底部改正向 `10%` 提前触发；`SongCard.tsx` 加 `reveal-once` 类、`--fx-delay` 上限 990ms→240ms；首页卡片仍用 `.reveal` toggle 重播 |
| 展开态兜底 | 点击曲目展开视频链接时仍会消失 | `SongCard.css` 加 `.song.is-open{opacity:1!important;transform:none!important;filter:none!important}` 兜底，已重新构建部署（构建产物 grep 确认 `reveal-once` 在 chunk、`is-open` 兜底在 CSS） |
| B 站再搜索① | 在 B 站再搜有无别的日期直拍可扩充链接，先发审核 | B 站 API（wbi + bili_ticket）均被 `-352 风控` 挡住，无登录态无法全量枚举；改走 WebSearch，找到 5 条带日期直拍（恋爱幸运饼干 20260731 / 小世界 20260619 / 好想见到你 20260801 / 沿途风景皆为经过 20260725 / 唇上Be My Baby 20260725），`check_candidates.mjs` 比对后**全部已在现有名单且已链接**，本渠道无可扩充新项 |
| B 站再搜索②（扩范围） | 直拍也可来自其他 UP 主/博主（只要是王晓阳即可），再排查遗漏 | WebSearch 多组关键词（「王晓阳 直拍」等）：**B 站侧未发现除数据源 UP 主外的其他账号**（所谓「其他博主」如微博账号只是转发其 B 站链接）；`check2.mjs` 解析 21 个候选，**全部 B 站 BV 均已链接进 site.json（1362 条）**；每对 t.cn 的第二个链接解析到微博原生视频（passport.weibo.com，非 B 站，站点不收录）。结论：公开可检索的 B 站王晓阳直拍无遗漏 |
| B 站再搜索③（毕业公演新发现） | 关键词用「王晓阳 直拍」再确定是否有遗漏 | `check3.mjs` 解析 70 条（新浪主页枚举的 B 站链接）：**发现 10 条全新遗漏，均为 20260816 毕业公演直拍**——唇上Be My Baby / 彩瞳Wink / 未散落的樱 / 47条美丽的街 / 大声钻石 / 借口而已Maybe / 喜欢你 喜欢你 喜欢你 / 坏路姬 / 拼图48 / River（BV 均不在 `all_videos.json` 也不在 `site.json`，是上次 8/23 抓取后新发布的投稿，**待用户审核后补数据**）；其余 60 条全部已链接 |
| BGM 音量 + 进度条修复 | 音量改 0.3；进度条拖动回开头 | `BgmPlayer.tsx`：`VOLUME=0.3` + 起播时 `a.volume=VOLUME`；进度条 `onChange` 拖动中只更新 UI 预览不 seek、`draggingRef` 守卫 `timeupdate` 拖动中不回写、`onPointerUp/onKeyUp/onBlur` 一次性 `commitSeek`（修跳回开头）；已构建部署（13/13，HTTP 200） |
| 移动端搜索重排 | 窄屏搜索不要挤顶栏；右上角折叠按钮展开 | 新增 `MobileSearchDock.tsx/.css`（右上角放大镜按钮 → 展开搜索面板）；`SearchBar.css` 仅隐藏顶栏内搜索（`.topbar .searchbar{display:none}`） |
| 移动端 BGM 折叠 | 窄屏默认收起，点击展开；收起图标使用桌面资源并透明底 | `BgmPlayer.tsx/.css` 增 `collapsed` 模式（≤780px 默认收起）；`public/bgm-icon.png` 由桌面 `1234.png` 处理背景透明后导入；折叠态按钮居中修正图标偏移 |
| 特殊舞台卡片全图片化 | 卡片去文字、适配图片长宽比、图片占比更高 | `SpecialGrid.tsx/.css`：卡片统一 `aspect-ratio:1/1`，正面仅显示图片/Logo；资源集中到 `public/special-covers/`（`solo.jpg/akb48.svg/sakamichi.png/others.webp`） |
| 合影 lightbox 修复 | 窄屏放大图下移、关闭按钮热区异常、放大时仍显示悬浮控件 | `Setlist.tsx/.css`：lightbox 改为挂到 `body` 的全局弹层；放大时给页面加状态并隐藏 `BgmPlayer` / `MobileSearchDock` / `ScrollHint` / `ScrollControl`；关闭按钮扩大热区并修复角落露底 |
| 特殊舞台版式重排 | 标题区参考公演舞台；整体下移并居中；个人单曲与下方三卡按新比例排布 | `SpecialGrid.css`：标题区和卡片区间距重做；个人单曲卡片与下方三卡分开定宽；下方三卡放大并整体居中 |
| 特殊舞台资源微调 | 提升个人单曲图片清晰度；坂道系曾增强后恢复原图；新增“坂道串烧”并放到最后 | `public/special-covers/solo.jpg` 高清化；`public/special-covers/sakamichi.png` 恢复原图；`lib/specialSongGroups.ts` 合并两条链接为“坂道串烧” |
| 访问计数修正 | 刷新/重开站点不累计，逻辑错误 | `VisitCounter.tsx` 改为“仅站内主动跳转不计数，其他进入方式与刷新都 +1”；新增 `lib/visitNavigation.ts` 给站内 `<a>` / `Link` / 搜索跳转打标，避免误计数 |
| V6 版本登记 | 用户要求清零当前访问次数，并把当前版本记为 `V6` | `VisitCounter.tsx` 的计数键切换到 `hitsuji.visit.v6.count`，旧 `v4` 计数一并清理；新增 `snapshots/V6/*`，本交接文档顶部状态与快照索引同步更新 |
| 真实访问计数升级 | 用户要求把累计访问次数改成全站真实访问数 | 移除 `next.config.mjs` 中的 `output:'export'`；新增 `app/api/visit/route.ts` 和 `lib/visitStore.ts`；`VisitCounter.tsx` 改为请求服务端接口，服务端用 session cookie 去重并把总数持久化到 Upstash Redis / Vercel KV 兼容环境变量；部署主路线切换为 GitHub + Vercel |

*文档维护提示：本项目 UI 已迭代 30+ 轮。下次大改后请同步更新本文件对应章节，尤其是 §1 现状、§3.2 分组计数、§7 已实现功能、§13 最近改动。*
