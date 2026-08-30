'use client';

import { useEffect, useRef } from 'react';
import './SakuraPetals.css';

interface Petal {
  x: number;
  y: number;
  size: number;
  vy: number;
  vx: number;
  sway: number;
  swaySpeed: number;
  swayPhase: number;
  rotate: number;
  rotateSpeed: number;
  color: string;
  opacity: number;
}

// 柔和配色：白 / 淡粉 / 极淡粉（贴合绿白侘寂，不艳）
const COLORS = [
  '255,255,255',
  '255,205,215',
  '255,224,230',
];

const PETAL_COUNT = 20; // 稀疏，不喧宾夺主

export default function SakuraPetals() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let petals: Petal[] = [];
    let w = 0;
    let h = 0;

    function resize() {
      w = canvas!.width = window.innerWidth;
      h = canvas!.height = window.innerHeight;
    }

    function initPetals() {
      petals = Array.from({ length: PETAL_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 5 + Math.random() * 7,
        vy: 0.35 + Math.random() * 0.7,
        vx: -0.25 + Math.random() * 0.5,
        sway: 0.5 + Math.random() * 1.4,
        swaySpeed: 0.008 + Math.random() * 0.018,
        swayPhase: Math.random() * Math.PI * 2,
        rotate: Math.random() * Math.PI * 2,
        rotateSpeed: -0.02 + Math.random() * 0.04,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: 0.32 + Math.random() * 0.38,
      }));
    }

    function drawPetal(p: Petal) {
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rotate);
      ctx!.globalAlpha = p.opacity;
      const r = p.size;
      // 5 瓣樱花（5 个椭圆花瓣围绕中心）
      ctx!.fillStyle = `rgba(${p.color},1)`;
      for (let i = 0; i < 5; i++) {
        ctx!.rotate((Math.PI * 2) / 5);
        ctx!.beginPath();
        ctx!.ellipse(0, -r * 0.68, r * 0.3, r * 0.6, 0, 0, Math.PI * 2);
        ctx!.fill();
      }
      // 花蕊
      ctx!.beginPath();
      ctx!.fillStyle = 'rgba(255,238,175,0.85)';
      ctx!.arc(0, 0, r * 0.16, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.restore();
    }

    function tick() {
      ctx!.clearRect(0, 0, w, h);
      for (const p of petals) {
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.swayPhase) * p.sway * 0.5;
        p.swayPhase += p.swaySpeed;
        p.rotate += p.rotateSpeed;

        if (p.y > h + 24) {
          p.y = -24;
          p.x = Math.random() * w;
        }
        if (p.x > w + 24) p.x = -24;
        if (p.x < -24) p.x = w + 24;

        drawPetal(p);
      }
      raf = requestAnimationFrame(tick);
    }

    resize();
    initPetals();
    tick();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="sakura-canvas" aria-hidden="true" />;
}