"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { sfxExplosion, sfxLevelUp } from "@/lib/sound";

const COLORS = ["#5bba3a", "#ffd83d", "#ffffff", "#79553a", "#ff5555", "#7ab8ff"];

// TNT moment after spawning: pixel debris across the whole screen, then gone.
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
    setTimeout(sfxLevelUp, 350);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 3;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particles = Array.from({ length: reduced ? 0 : 160 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 11;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: 4 + Math.floor(Math.random() * 3) * 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 60 + Math.random() * 40,
      };
    });

    let frame = 0;
    let raf = 0;
    const tick = () => {
      frame++;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      let alive = false;
      for (const p of particles) {
        if (frame > p.life) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.99;
        ctx.globalAlpha = Math.max(0, 1 - frame / p.life);
        ctx.fillStyle = p.color;
        // snap to a pixel grid so the debris stays blocky
        ctx.fillRect(Math.round(p.x / 4) * 4, Math.round(p.y / 4) * 4, p.size, p.size);
      }
      ctx.globalAlpha = 1;
      if (alive) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // drop ?spawned=1 so refreshes don't re-explode
    router.replace(pathname, { scroll: false });

    return () => cancelAnimationFrame(raf);
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
