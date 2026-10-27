// Canvas game engine for Math Blaster — the first canvas usage in the
// codebase (every other visual is SVG/DOM). Deliberately split into pure,
// directly-testable helpers (fallSpeedForScore, isPointInCircle,
// layoutStartPositions) and createBlasterGame, which owns the
// requestAnimationFrame loop, canvas drawing, and click handling. The host
// view supplies problems (getNextProblem) and is told about every outcome
// via callbacks — the engine itself knows nothing about generators, seeds,
// or profiles.
import { shuffle } from '../core/rng.js';

export const BASE_FALL_SPEED = 40; // px/sec
export const SPEED_RAMP_PER_CORRECT = 4; // px/sec added per correct hit
export const MAX_FALL_SPEED = 160;
const ASTEROID_RADIUS = 32;

/** How fast asteroids fall, given how many correct answers have been scored so far. */
export function fallSpeedForScore(score) {
  return Math.min(MAX_FALL_SPEED, BASE_FALL_SPEED + score * SPEED_RAMP_PER_CORRECT);
}

/** Whether point (px, py) falls within a circle centered at (cx, cy). */
export function isPointInCircle(px, py, cx, cy, radius) {
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= radius * radius;
}

/**
 * Greedily wraps `words` onto lines no wider than `maxWidth` (per
 * `measureWidth`), breaking at word boundaries. With `allowCharSplit` (off by
 * default), a single word that alone exceeds maxWidth is left as its own
 * (overflowing) line rather than being broken mid-word; callers that want a
 * last-resort character split for an extreme case can pass it explicitly.
 */
export function wrapWords(words, maxWidth, measureWidth, allowCharSplit = false) {
  const lines = [];
  let current = '';
  const pushCurrent = () => {
    if (current) {
      lines.push(current);
      current = '';
    }
  };

  for (let word of words) {
    if (allowCharSplit) {
      while (measureWidth(word) > maxWidth && word.length > 1) {
        let cut = word.length;
        while (cut > 1 && measureWidth(word.slice(0, cut)) > maxWidth) cut -= 1;
        pushCurrent();
        lines.push(word.slice(0, cut));
        word = word.slice(cut);
      }
    }
    const candidate = current ? `${current} ${word}` : word;
    if (!current || measureWidth(candidate) <= maxWidth) {
      current = candidate;
    } else {
      pushCurrent();
      current = word;
    }
  }
  pushCurrent();
  return lines;
}

/**
 * Picks a font size and word wrap that fits `label` inside a circle of the
 * given radius, so a long asteroid label (a multi-word shape name, not just a
 * short number) never overflows its circle. `measureWidth(text, fontSize)` is
 * injected so this stays pure/testable — production passes a canvas
 * measureText wrapper.
 *
 * Shrinking the font to fit cleanly at word boundaries is always preferred
 * over keeping a larger font and character-splitting a word mid-word (e.g.
 * "Triangl"/"e") — the smallest font size is tried, without splitting, before
 * splitting is allowed at all, so a split is only ever a last resort for a
 * single word too long to read at any size in range.
 */
export function fitLabelToCircle(label, radius, measureWidth, { minFontSize = 9, maxFontSize = 15 } = {}) {
  const maxWidth = radius * 1.7;
  const maxHeight = radius * 1.8;
  const words = label.split(' ');

  function findFit(allowCharSplit) {
    for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= 1) {
      const measureAtSize = (text) => measureWidth(text, fontSize);
      const lineHeight = fontSize * 1.15;
      const lines = wrapWords(words, maxWidth, measureAtSize, allowCharSplit);
      const widestLine = Math.max(...lines.map(measureAtSize));
      const totalHeight = lines.length * lineHeight;
      if (widestLine <= maxWidth && totalHeight <= maxHeight) return { fontSize, lineHeight, lines };
    }
    return null;
  }

  const fit = findFit(false) || findFit(true);
  if (fit) return fit;

  // Nothing fit even allowing a character split — best effort at the smallest size.
  const lineHeight = minFontSize * 1.15;
  const lines = wrapWords(words, maxWidth, (text) => measureWidth(text, minFontSize), true);
  return { fontSize: minFontSize, lineHeight, lines };
}

/**
 * Extends a problem's base choices (1 correct + a few distractors) up to
 * `bubbleCount` total bubbles, by harvesting extra distinct wrong choices
 * from repeatedly calling `generateMore()` — expected to return another
 * `{choices, answerDisplay}` from the same topic/args, so this reuses each
 * generator's own "plausible wrong answer" logic rather than inventing a
 * second one here. Gives up after a fixed number of attempts, so a topic
 * with a small answer universe (e.g. Shape Catch) degrades gracefully to
 * however many distinct options actually exist rather than looping forever.
 */
export function buildBubbleChoices(rng, problem, bubbleCount, generateMore) {
  const choices = new Set(problem.choices);
  let attempts = 0;
  while (choices.size < bubbleCount && attempts < 20) {
    attempts += 1;
    const extra = generateMore();
    for (const choice of extra.choices) {
      if (choice !== problem.answerDisplay) choices.add(choice);
    }
  }
  return shuffle(rng, Array.from(choices).slice(0, bubbleCount));
}

/** Spreads `count` starting x positions evenly across [margin, width - margin], with a little random jitter so they don't look mechanically even. */
export function layoutStartPositions(rng, count, width, margin = 40) {
  const usableWidth = Math.max(1, width - margin * 2);
  const step = usableWidth / count;
  const positions = [];
  for (let i = 0; i < count; i++) {
    const jitter = (rng() - 0.5) * step * 0.4;
    positions.push(margin + step * i + step / 2 + jitter);
  }
  return positions;
}

/**
 * @param {Object} config
 * @param {HTMLCanvasElement} config.canvas
 * @param {() => number} config.rng - seeded RNG, used only for layout jitter and fall-speed variance (not problem content).
 * @param {number} config.lives
 * @param {() => {choices: string[], answerDisplay: string}} config.getNextProblem
 * @param {(score: number) => void} [config.onScoreChange]
 * @param {(lives: number) => void} [config.onLivesChange]
 * @param {(outcome: {problem: Object, isCorrect: boolean, label: string}) => void} [config.onHit] - also fires with
 *   isCorrect: false and label: '' when the correct bubble falls off-screen unclicked (a miss, not a click).
 * @param {(result: {score: number}) => void} [config.onGameOver]
 */
export function createBlasterGame(config) {
  const { canvas, rng, lives: startingLives, getNextProblem, onScoreChange, onLivesChange, onHit, onGameOver } = config;
  const ctx = canvas.getContext('2d');

  let asteroids = [];
  let problem = null;
  let score = 0;
  let lives = startingLives;
  let running = false;
  let rafId = null;
  let lastTime = null;

  function measureWidth(text, fontSize) {
    ctx.font = `bold ${fontSize}px sans-serif`;
    return ctx.measureText(text).width;
  }

  function spawnProblem() {
    problem = getNextProblem();
    const speed = fallSpeedForScore(score);
    const positions = layoutStartPositions(rng, problem.choices.length, canvas.width);
    asteroids = problem.choices.map((choice, i) => ({
      x: positions[i],
      y: -30 - rng() * 140,
      vy: speed * (0.85 + rng() * 0.3),
      radius: ASTEROID_RADIUS,
      label: choice,
      // Computed once per spawn, not per frame — measureText is comparatively
      // expensive and the label doesn't change between spawns.
      labelLayout: fitLabelToCircle(choice, ASTEROID_RADIUS, measureWidth),
      isCorrect: choice === problem.answerDisplay,
      alive: true,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const a of asteroids) {
      if (!a.alive) continue;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#4a6fd9';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const { fontSize, lineHeight, lines } = a.labelLayout;
      ctx.font = `bold ${fontSize}px sans-serif`;
      const startY = a.y - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, i) => ctx.fillText(line, a.x, startY + i * lineHeight));
    }
  }

  function handleHit(asteroid) {
    asteroid.alive = false;
    const isCorrect = asteroid.isCorrect;
    onHit?.({ problem, isCorrect, label: asteroid.label });

    if (isCorrect) {
      score += 1;
      for (const a of asteroids) a.alive = false;
      onScoreChange?.(score);
      spawnProblem();
    } else {
      lives -= 1;
      onLivesChange?.(lives);
      if (lives <= 0) {
        stop();
        onGameOver?.({ score });
      }
    }
  }

  function handleClick(event) {
    if (!running) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (event.clientX - rect.left) * scaleX;
    const py = (event.clientY - rect.top) * scaleY;
    for (const a of asteroids) {
      if (!a.alive) continue;
      if (isPointInCircle(px, py, a.x, a.y, a.radius)) {
        handleHit(a);
        return;
      }
    }
  }

  function tick(time) {
    if (!running) return;
    if (lastTime === null) lastTime = time;
    const dt = Math.min(0.1, (time - lastTime) / 1000); // clamp dt so a dropped/background tab frame can't cause a huge jump
    lastTime = time;

    let correctFellOff = false;
    for (const a of asteroids) {
      if (!a.alive) continue;
      a.y += a.vy * dt;
      if (a.y - a.radius > canvas.height) {
        a.alive = false;
        if (a.isCorrect) correctFellOff = true;
      }
    }

    draw();

    // Letting the correct bubble fall off-screen unclicked costs a life, same
    // as clicking a wrong one — once it's gone there's no way to still get
    // this round right, so the miss is final the moment it crosses the line.
    if (correctFellOff) {
      for (const a of asteroids) a.alive = false;
      onHit?.({ problem, isCorrect: false, label: '' });
      lives -= 1;
      onLivesChange?.(lives);
      if (lives <= 0) {
        stop();
        onGameOver?.({ score });
        return;
      }
      spawnProblem();
    }

    rafId = requestAnimationFrame(tick);
  }

  function start() {
    running = true;
    lastTime = null;
    canvas.addEventListener('click', handleClick);
    spawnProblem();
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    canvas.removeEventListener('click', handleClick);
  }

  return {
    start,
    stop,
    getScore: () => score,
    getLives: () => lives,
    getCurrentProblem: () => problem,
  };
}
