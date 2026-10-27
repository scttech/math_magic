// Shared "juice" for every correct/incorrect answer in the app: a tiny
// synthesized tone (Web Audio API — no audio asset files, consistent with
// the rest of the site having zero dependencies) plus a short CSS animation.
// Every call site already toggles a `correct`/`incorrect` class on a
// `.feedback` or `.choice-btn` element (skillRunner.js, quizView.js,
// lessonView.js) — this just layers sound and motion on top of that
// existing pattern, no new markup required.
const SOUND_ENABLED_KEY = 'mathmagic.soundEnabled';

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(frequency, startTime, duration, type = 'sine') {
  const ctx = getAudioContext();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.15, ctx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(ctx.currentTime + startTime);
  oscillator.stop(ctx.currentTime + startTime + duration);
}

export function isSoundEnabled() {
  const stored = localStorage.getItem(SOUND_ENABLED_KEY);
  return stored === null ? true : stored === 'true';
}

export function setSoundEnabled(enabled) {
  localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
}

/** A short rising two-note chime. */
export function playCorrectSound() {
  if (!isSoundEnabled()) return;
  try {
    playTone(523.25, 0, 0.12, 'sine'); // C5
    playTone(783.99, 0.08, 0.18, 'sine'); // G5
  } catch {
    // Web Audio can throw in unusual environments (e.g. blocked autoplay policy) — never let a sound glitch break the app.
  }
}

/** A single short low buzz. */
export function playIncorrectSound() {
  if (!isSoundEnabled()) return;
  try {
    playTone(164.81, 0, 0.25, 'sawtooth'); // E3
  } catch {
    // See playCorrectSound.
  }
}

const ANIMATION_CLASS = { true: 'fx-correct-pop', false: 'fx-incorrect-shake' };

/** Adds a brief pop/shake animation class to `el`, re-triggering it even if it's already mid-animation. */
export function animateFeedback(el, isCorrect) {
  if (!el) return;
  const className = ANIMATION_CLASS[isCorrect];
  el.classList.remove('fx-correct-pop', 'fx-incorrect-shake');
  // Force a reflow so re-adding the same class restarts the animation.
  void el.offsetWidth;
  el.classList.add(className);
}
