"use client";

import { useEffect, useState } from "react";

// Texture packs for the site, cycled like Minecraft resource packs.
const SKINS = ["overworld", "nether", "end", "deepslate"] as const;
type Skin = (typeof SKINS)[number];
const LABELS: Record<Skin, string> = {
  overworld: "Overworld",
  nether: "Nether",
  end: "The End",
  deepslate: "Deepslate",
};

export default function SkinPicker() {
  const [skin, setSkin] = useState<Skin>("overworld");

  useEffect(() => {
    const saved = localStorage.getItem("lb-skin") as Skin | null;
    if (saved && SKINS.includes(saved)) setSkin(saved);
  }, []);

  const cycle = () => {
    const next = SKINS[(SKINS.indexOf(skin) + 1) % SKINS.length];
    setSkin(next);
    localStorage.setItem("lb-skin", next);
    if (next === "overworld") delete document.documentElement.dataset.skin;
    else document.documentElement.dataset.skin = next;
  };

  return (
    <button
      type="button"
      onClick={cycle}
      title={`Skin: ${LABELS[skin]}. Click to change.`}
      aria-label={`Change site skin, current: ${LABELS[skin]}`}
      className="inline-flex items-center gap-1.5 text-sm text-mcgray transition-colors hover:text-white"
    >
      <span
        aria-hidden
        className="inline-block size-3.5 border-2 border-black"
        style={{ background: "var(--btn-primary, #46a32e)" }}
      />
      <span className="hidden sm:inline">{LABELS[skin]}</span>
    </button>
  );
}
