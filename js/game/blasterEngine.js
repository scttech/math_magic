// Canvas game engine for Math Blaster — the first canvas usage in the
// codebase (every other visual is SVG/DOM). Deliberately split into pure,
// directly-testable helpers (fallSpeedForScore, isPointInCircle,
// layoutStartPositions) and createBlasterGame, which owns the
// requestAnimationFrame loop, canvas drawing, and click handling. The host
// view supplies problems (getNextProblem) and is told about every outcome
// via callbacks — the engine itself knows nothing about generators, seeds,
// or profiles.
export const BASE_FALL_SPEED = 40; // px/sec
export const SPEED_RAMP_PER_CORRECT = 4; // px/sec added per correct hit
export const MAX_FALL_SPEED = 160;
const ASTEROID_RADIUS = 28;

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
 * @param {(outcome: {problem: Object, isCorrect: boolean, label: string}) => void} [config.onHit]
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
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(a.label, a.x, a.y);
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

    // Lenient v1: missing the correct answer costs no life, it just moves on.
    if (correctFellOff) spawnProblem();

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
