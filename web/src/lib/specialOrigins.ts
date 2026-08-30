// 特殊舞台曲目 → 出处分组映射
// 注意：此处出处为「最佳认知整理的初始版」，可能含个别待核对项。
// 如需修正，只需改本文件这一处映射即可，无需改动任何组件。
// 分组顺序即卡片展示顺序。

export type SpecialOrigin =
  | 'AKB48'
  | 'Sakamichi'
  | 'Solo'
  | 'Other';

export const ORIGIN_ORDER: SpecialOrigin[] = [
  'Solo',
  'AKB48',
  'Sakamichi',
  'Other',
];

export const ORIGIN_LABEL: Record<SpecialOrigin, string> = {
  AKB48: '开闭系',
  Sakamichi: '坂道系',
  Solo: '个人单曲',
  Other: '其他',
};

// 不希望在特殊舞台页面显示的占位/合集项
export const HIDDEN_SPECIAL_SONGS = new Set<string>(['现场音源版 合集']);

// 同一首歌的不同写法 → 规范化展示名（数据中出现了多次，仅展示一次并合并演出）
export const SONG_ALIASES: Record<string, string> = {
  '十一月的脚链': '11月的脚链',
};

export function normalizeSongName(name: string): string {
  return SONG_ALIASES[name] ?? name;
}

// 歌曲名（与 site.json 中 special.songs[].name 完全一致）→ 出处
export const specialOrigins: Record<string, SpecialOrigin> = {
  // ── AKB48 本家曲 ──
  'Baby!Baby!Baby!': 'AKB48',
  '好想见到你': 'AKB48',
  '拉布拉多寻回犬': 'AKB48',
  'Flying Get': 'AKB48',
  '魅夜蝶影': 'AKB48',
  '制服の抵抗': 'AKB48',
  '天使的尾巴': 'AKB48',
  'Blue Rose': 'AKB48',
  '糖果': 'AKB48',
  'UZA': 'AKB48',
  'Confession': 'AKB48',
  '为了谁': 'AKB48',
  'So Long': 'AKB48',
  '勇往直前': 'AKB48',
  '制服抵抗': 'AKB48',
  '制服的抵抗': 'AKB48',
  '恋爱决堤警报': 'AKB48',
  '坏路姬': 'AKB48',
  '落幕': 'AKB48',
  '拉链': 'AKB48',
  '既然喜欢 对你依然': 'AKB48',
  'Beginner': 'AKB48',
  'Bubble Gum': 'AKB48',
  '毫无根据的Rumor': 'AKB48',
  'Reset': 'AKB48',
  'Glory Days': 'AKB48',
  'Panorama': 'AKB48',
  '11月的脚链': 'AKB48',
  '马路须加摇滚': 'AKB48',
  'Rumor': 'AKB48',
  '十一月的脚链': 'AKB48',
  '我们不战斗': 'AKB48',
  '拜托了美乐蒂': 'AKB48',
  '下课钟Love Song': 'AKB48',
  '最强马尾辫': 'AKB48',
  'Masaka no Confession': 'AKB48',
  '泪的表面张力': 'AKB48',
  '远距离海报': 'AKB48',
  '万圣节之夜': 'AKB48',
  '恋爱水族馆': 'AKB48',
  '千秋令': 'AKB48',
  '狼与自尊': 'AKB48',
  '玻璃般的我爱你': 'AKB48',
  '你看见夕阳了吗？': 'AKB48',
  '未来的果实': 'AKB48',
  '捏脸蛋': 'AKB48',
  'Colorcon Wink': 'AKB48',
  '仲夏的Sounds good!': 'AKB48',
  'BINGO!': 'AKB48',
  'Moment Ring': 'AKB48',
  '这么可爱真是抱歉': 'AKB48',
  '想绕远路回家': 'AKB48',
  '海边的CHERRY': 'AKB48',
  '47条美丽的街': 'AKB48',
  '才不是鳄梨': 'AKB48',
  '雨中动物园': 'AKB48',
  '搬家了': 'AKB48',
  '君と僕の関係': 'AKB48',
  'わるきー': 'AKB48',
  '杏仁羊角包计划': 'AKB48',
  '关于你': 'AKB48',
  '梦之路': 'AKB48',
  '可以做你的女友吗': 'AKB48',
  '洄游鱼的容积': 'AKB48',
  '希望的副歌': 'AKB48',
  '没有国境的时代': 'AKB48',
  '真好呢！': 'AKB48',
  '马尾与发圈': 'AKB48',
  '久违的唇彩': 'AKB48',
  '24/7 Shining': 'AKB48', // 实为 AKB48 Team TP 原创，暂归入 AKB48
  'Oh My Pumpkin!': 'AKB48',
  '未散落的樱': 'AKB48',
  '恋爱幸运饼干': 'AKB48',
  '闪亮的幸运': 'AKB48',
  '借口而已Maybe': 'AKB48',
  '天灯愿': 'AKB48',

  // ── 坂道系列 ──
  '二人季节': 'Sakamichi',
  'キュン': 'Sakamichi',
  '世界には愛しかない': 'Sakamichi',
  '世界只有爱': 'Sakamichi',
  '沉默的大多数': 'Sakamichi',

  // ── 个人单曲 ──
  'Chocolate♡Love': 'Solo',

  // ── 其他（未明确出处 / 来源较少的合集，单独成卡） ──
  // 以下为已确认的「其他」项；其余未在本文件映射的曲目也会默认归入「其他」。
  '回响': 'Other',
  'Snow halation': 'Other',
  '夏色笑容1,2,Jump!': 'Other',
};
