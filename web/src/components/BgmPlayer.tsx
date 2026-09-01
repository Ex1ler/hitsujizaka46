'use client';

import { useEffect, useRef, useState } from 'react';
import './BgmPlayer.css';

// 播放器上展示的名称（仅保留 PRIDE）
const DISPLAY_NAME = 'PRIDE';
// 音量（用户要求 0.3，范围 0~1）
const VOLUME = 0.3;
// 文件标注为「自1.5秒起5分14秒」，总时长兜底显示 05:14（314s），实际以音频元数据为准
const FALLBACK_DURATION = 314;

function fmt(t: number): string {
  if (!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function BgmPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // 用户是否主动暂停（用于区分「自动播放被拦截」与「用户暂停」，避免补播误触发）
  const userPausedRef = useRef(false);
  // 是否已成功起播过（成功后移除全局补播监听，杜绝重复/取消）
  const startedRef = useRef(false);
  // 保存全局补播回调，便于在起播后移除监听
  const kickRef = useRef<(e: Event) => void>(() => {});
  // 是否正在拖动进度条（拖动期间 timeupdate 不回写，避免手柄被拉回开头）
  const draggingRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 780px)');
    setCollapsed(mq.matches);
    const onChange = (e: MediaQueryListEvent) => {
      setCollapsed(e.matches);
    };
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  const KICK_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'wheel', 'mousemove'];
  const removeKick = () => {
    KICK_EVENTS.forEach((ev) => window.removeEventListener(ev, kickRef.current));
  };

  // 首屏尝试自动播放（带声音，保持非静音）。
  // 浏览器策略会拦截「带声音」的冷启动自动播放；此时不强制静音，
  // 而是保持播放器非静音状态，在用户首次交互（点击/按键/触摸/滚动/滚轮/移动鼠标）时再起播。
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = VOLUME;

    let gestureFired = false;

    const ensurePlaying = () => {
      if (startedRef.current || userPausedRef.current) return;
      const p = a.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };

    // 首次交互：起播（保持非静音），随后移除所有监听
    const onFirstGesture = (e?: Event) => {
      if (gestureFired) return;
      // 播放器内部控件的手势交给组件自身的 onClick 处理
      const t = e?.target as HTMLElement | null;
      if (t && containerRef.current && containerRef.current.contains(t)) return;
      gestureFired = true;
      if (!userPausedRef.current) ensurePlaying();
      removeKick();
    };
    kickRef.current = onFirstGesture;

    KICK_EVENTS.forEach((ev) =>
      window.addEventListener(ev, onFirstGesture, { passive: true }),
    );

    // 首屏直接尝试（带声音、非静音）自动播放
    ensurePlaying();

    return removeKick;
  }, []);

  // 同步音频状态到 React；首次成功起播后移除全局补播监听
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onTime = () => {
      // 拖动中不回写当前时间，否则手柄会跳回播放位置（表现为"跳回开头"）
      if (!draggingRef.current) setCur(a.currentTime);
    };
    const onMeta = () => setDur(a.duration);
    const onPlay = () => {
      setPlaying(true);
      startedRef.current = true;
      // 成功起播后不再需要首播补播监听
      removeKick();
    };
    const onPause = () => setPlaying(false);

    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('durationchange', onMeta);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);

    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('durationchange', onMeta);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      removeKick();
    };
  }, []);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      userPausedRef.current = false;
      const p = a.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } else {
      userPausedRef.current = true;
      a.pause();
    }
  };

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  };

  const seekValRef = useRef(0);

  // 拖动/点击时即时写入 currentTime，点击和拖动都立即生效；
  // draggingRef 负责阻止 timeupdate 在拖动期间把手柄写回播放位置。
  const onSeek = (e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>) => {
    const v = Number(e.currentTarget.value);
    const a = audioRef.current;
    if (!isFinite(v)) return;
    draggingRef.current = true;
    seekValRef.current = v;
    setCur(v);
    if (a) a.currentTime = v;
  };

  // 拖动开始/键盘操作中：锁定，timeupdate 不回写
  const onScrubStart = () => { draggingRef.current = true; };

  // 松开（鼠标/触摸/键盘抬起）后解除锁定，让 timeupdate 恢复驱动 UI
  const finishScrub = () => {
    const a = audioRef.current;
    draggingRef.current = false;
    if (!a || !isFinite(seekValRef.current)) return;
    a.currentTime = seekValRef.current;
    setCur(seekValRef.current);
  };

  const total = dur || FALLBACK_DURATION;
  const pct = total > 0 ? (cur / total) * 100 : 0;

  if (collapsed) {
    return (
      <div className="bgm is-collapsed" aria-label="背景音乐播放器" ref={containerRef}>
        <audio ref={audioRef} loop preload="auto">
          <source src="/bgm.m4a" type="audio/mp4" />
          <source src="/bgm.mp3" type="audio/mpeg" />
        </audio>
        <button
          type="button"
          className="bgm-fold"
          onClick={() => setCollapsed(false)}
          aria-label="展开背景音乐"
          title="展开背景音乐"
        >
          <img src="/bgm-icon.webp" alt="" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="bgm" aria-label="背景音乐播放器" ref={containerRef}>
      <audio ref={audioRef} loop preload="auto">
        <source src="/bgm.m4a" type="audio/mp4" />
        <source src="/bgm.mp3" type="audio/mpeg" />
      </audio>

      <button
        type="button"
        className="bgm-btn bgm-fold"
        onClick={() => setCollapsed(true)}
        aria-label="收起背景音乐"
        title="收起背景音乐"
      >
        <img src="/bgm-icon.webp" alt="" aria-hidden="true" />
      </button>

      <button
        className="bgm-btn bgm-play"
        onClick={togglePlay}
        aria-label={playing ? '暂停' : '播放'}
        title={playing ? '暂停' : '播放'}
      >
        {playing ? (
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1.2" />
            <rect x="14" y="5" width="4" height="14" rx="1.2" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
            <path d="M8 5.5v13a1 1 0 0 0 1.54.84l10.5-6.5a1 1 0 0 0 0-1.68L9.54 4.66A1 1 0 0 0 8 5.5z" />
          </svg>
        )}
      </button>

      <div className="bgm-main">
        <div className="bgm-top">
          <span className="bgm-name">{DISPLAY_NAME}</span>
          <span className="bgm-time">
            {fmt(cur)} / {fmt(total)}
          </span>
        </div>
        <input
          className="bgm-range"
          type="range"
          min={0}
          max={total}
          step={0.1}
          value={Math.min(cur, total)}
          onInput={onSeek}
          onChange={onSeek}
          onPointerDown={onScrubStart}
          onPointerUp={finishScrub}
          onPointerCancel={finishScrub}
          onKeyDown={onScrubStart}
          onKeyUp={finishScrub}
          onBlur={finishScrub}
          style={{ ['--p' as any]: `${pct}%` }}
          aria-label="播放进度"
        />
      </div>

      <button
        className={`bgm-btn bgm-mute${muted ? ' is-muted' : ''}`}
        onClick={toggleMute}
        aria-label={muted ? '取消静音' : '静音'}
        title={muted ? '取消静音' : '静音'}
      >
        {muted ? (
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
            <line x1="16" y1="9" x2="21" y2="15" />
            <line x1="21" y1="9" x2="16" y2="15" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 6a8.5 8.5 0 0 1 0 12" />
          </svg>
        )}
      </button>
    </div>
  );
}
