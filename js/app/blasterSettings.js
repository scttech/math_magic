// Math Blaster's one site-wide setting: how many answer bubbles fall per
// question (1 correct + the rest distractors). Same localStorage-backed
// pattern as feedbackFx.js's sound toggle.
const BUBBLE_COUNT_KEY = 'mathmagic.blasterBubbleCount';

export const MIN_BUBBLE_COUNT = 4;
export const MAX_BUBBLE_COUNT = 8;
export const DEFAULT_BUBBLE_COUNT = 4;

export function getBubbleCount() {
  const stored = Number(localStorage.getItem(BUBBLE_COUNT_KEY));
  if (!Number.isInteger(stored) || stored < MIN_BUBBLE_COUNT || stored > MAX_BUBBLE_COUNT) return DEFAULT_BUBBLE_COUNT;
  return stored;
}

export function setBubbleCount(count) {
  const clamped = Math.min(MAX_BUBBLE_COUNT, Math.max(MIN_BUBBLE_COUNT, Math.round(count)));
  localStorage.setItem(BUBBLE_COUNT_KEY, String(clamped));
  return clamped;
}
