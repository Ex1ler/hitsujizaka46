import type { Song, Perf } from './types';
import { normalizeSongName, type SpecialOrigin } from './specialOrigins';

const SAKAMICHI_MEDLEY_NAMES = new Set(['キュン', '世界には愛しかない']);
const SAKAMICHI_MEDLEY_TITLE = '坂道串烧';

function dedupePerfs(perfs: Perf[]): Perf[] {
  const seen = new Set<string>();
  const out: Perf[] = [];
  for (const perf of perfs) {
    const key = perf.bvid || perf.url || `${perf.date}-${perf.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(perf);
  }
  return out;
}

export function mergeSpecialSongs(origin: SpecialOrigin, input: Song[]): Song[] {
  const songsByName = new Map<string, Song>();

  for (const song of input) {
    const canon = normalizeSongName(song.name);
    const existing = songsByName.get(canon);
    if (existing) {
      existing.perfs = existing.perfs.concat(song.perfs);
    } else {
      songsByName.set(canon, { ...song, name: canon, perfs: [...song.perfs] });
    }
  }

  const songs = [...songsByName.values()];
  if (origin !== 'Sakamichi') return songs;

  const medleySongs = songs.filter(song => SAKAMICHI_MEDLEY_NAMES.has(song.name));
  if (!medleySongs.length) return songs;

  const merged: Song = {
    name: SAKAMICHI_MEDLEY_TITLE,
    perfs: dedupePerfs(medleySongs.flatMap(song => song.perfs)),
  };

  const rest = songs.filter(song => !SAKAMICHI_MEDLEY_NAMES.has(song.name));
  return [...rest, merged];
}
