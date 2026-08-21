"use client";

import { useEffect, useState } from "react";
import { GrainGradient } from "@paper-design/shaders-react";

// Subtle dark grain-gradient wave behind the hero (Paper shaders).
// Client-only: rendered after mount so SSR ships nothing.
export default function HeroShader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <GrainGradient
      colorBack="#09090b"
      colors={["#1b1b21", "#26262e", "#33333d"]}
      shape="wave"
      softness={0.75}
      intensity={0.3}
      noise={0.2}
      speed={0.7}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
