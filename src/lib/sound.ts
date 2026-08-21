"use client";

// Minecraft-STYLE audio, synthesized with WebAudio. No Mojang assets are
// shipped (game sounds and C418's music are copyrighted); these are original
// blips, booms, and an original calm chiptune loop in that spirit.

let ctx: AudioContext | null = null;
let musicTimer: ReturnType<typeof setInterval> | null = null;
let musicGain: GainNode | null = null;

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

// Original calm loop: slow broken chords, very quiet. Two bars, loops forever.
const CHORDS: number[][] = [
  [261.63, 329.63, 392.0, 493.88], // Cmaj7
  [220.0, 261.63, 329.63, 415.3], // Am(maj-ish)
  [174.61, 261.63, 349.23, 440.0], // F add
  [196.0, 293.66, 392.0, 493.88], // G add
];

export function startMusic() {
  if (!soundOn() || musicTimer) return;
  const a = audio();
  if (!a) return;
  musicGain ??= a.createGain();
  musicGain.gain.value = 1;
  let step = 0;
  const playChord = () => {
    const notes = CHORDS[step % CHORDS.length];
    notes.forEach((f, i) => {
      const osc = a.createOscillator();
      const g = a.createGain();
      osc.type = "triangle";
      osc.frequency.value = f;
      const t = a.currentTime + i * 0.45;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.022, t + 0.8);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3.6);
      osc.connect(g).connect(musicGain!).connect(a.destination);
      osc.start(t);
      osc.stop(t + 3.8);
    });
    step++;
  };
  playChord();
  musicTimer = setInterval(playChord, 4000);
}

export function stopMusic() {
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
}
