// 咩咩坂46 · 数据类型

export interface Perf {
  date: string;
  title: string;
  url: string;
  bvid: string;
}
export interface Song {
  name: string;
  perfs: Perf[];
}
export interface Spotlight {
  name: string;
  count: number;
}
export interface Region {
  name: string;
  kind: 'stage' | 'special';
  songCount: number;
  perfCount: number;
  songs: Song[];
  spotlight?: Spotlight | null;
}
export interface GradSong {
  name: string;
  bvid: string;
  url: string;
  title: string;
  date: string;
}
export interface GradFull {
  bvid: string;
  url: string;
  title: string;
}
export interface Totals {
  regions: number;
  songs: number;
  perfs: number;
  videos: number;
  coverage: number;
}
export interface SiteData {
  hero: { bvid: string; title: string; url: string };
  graduation: {
    name: string;
    date: string;
    songs: GradSong[];
    full: GradFull[];
  };
  regions: Region[];
  totals: Totals;
  generated: string;
}
