"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { sfxExplosion, sfxLevelUp } from "@/lib/sound";

// Block-break palette: grass, dirt, stone, plus gold and spark accents.
const DEBRIS_COLORS = [
  "#5bba3a", "#4a9e2d", "#6fd14b",
  "#79553a", "#5e4127", "#8a6142",
  "#7d7d7d", "#4f4f4f",
  "#ffd83d", "#ffffff",
];
const SMOKE_COLORS = ["#9a9a9a", "#6f6f6f", "#c9c9c9"];

type Debris = {
  x: number; y: number; vx: number; vy: number;
  size: number; color: string; life: number;
};
type Smoke = {
  x: number; y: number; vx: number; vy: number;
  size: number; color: string; life: number;
};

// TNT moment after spawning: the block "breaks" into shrinking pixel debris
// with gravity, smoke puffs drift up, and the screen kicks like a blast.
export default function SpawnCelebration() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    sfxExplosion();
    setTimeout(sfxLevelUp, 380);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      document.body.classList.add("screen-shake");
      setTimeout(() => document.body.classList.remove("screen-shake"), 500);
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 3;

    // Debris: dense core burst, like a block shattering into mini-cubes
    const debris: Debris[] = Array.from({ length: reduced ? 0 : 220 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 13;
      return {
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        size: 6 + Math.floor(Math.random() * 3) * 4,
        color: DEBRIS_COLORS[Math.floor(Math.random() * DEBRIS_COLORS.length)],
        life: 55 + Math.random() * 50,
      };
    });

    // Smoke: a few slow gray squares that grow and drift upward
    const smoke: Smoke[] = Array.from({ length: reduced ? 0 : 16 }, () => ({
      x: cx + (Math.random() - 0.5) * 90,
      y: cy + (Math.random() - 0.5) * 60,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -0.6 - Math.random() * 1.2,
      size: 10 + Math.random() * 14,
      color: SMOKE_COLORS[Math.floor(Math.random() * SMOKE_COLORS.length)],
      life: 70 + Math.random() * 40,
    }));

    let frame = 0;
    let raf = 0;
    const snap = (v: number) => Math.round(v / 4) * 4;

    const tick = () => {
      frame++;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      let alive = false;

      for (const p of smoke) {
        if (frame > p.life) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.size += 0.25; // smoke expands as it fades
        ctx.globalAlpha = Math.max(0, 0.5 * (1 - frame / p.life));
        ctx.fillStyle = p.color;
        ctx.fillRect(snap(p.x), snap(p.y), snap(p.size), snap(p.size));
      }

      for (const p of debris) {
        if (frame > p.life) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.38; // gravity
        p.vx *= 0.99;
        // mini-cubes shrink as they die, like MC break particles
        const size = Math.max(2, p.size * (1 - (frame / p.life) * 0.7));
        ctx.globalAlpha = Math.max(0, 1 - (frame / p.life) ** 2);
        ctx.fillStyle = p.color;
        ctx.fillRect(snap(p.x), snap(p.y), size, size);
      }

      ctx.globalAlpha = 1;
      if (alive) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // drop ?spawned=1 so refreshes don't re-explode
    router.replace(pathname, { scroll: false });

    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove("screen-shake");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 size-full"
    />
  );
}
