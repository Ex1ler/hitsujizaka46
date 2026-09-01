import '@fontsource/noto-serif-sc/400.css';
import '@fontsource/noto-serif-sc/600.css';
import '@fontsource/noto-serif-sc/700.css';
import '@fontsource/noto-sans-sc/400.css';
import '@fontsource/noto-sans-sc/500.css';
import '@fontsource/noto-sans-sc/700.css';
import './globals.css';
import './_font_optional.css';
import type { Metadata, Viewport } from 'next';
import SakuraPetals from '@/components/SakuraPetals';
import BgmPlayer from '@/components/BgmPlayer';
import MobileSearchDock from '@/components/MobileSearchDock';
import ScrollHint from '@/components/ScrollHint';
import FxObserver from '@/components/FxObserver';

export const metadata: Metadata = {
  title: '咩咩坂46',
  description:
    '王晓阳公演直拍、单曲及相关舞台收录 · 内容整理自 B 站 UP 主的公演 / 直拍 / 单曲投稿。',
};

export const viewport: Viewport = {
  themeColor: '#63b853',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="/fonts" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/noto-serif-sc-80-600-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/noto-serif-sc-119-700-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <SakuraPetals />
        <BgmPlayer />
        <MobileSearchDock />
        <ScrollHint />
        <FxObserver />
      </body>
    </html>
  );
}
