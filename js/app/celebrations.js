// Celebration art shown on completion screens sitewide (quiz, lessons, skill
// drills, every game). Two tiers: "good" (a strong result, a game win, or a
// completed lesson) and "encouragement" (everything else, framed around
// trying again rather than praise that wouldn't fit the result).
const GOOD_IMAGES = [
  '../assets/images/celebrations/nice-work.png',
  '../assets/images/celebrations/great-job.png',
  '../assets/images/celebrations/keep-it-up.png',
  '../assets/images/celebrations/awesome.png',
  '../assets/images/celebrations/you-did-it.png',
  '../assets/images/celebrations/masterfully-calculated.png',
  '../assets/images/celebrations/mastered-this-charm.png',
  '../assets/images/celebrations/brilliant-wizardry.png',
];

const ENCOURAGEMENT_IMAGES = [
  '../assets/images/celebrations/never-give-up.png',
  '../assets/images/celebrations/practice-daily.png',
  '../assets/images/celebrations/channel-focus.png',
  '../assets/images/celebrations/mind-power-expanding.png',
  '../assets/images/celebrations/small-steps-big-magic.png',
];

export const MAZE_ESCAPED_IMAGE = '../assets/images/celebrations/maze-escaped.png';
export const GOOD_ACCURACY_THRESHOLD = 0.7;

function randomFrom(pool) {
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

/** A random "strong result" image. */
export function pickGoodCelebration() {
  return randomFrom(GOOD_IMAGES);
}

/** A random "keep going" image. */
export function pickEncouragementCelebration() {
  return randomFrom(ENCOURAGEMENT_IMAGES);
}

/** The usual case: pick a tier from an accuracy fraction in [0, 1]. */
export function pickCelebrationForAccuracy(accuracy) {
  return accuracy >= GOOD_ACCURACY_THRESHOLD ? pickGoodCelebration() : pickEncouragementCelebration();
}

/**
 * For a win/lose/tie outcome (e.g. Duel Mode): a loss falls to the
 * encouragement tier, a win or tie is treated as good — there's no accuracy
 * percentage to threshold against the way a quiz or skill drill has.
 */
export function pickCelebrationForOutcome(outcome) {
  return outcome === 'loss' ? pickEncouragementCelebration() : pickGoodCelebration();
}

/** Shows `src` in `imgEl`, or hides it entirely if there's nothing to show. */
export function showCelebration(imgEl, src) {
  if (!imgEl) return;
  if (!src) {
    imgEl.hidden = true;
    imgEl.removeAttribute('src');
    return;
  }
  imgEl.src = src;
  imgEl.hidden = false;
}
