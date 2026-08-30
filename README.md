# 咩咩坂46 / HITSUJIZAKA46

网站希望把分散的演出内容整理成一条更容易浏览、检索与回看的路径：第一次进入的人可以快速理解内容结构，已经熟悉站点的人也能直接跳到目标曲目、目标分组或目标页面。

本项目为非官方、非商业性质的资料整理与展示站点。站内提及的图片、音频、视频与相关素材，其权利归原权利方所有；如有需要补充说明、修正信息或移除内容，请联系仓库维护者。

## 站点地址

- 正式站点: `https://www.hitsujizaka46.com`
- 主域名跳转: `https://hitsujizaka46.com`
- Vercel 备用地址: `https://hitsujizaka46.vercel.app`

## 站点内容

当前站点主要包含以下部分：

- 首页导览、品牌标题与常驻背景音乐
- 毕业公演「制服与太阳」主图与曲目列表
- `公演舞台` 四个分组卡片与对应详情页
- `特殊舞台` 四个出处分组与对应详情页
- 桌面端与移动端搜索
- 曲目展开、详情跳转与外链观看入口
- 顶部真实全站访问计数

## 技术栈

- [Next.js](https://nextjs.org/) 14
- [React](https://react.dev/) 18
- [TypeScript](https://www.typescriptlang.org/)
- CSS Modules 之外的全局组件样式组织
- [Upstash Redis](https://upstash.com/) 真实访问计数存储
- `GitHub + Vercel + Cloudflare` 部署链路

## 项目结构

```text
hitsujizaka46/
├── README.md
├── UX_REVIEW_AND_ROADMAP_2026-08-29.md
└── web/
    ├── package.json
    ├── next.config.mjs
    ├── public/
    └── src/
        ├── app/
        ├── components/
        ├── data/
        └── lib/
```

- `web/` 是实际网站项目目录
- `web/src/app/` 放路由与页面入口
- `web/src/components/` 放首页与详情页的主要组件
- `web/src/data/site.json` 是当前前端消费的核心数据文件
- `UX_REVIEW_AND_ROADMAP_2026-08-29.md` 记录一版系统性的 UX/UI 评审与路线图

> 项目交接文档与本地辅助脚本不在本公开仓库中发布；仓库内仅保留站点源码、运行说明和 UX 文档。

## 本地开发

### 环境要求

- Node.js `20+`
- npm

### 启动开发服务器

```bash
cd web
npm install
npm run dev
```

默认访问地址：

```text
http://localhost:3000
```

### 生产构建与本地预览

```bash
cd web
npm run build
npm run start
```

## 常用命令

| 命令 | 用途 |
|---|---|
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产构建后的本地预览 |

## 真实访问计数

顶部“累计访问次数”不是浏览器本地计数，而是全站共享计数。

当前实现方式：

- 前端请求 `/api/visit`
- 服务端通过 `session cookie` 做单次访问去重
- 计数总值持久化到 `Upstash Redis`

支持的环境变量：

```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

也兼容旧命名：

```bash
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

如果通过 Vercel 的 `Upstash for Redis` 集成接入项目，通常不需要手动填写。

## 部署

当前推荐部署方式：

- 代码托管：`GitHub`
- 应用部署：`Vercel`
- 域名与 DNS：`Cloudflare`
- 访问计数存储：`Upstash Redis`

Vercel 关键配置：

- `Framework Preset`: `Next.js`
- `Root Directory`: `web`
- `Build Command`: 默认
- `Output Directory`: 默认

Cloudflare 侧将主域名和 `www` 指向 Vercel 提供的目标记录即可，HTTPS 证书由 Vercel 自动签发。

## 迭代方式

推荐工作流：

1. 在 `main` 之外创建新分支开发
2. 推送到 GitHub 后让 Vercel 自动生成预览部署
3. 预览确认无误后合并到 `main`
4. Vercel 自动更新正式站点

## 参与方式

这是一个公开仓库，但最终合并由仓库维护者控制。

如果你想参与：

- 提 `Issue`
- 提 `Pull Request`
- 提交交互、样式、内容组织或工程改进建议

## 补充文档

- UX 路线图：[UX_REVIEW_AND_ROADMAP_2026-08-29.md](./UX_REVIEW_AND_ROADMAP_2026-08-29.md)
