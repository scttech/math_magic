// Coordinate Treasure Hunt: a timed-feeling (lives-based) game built almost
// entirely from existing pieces — the interactive click-to-plot coordinate
// grid (js/charts/coordinatePlane.js, already used by the Quiz view and
// lesson checkpoints) and the real "Plotting Points" curriculum generators
// (grade5/6 coordinatePlane.js), via the registry. No new rendering code.
import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { createRng, randomSeed } from '../core/rng.js';
import { getById } from '../core/registry.js';
import { getActiveProfileId } from '../core/profileStore.js';
import { recordQuizAttempt } from '../core/progressStore.js';
import { renderVisual } from '../charts/renderVisual.js';
import { playCorrectSound, playIncorrectSound, animateFeedback } from '../app/feedbackFx.js';

const GRID_SIZE = 320;
const ROUND_PAUSE_MS = 1200;

const els = {};
let state = null;

function cacheElements() {
  els.setupSection = document.getElementById('treasure-setup');
  els.activeSection = document.getElementById('treasure-active');
  els.resultsSection = document.getElementById('treasure-results');
  els.gradeSelect = document.getElementById('treasure-grade-select');
  els.difficultySelect = document.getElementById('treasure-difficulty-select');
  els.roundsSelect = document.getElementById('treasure-rounds-select');
  els.livesSelect = document.getElementById('treasure-lives-select');
  els.startBtn = document.getElementById('treasure-start-btn');
  els.roundText = document.getElementById('treasure-round-text');
  els.prompt = document.getElementById('treasure-prompt');
  els.scoreText = document.getElementById('treasure-score');
  els.livesText = document.getElementById('treasure-lives');
  els.gridContainer = document.getElementById('treasure-grid-container');
  els.finalScoreText = document.getElementById('treasure-final-score');
  els.finalAccuracyText = document.getElementById('treasure-final-accuracy');
  els.retryBtn = document.getElementById('treasure-retry-btn');
  els.backBtn = document.getElementById('treasure-back-btn');
}

function renderGrid(marker, interactive) {
  renderVisual(els.gridContainer, {
    size: GRID_SIZE,
    ...state.currentProblem.visual,
    interactive,
    marker,
    onPlace: interactive ? handlePlace : null,
  });
}

function startRound() {
  const seed = state.baseSeed + state.roundIndex;
  const rng = createRng(seed);
  const problem = getById(state.generatorId).generate({ difficulty: state.difficulty, rng });
  state.currentProblem = { ...problem, seed };

  els.roundText.textContent = `Treasure ${state.roundIndex + 1} of ${state.totalRounds}`;
  els.prompt.textContent = `🏴‍☠️ X marks the spot: ${problem.answerDisplay}`;
  els.scoreText.textContent = `Found: ${state.score}`;
  els.livesText.textContent = '❤️'.repeat(state.lives);

  renderGrid(null, true);
}

function finishGame() {
  recordQuizAttempt(getActiveProfileId(), {
    type: 'game',
    grade: state.grade,
    topics: ['coordinatePlane'],
    difficulty: state.difficulty,
    startedAt: state.startedAt,
    completedAt: new Date().toISOString(),
    problems: state.results,
  });

  els.activeSection.hidden = true;
  els.resultsSection.hidden = false;

  const total = state.results.length;
  const correct = state.results.filter((r) => r.correct).length;
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
  els.finalScoreText.textContent = `Treasures found: ${state.score} of ${state.totalRounds}`;
  els.finalAccuracyText.textContent = `${correct} of ${total} guess${total === 1 ? '' : 'es'} correct (${accuracy}%).`;
}

function nextRoundOrFinish() {
  state.roundIndex += 1;
  if (state.roundIndex >= state.totalRounds) finishGame();
  else startRound();
}

function handlePlace(x, y) {
  const problem = state.currentProblem;
  const isCorrect = problem.checkAnswer(`(${x}, ${y})`);
  state.results.push({ generatorId: state.generatorId, difficulty: state.difficulty, seed: problem.seed, correct: isCorrect, userAnswer: `(${x}, ${y})`, timeMs: 0 });

  if (isCorrect) {
    state.score += 1;
    playCorrectSound();
    renderGrid(null, false);
    renderVisual(els.gridContainer, { size: GRID_SIZE, ...problem.visual.answerVisual, interactive: false });
    animateFeedback(els.gridContainer, true);
    els.scoreText.textContent = `Found: ${state.score}`;
    setTimeout(nextRoundOrFinish, ROUND_PAUSE_MS);
    return;
  }

  state.lives -= 1;
  playIncorrectSound();
  animateFeedback(els.gridContainer, false);
  els.livesText.textContent = '❤️'.repeat(Math.max(0, state.lives));

  if (state.lives <= 0) {
    renderVisual(els.gridContainer, { size: GRID_SIZE, ...problem.visual.answerVisual, interactive: false });
    setTimeout(finishGame, ROUND_PAUSE_MS);
  } else {
    // Show their wrong guess as a marker and let them try again at the same treasure.
    renderGrid({ x, y }, true);
  }
}

function startGame() {
  const grade = els.gradeSelect.value;
  state = {
    generatorId: `grade${grade}.coordinatePlane.plotPoint`,
    grade,
    difficulty: els.difficultySelect.value,
    totalRounds: Number(els.roundsSelect.value),
    lives: Number(els.livesSelect.value),
    roundIndex: 0,
    score: 0,
    results: [],
    baseSeed: randomSeed(),
    currentProblem: null,
    startedAt: new Date().toISOString(),
  };

  els.setupSection.hidden = true;
  els.resultsSection.hidden = true;
  els.activeSection.hidden = false;
  startRound();
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

  els.startBtn.addEventListener('click', startGame);
  els.retryBtn.addEventListener('click', startGame);
  els.backBtn.addEventListener('click', backToSetup);
}
