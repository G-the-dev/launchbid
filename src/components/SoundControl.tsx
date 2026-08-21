"use client";

import { useEffect, useState } from "react";
import { setSoundOn, sfxClick, soundOn, startMusic } from "@/lib/sound";

// One switch for everything audible: UI clicks, jingles, background loop.
// Music can only start after a user gesture (browser policy), so we arm it
// on the first click anywhere.
export default function SoundControl() {
  const [on, setOn] = useState(true);

  useEffect(() => {
    setOn(soundOn());

    const armMusic = () => {
      if (soundOn()) startMusic();
    };
    const clickSfx = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(".mc-btn, button, a")) sfxClick();
    };
    window.addEventListener("pointerdown", armMusic, { once: true });
    window.addEventListener("click", clickSfx);
    return () => {
      window.removeEventListener("pointerdown", armMusic);
      window.removeEventListener("click", clickSfx);
    };
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    setSoundOn(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Mute sound and music" : "Unmute sound and music"}
      title={on ? "Sound on" : "Sound off"}
      className="pixel-text text-base text-mcgray transition-colors hover:text-white"
    >
      {on ? "🔊" : "🔇"}
    </button>
  );
}
