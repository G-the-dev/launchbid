"use client";

// SFX are Minecraft-STYLE audio synthesized with WebAudio (original blips
// and booms, no game assets). Background music plays the owner-supplied
// /public/music.mp3 on a raw loop.

let ctx: AudioContext | null = null;

const KEY = "lb-sound";

export function soundOn(): boolean {
  if (typeof window === "undefined") return false;
  return (localStorage.getItem(KEY) ?? "on") === "on";
}

export function setSoundOn(on: boolean) {
  localStorage.setItem(KEY, on ? "on" : "off");
  if (on) startMusic();
  else stopMusic();
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  at: number,
  dur: number,
  type: OscillatorType,
  peak: number
) {
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, a.currentTime + at);
  gain.gain.linearRampToValueAtTime(peak, a.currentTime + at + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + at + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(a.currentTime + at);
  osc.stop(a.currentTime + at + dur + 0.02);
}

// UI click: the short dry "clack"
export function sfxClick() {
  if (!soundOn()) return;
  tone(720, 0, 0.055, "square", 0.06);
  tone(360, 0.01, 0.05, "square", 0.04);
}

// Success: ascending xp-style chime
export function sfxLevelUp() {
  if (!soundOn()) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
    tone(f, i * 0.09, 0.28, "sine", 0.09)
  );
}

// Spawn celebration: a boom of filtered noise
export function sfxExplosion() {
  if (!soundOn()) return;
  const a = audio();
  if (!a) return;
  const dur = 0.9;
  const buffer = a.createBuffer(1, a.sampleRate * dur, a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
  }
  const src = a.createBufferSource();
  src.buffer = buffer;
  const filter = a.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(900, a.currentTime);
  filter.frequency.exponentialRampToValueAtTime(80, a.currentTime + dur);
  const gain = a.createGain();
  gain.gain.value = 0.35;
  src.connect(filter).connect(gain).connect(a.destination);
  src.start();
}

// Background music: /public/music.mp3, looped raw with no fades.
// Position persists across refreshes so playback resumes mid-track instead
// of restarting: a refresh feels like a pause, not a reset.
let musicEl: HTMLAudioElement | null = null;
const POS_KEY = "lb-music-pos";

export function startMusic() {
  if (!soundOn()) return;
  if (!musicEl) {
    musicEl = new Audio("/music.mp3");
    musicEl.loop = true;
    musicEl.volume = 0.45;
    musicEl.preload = "auto";
    const saved = Number(localStorage.getItem(POS_KEY) ?? 0);
    if (saved > 0) {
      musicEl.addEventListener(
        "loadedmetadata",
        () => {
          if (musicEl && saved < musicEl.duration) musicEl.currentTime = saved;
        },
        { once: true }
      );
    }
    const savePos = () => {
      if (musicEl && !musicEl.paused) {
        localStorage.setItem(POS_KEY, String(musicEl.currentTime));
      }
    };
    setInterval(savePos, 5000);
    window.addEventListener("pagehide", savePos);
  }
  if (!musicEl.paused) return; // already playing, don't restart the loop
  void musicEl.play().catch(() => {
    // Autoplay blocked until a user gesture; SoundControl keeps retrying.
  });
}

export function stopMusic() {
  musicEl?.pause();
}
