// Maze Runner: navigate a seeded, procedurally-generated perfect maze
// (js/game/mazeGenerator.js — every cell reachable, exactly one path between
// any two cells) one step at a time. Most steps into an open passage are
// free; about QUESTION_CHANCE of them (and every step onto a monster's cell)
// cost one multiple-choice question from the chosen topic (the same
// generator contract every other game reuses): answer correctly to move (and
// defeat the monster, if any), answer wrong and take a hit but stay put and
// try again. A wall simply blocks that direction — no question, no hit.
// Monsters are placed only on solvePath()'s cells (excluding the start/goal
// endpoints) — the maze's single unique route — so every monster is
// guaranteed to actually be in the player's way, not just random set dressing.
import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { createRng, randomSeed, shuffle } from '../core/rng.js';
import { getActiveProfileId } from '../core/profileStore.js';
import { recordQuizAttempt } from '../core/progressStore.js';
import { playCorrectSound, playIncorrectSound, animateFeedback } from '../app/feedbackFx.js';
import { MAZE_ESCAPED_IMAGE, pickEncouragementCelebration, showCelebration } from '../app/celebrations.js';
import { generateMaze, canMove, stepTo, solvePath } from '../game/mazeGenerator.js';
import { parseNumberSpec } from '../skills/numberSpec.js';
import { renderShape } from '../skills/shapeRenderer.js';
import { generateProblem as generateAddition, GENERATOR_ID as ADD_ID, MIN_VALUE as ADD_MIN, MAX_VALUE as ADD_MAX } from '../skills/additionFacts.js';
import { generateProblem as generateSubtraction, GENERATOR_ID as SUB_ID, MIN_VALUE as SUB_MIN, MAX_VALUE as SUB_MAX } from '../skills/subtractionFacts.js';
import { generateProblem as generateDivision, GENERATOR_ID as DIV_ID, MIN_DIVISOR, MAX_DIVISOR, MIN_QUOTIENT, MAX_QUOTIENT } from '../skills/divisionFacts.js';
import { generateProblem as generateMultiplication, GENERATOR_ID as MULT_ID, parseFactorSpec } from '../skills/multiplicationTables.js';
import { generateProblem as generateFractionSimplification, GENERATOR_ID as FRAC_ID, isReducible, MIN_DENOMINATOR as FRAC_MIN, MAX_DENOMINATOR as FRAC_MAX } from '../skills/fractionSimplification.js';
import { generateProblem as generateMixedNumbers, GENERATOR_ID as MIXED_ID, MIN_DENOMINATOR as MIXED_MIN, MAX_DENOMINATOR as MIXED_MAX } from '../skills/mixedNumbers.js';
import { generateProblem as generateShapeIdentification, GENERATOR_ID as SHAPE_ID } from '../skills/shapeIdentification.js';

const ANSWER_PAUSE_MS = 700;
const CELL_PX = { 6: 52, 8: 42, 10: 36 };
const QUESTION_CHANCE = 0.3;
const ENEMY_COUNT = { 6: 3, 8: 5, 10: 8 };

function textPrompt(suffix) {
  return (container, p) => {
    container.className = 'equation-display';
    container.textContent = suffix ? `${p.promptText} ${suffix}` : p.promptText;
  };
}

const TOPICS = [
  {
    key: 'multiplicationTables',
    label: 'Multiplication Tables (1–12)',
    generatorId: MULT_ID,
    args: [parseFactorSpec('1-12'), parseFactorSpec('1-12')],
    generate: generateMultiplication,
    renderPrompt: textPrompt('= ?'),
  },
  {
    key: 'additionFacts',
    label: 'Addition Facts (0–12)',
    generatorId: ADD_ID,
    args: [parseNumberSpec('0-12', ADD_MIN, ADD_MAX), parseNumberSpec('0-12', ADD_MIN, ADD_MAX)],
    generate: generateAddition,
    renderPrompt: textPrompt('= ?'),
  },
  {
    key: 'subtractionFacts',
    label: 'Subtraction Facts (0–12)',
    generatorId: SUB_ID,
    args: [parseNumberSpec('0-12', SUB_MIN, SUB_MAX), parseNumberSpec('0-12', SUB_MIN, SUB_MAX)],
    generate: generateSubtraction,
    renderPrompt: textPrompt('= ?'),
  },
  {
    key: 'divisionFacts',
    label: 'Division Facts (1–12)',
    generatorId: DIV_ID,
    args: [parseNumberSpec('1-12', MIN_DIVISOR, MAX_DIVISOR), parseNumberSpec('1-12', MIN_QUOTIENT, MAX_QUOTIENT)],
    generate: generateDivision,
    renderPrompt: textPrompt('= ?'),
  },
  {
    key: 'fractionSimplification',
    label: 'Fraction Simplification (4–24)',
    generatorId: FRAC_ID,
    args: [parseNumberSpec('4-24', FRAC_MIN, FRAC_MAX).filter(isReducible)],
    generate: generateFractionSimplification,
    renderPrompt: textPrompt('= ?'),
  },
  {
    key: 'mixedNumbers',
    label: 'Mixed Numbers & Improper Fractions (2–12)',
    generatorId: MIXED_ID,
    args: [parseNumberSpec('2-12', MIXED_MIN, MIXED_MAX)],
    generate: generateMixedNumbers,
    renderPrompt: textPrompt(),
  },
  {
    key: 'shapeIdentification',
    label: 'Identify Shapes',
    generatorId: SHAPE_ID,
    args: [['2D', '3D']],
    generate: generateShapeIdentification,
    renderPrompt: (container, p) => {
      container.className = 'equation-display shape-display';
      renderShape(container, p.shapeId, 100);
    },
  },
];

const els = {};
let state = null;

function cacheElements() {
  els.setupSection = document.getElementById('maze-setup');
  els.activeSection = document.getElementById('maze-active');
  els.resultsSection = document.getElementById('maze-results');
  els.topicSelect = document.getElementById('maze-topic-select');
  els.sizeSelect = document.getElementById('maze-size-select');
  els.livesSelect = document.getElementById('maze-lives-select');
  els.startBtn = document.getElementById('maze-start-btn');
  els.movesText = document.getElementById('maze-moves');
  els.enemiesText = document.getElementById('maze-enemies');
  els.livesText = document.getElementById('maze-lives');
  els.grid = document.getElementById('maze-grid');
  els.upBtn = document.getElementById('maze-up-btn');
  els.downBtn = document.getElementById('maze-down-btn');
  els.leftBtn = document.getElementById('maze-left-btn');
  els.rightBtn = document.getElementById('maze-right-btn');
  els.problemPanel = document.getElementById('maze-problem-panel');
  els.prompt = document.getElementById('maze-prompt');
  els.choices = document.getElementById('maze-choices');
  els.resultBanner = document.getElementById('maze-result-banner');
  els.celebrationImage = document.getElementById('maze-celebration-image');
  els.finalMovesText = document.getElementById('maze-final-moves');
  els.finalAccuracyText = document.getElementById('maze-final-accuracy');
  els.retryBtn = document.getElementById('maze-retry-btn');
  els.backBtn = document.getElementById('maze-back-btn');
}

function populateTopicSelect() {
  els.topicSelect.innerHTML = TOPICS.map((t) => `<option value="${t.key}">${t.label}</option>`).join('');
}

function renderMaze() {
  const { maze, playerX, playerY } = state;
  const cellPx = CELL_PX[maze.width] || 40;
  els.grid.style.gridTemplateColumns = `repeat(${maze.width}, ${cellPx}px)`;
  els.grid.style.gridTemplateRows = `repeat(${maze.height}, ${cellPx}px)`;
  els.grid.innerHTML = '';

  for (let y = 0; y < maze.height; y += 1) {
    for (let x = 0; x < maze.width; x += 1) {
      const walls = maze.grid[y][x];
      const cell = document.createElement('div');
      cell.className = 'maze-cell';
      cell.style.borderTop = walls.N ? '2px solid var(--color-text-muted)' : '2px solid transparent';
      cell.style.borderLeft = walls.W ? '2px solid var(--color-text-muted)' : '2px solid transparent';
      cell.style.borderRight = x === maze.width - 1 ? (walls.E ? '2px solid var(--color-text-muted)' : '2px solid transparent') : 'none';
      cell.style.borderBottom = y === maze.height - 1 ? (walls.S ? '2px solid var(--color-text-muted)' : '2px solid transparent') : 'none';

      const isPlayer = x === playerX && y === playerY;
      const isGoal = x === maze.goal.x && y === maze.goal.y;
      const isEnemy = state.enemies.has(`${x},${y}`);
      if (isPlayer) {
        cell.classList.add('current');
        cell.textContent = '🧙';
      } else if (isGoal) {
        cell.classList.add('goal');
        cell.textContent = '🚪';
      } else if (isEnemy) {
        cell.classList.add('enemy');
        cell.textContent = '👹';
      }
      els.grid.appendChild(cell);
    }
  }
}

function updateHud() {
  els.movesText.textContent = `Moves: ${state.moves}`;
  els.enemiesText.textContent = `👹 ${state.enemies.size} left`;
  els.livesText.textContent = '❤️'.repeat(Math.max(0, state.lives));
}

function updateControls() {
  const disabled = state.answering;
  els.upBtn.disabled = disabled || !canMove(state.maze, state.playerX, state.playerY, 'N');
  els.downBtn.disabled = disabled || !canMove(state.maze, state.playerX, state.playerY, 'S');
  els.leftBtn.disabled = disabled || !canMove(state.maze, state.playerX, state.playerY, 'W');
  els.rightBtn.disabled = disabled || !canMove(state.maze, state.playerX, state.playerY, 'E');
}

function showProblem() {
  const seed = state.baseSeed + state.attemptIndex;
  state.attemptIndex += 1;
  const problem = state.topic.generate(createRng(seed), ...state.topic.args);
  state.currentProblem = { ...problem, seed };

  state.topic.renderPrompt(els.prompt, state.currentProblem);
  els.choices.innerHTML = '';
  state.currentProblem.choices.forEach((choice, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice-btn';
    btn.dataset.index = String(index);
    const key = document.createElement('span');
    key.className = 'choice-key';
    key.textContent = String(index + 1);
    const value = document.createElement('span');
    value.className = 'choice-value';
    value.textContent = choice;
    btn.append(key, value);
    els.choices.appendChild(btn);
  });

  els.problemPanel.hidden = false;
}

/** Moves the player onto (x, y), updates the HUD/grid, and reports whether that reached the goal. */
function applyMove(x, y) {
  state.playerX = x;
  state.playerY = y;
  state.moves += 1;
  updateHud();
  renderMaze();
  return x === state.maze.goal.x && y === state.maze.goal.y;
}

function attemptMove(direction) {
  if (!state || state.answering || els.activeSection.hidden) return;
  if (!canMove(state.maze, state.playerX, state.playerY, direction)) return;

  const { x, y } = stepTo(state.playerX, state.playerY, direction);
  const key = `${x},${y}`;
  const isEnemy = state.enemies.has(key);

  if (!isEnemy && state.encounterRng() >= QUESTION_CHANCE) {
    const won = applyMove(x, y);
    updateControls();
    if (won) finishGame(true);
    return;
  }

  state.answering = true;
  state.pendingDirection = direction;
  state.pendingEnemyKey = isEnemy ? key : null;
  updateControls();
  showProblem();
}

function finishGame(won) {
  recordQuizAttempt(getActiveProfileId(), {
    type: 'game',
    grade: null,
    topics: [state.topic.key],
    difficulty: null,
    startedAt: state.startedAt,
    completedAt: new Date().toISOString(),
    problems: state.results,
  });

  els.activeSection.hidden = true;
  els.resultsSection.hidden = false;

  const total = state.results.length;
  const correct = state.results.filter((r) => r.correct).length;
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
  els.resultBanner.textContent = won ? '🎉 You escaped the maze!' : '💀 Out of hits!';
  showCelebration(els.celebrationImage, won ? MAZE_ESCAPED_IMAGE : pickEncouragementCelebration());
  els.finalMovesText.textContent = won ? `Solved in ${state.moves} move${state.moves === 1 ? '' : 's'}.` : `Made it ${state.moves} move${state.moves === 1 ? '' : 's'} in.`;
  els.finalAccuracyText.textContent = `${correct} of ${total} answer${total === 1 ? '' : 's'} correct (${accuracy}%).`;
}

function handleChoiceClick(event) {
  const btn = event.target.closest('.choice-btn');
  if (!btn || !state.answering) return;
  handleAnswer(Number(btn.dataset.index), btn);
}

function handleAnswer(index, chosenBtn) {
  const problem = state.currentProblem;
  const chosen = problem.choices[index];
  const isCorrect = chosen === problem.answerDisplay;

  state.results.push({ generatorId: state.topic.generatorId, difficulty: null, seed: problem.seed, correct: isCorrect, userAnswer: chosen, timeMs: 0 });

  const buttons = Array.from(els.choices.querySelectorAll('.choice-btn'));
  for (const btn of buttons) {
    btn.disabled = true;
    if (Number(btn.dataset.index) === index) {
      btn.classList.add(isCorrect ? 'correct' : 'incorrect');
    } else if (!isCorrect && problem.choices[Number(btn.dataset.index)] === problem.answerDisplay) {
      btn.classList.add('reveal-correct');
    }
  }

  if (isCorrect) playCorrectSound();
  else playIncorrectSound();
  animateFeedback(chosenBtn, isCorrect);

  if (!isCorrect) {
    state.lives -= 1;
    updateHud();
  }

  setTimeout(() => {
    els.problemPanel.hidden = true;
    state.answering = false;

    if (isCorrect) {
      if (state.pendingEnemyKey) {
        state.enemies.delete(state.pendingEnemyKey);
        state.pendingEnemyKey = null;
      }
      const { x, y } = stepTo(state.playerX, state.playerY, state.pendingDirection);
      if (applyMove(x, y)) {
        finishGame(true);
        return;
      }
    } else if (state.lives <= 0) {
      finishGame(false);
      return;
    }

    updateControls();
  }, ANSWER_PAUSE_MS);
}

function handleKeydown(event) {
  if (!state || els.activeSection.hidden) return;
  const target = event.target;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return;

  if (state.answering) {
    const digit = Number(event.key);
    if (digit >= 1 && digit <= state.currentProblem.choices.length) {
      const btn = els.choices.querySelector(`.choice-btn[data-index="${digit - 1}"]`);
      if (btn) btn.click();
    }
    return;
  }

  const key = event.key.toLowerCase();
  if (key === 'arrowup' || key === 'w') attemptMove('N');
  else if (key === 'arrowdown' || key === 's') attemptMove('S');
  else if (key === 'arrowleft' || key === 'a') attemptMove('W');
  else if (key === 'arrowright' || key === 'd') attemptMove('E');
}

function startGame() {
  const topic = TOPICS.find((t) => t.key === els.topicSelect.value) || TOPICS[0];
  const size = Number(els.sizeSelect.value);
  const lives = Number(els.livesSelect.value);
  const baseSeed = randomSeed();
  const maze = generateMaze(size, size, createRng(baseSeed));

  // Enemies sit only on the maze's single start-to-goal path (excluding the
  // endpoints), so every one placed is guaranteed to actually block the way.
  const interior = solvePath(maze).slice(1, -1);
  const enemyCells = shuffle(createRng(baseSeed + 2_000_000), interior).slice(0, ENEMY_COUNT[size] || 0);

  state = {
    topic,
    maze,
    playerX: 0,
    playerY: 0,
    lives,
    moves: 0,
    answering: false,
    pendingDirection: null,
    pendingEnemyKey: null,
    enemies: new Set(enemyCells.map((c) => `${c.x},${c.y}`)),
    currentProblem: null,
    results: [],
    baseSeed: baseSeed + 1_000_000, // separate stream from the maze layout's own seed
    attemptIndex: 0,
    encounterRng: createRng(baseSeed + 3_000_000), // separate stream again, for the 30% random-question roll
    startedAt: new Date().toISOString(),
  };

  els.problemPanel.hidden = true;
  updateHud();
  renderMaze();
  updateControls();

  els.setupSection.hidden = true;
  els.resultsSection.hidden = true;
  els.activeSection.hidden = false;
}

function backToSetup() {
  state = null;
  els.resultsSection.hidden = true;
  els.activeSection.hidden = true;
  els.setupSection.hidden = false;
}

export function init() {
  cacheElements();
  renderNav('games.html');
  populateTopicSelect();

  els.startBtn.addEventListener('click', startGame);
  els.retryBtn.addEventListener('click', startGame);
  els.backBtn.addEventListener('click', backToSetup);
  els.upBtn.addEventListener('click', () => attemptMove('N'));
  els.downBtn.addEventListener('click', () => attemptMove('S'));
  els.leftBtn.addEventListener('click', () => attemptMove('W'));
  els.rightBtn.addEventListener('click', () => attemptMove('E'));
  els.choices.addEventListener('click', handleChoiceClick);
  window.addEventListener('keydown', handleKeydown);
}
