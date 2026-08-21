"use client";

import { useEffect, useState } from "react";
import { MeshGradient } from "@paper-design/shaders-react";

// Monochrome mesh-gradient mist behind the hero (Paper shaders).
// Client-only: rendered after mount so SSR ships nothing.
export default function HeroShader() {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (!mounted) return null;

  return (
    <MeshGradient
      colors={["#09090b", "#17171c", "#232330", "#3c3c4a", "#101014"]}
      distortion={0.8}
      swirl={0.6}
      grainOverlay={0.06}
      speed={reducedMotion ? 0 : 0.15}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
