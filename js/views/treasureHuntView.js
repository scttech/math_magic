// Coordinate Treasure Hunt: a timed-feeling (lives-based) game built almost
// entirely from existing pieces — the real "Plotting Points" curriculum
// generators (grade5/6 coordinatePlane.js), via the registry, drawn with
// their own treasure-map-themed renderer (js/charts/treasureMapPlane.js,
// independent of the shared js/charts/coordinatePlane.js so this game's
// pirate styling can't regress the Quiz view/Worksheet Builder/Lessons).
// Prompts name a random landmark (js/app/treasureLandmarks.js) instead of a
// plain "X marks the spot", and a skippable two-slide intro (dialogue drawn
// from js/core/treasureDialogueStore.js) plays before setup.
import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { createRng, randomSeed } from '../core/rng.js';
import { getById } from '../core/registry.js';
import { getActiveProfileId } from '../core/profileStore.js';
import { recordQuizAttempt } from '../core/progressStore.js';
import { renderTreasureMap } from '../charts/treasureMapPlane.js';
import { createLandmarkSequence } from '../app/treasureLandmarks.js';
import { getDialogueLines } from '../core/treasureDialogueStore.js';
import { playCorrectSound, playIncorrectSound, animateFeedback, isSoundEnabled } from '../app/feedbackFx.js';
import { pickCelebrationForAccuracy, showCelebration } from '../app/celebrations.js';

const GRID_SIZE = 320;
const ROUND_PAUSE_MS = 1200;
const INTRO_SLIDES = ['ship', 'map'];

const els = {};
let state = null;

function cacheElements() {
  els.introSection = document.getElementById('treasure-intro');
  els.introSlides = Array.from(document.querySelectorAll('.treasure-intro-slide'));
  els.introSpeechBubbles = Array.from(document.querySelectorAll('.treasure-speech-bubble'));
  els.introNextBtn = document.getElementById('treasure-intro-next-btn');
  els.introStartBtn = document.getElementById('treasure-intro-start-btn');
  els.introSkipBtns = Array.from(document.querySelectorAll('.treasure-intro-skip-btn'));
  els.introMusic = document.getElementById('treasure-intro-music');

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
  els.celebrationImage = document.getElementById('treasure-celebration-image');
  els.finalScoreText = document.getElementById('treasure-final-score');
  els.finalAccuracyText = document.getElementById('treasure-final-accuracy');
  els.retryBtn = document.getElementById('treasure-retry-btn');
  els.backBtn = document.getElementById('treasure-back-btn');
}

// --- Skippable intro ----------------------------------------------------

function randomFrom(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function tryPlayIntroMusic() {
  if (!els.introMusic || !isSoundEnabled()) return;
  // Autoplay is commonly blocked before any user gesture — this call is also
  // made again from the Next/Skip click handlers, which are real gestures,
  // so it reliably starts there even when this first attempt is silently
  // rejected by the browser.
  els.introMusic.play().catch(() => {});
}

function stopIntroMusic() {
  if (!els.introMusic) return;
  els.introMusic.pause();
  els.introMusic.currentTime = 0;
}

function showIntroSlide(index) {
  const category = INTRO_SLIDES[index];
  const lines = getDialogueLines();
  els.introSlides.forEach((slide, i) => {
    slide.hidden = i !== index;
  });
  if (els.introSpeechBubbles[index]) els.introSpeechBubbles[index].textContent = randomFrom(lines[category]);
}

// The intro now runs *after* setup (picking grade/difficulty/rounds/lives
// comes first), so finishing or skipping it drops the player straight into
// the game those choices already describe, rather than back to the setup
// form.
function finishIntro() {
  stopIntroMusic();
  els.introSection.hidden = true;
  startGame();
}

function startIntro() {
  els.introSection.hidden = false;
  els.setupSection.hidden = true;
  els.resultsSection.hidden = true;
  els.activeSection.hidden = true;
  showIntroSlide(0);
  tryPlayIntroMusic();
}

function renderGrid({ marker = null, revealIcon = null, interactive = false } = {}) {
  renderTreasureMap(els.gridContainer, {
    size: GRID_SIZE,
    range: state.currentProblem.visual.range,
    quadrant1: state.currentProblem.visual.quadrant1,
    interactive,
    marker,
    revealIcon,
    onPlace: interactive ? handlePlace : null,
  });
}

function startRound() {
  const seed = state.baseSeed + state.roundIndex;
  const rng = createRng(seed);
  const problem = getById(state.generatorId).generate({ difficulty: state.difficulty, rng });
  // Drawn from a separate, whole-game sequence (not the per-round rng above)
  // so landmarks don't repeat until every one has shown up once.
  const landmark = state.landmarkSequence.next();
  state.currentProblem = { ...problem, seed };
  state.currentLandmark = landmark;

  els.roundText.textContent = `Treasure ${state.roundIndex + 1} of ${state.totalRounds}`;
  els.prompt.textContent = `🏴‍☠️ Find the ${landmark.name} at ${problem.answerDisplay}!`;
  els.scoreText.textContent = `Found: ${state.score}`;
  els.livesText.textContent = '❤️'.repeat(state.lives);

  renderGrid({ interactive: true });
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
  showCelebration(els.celebrationImage, pickCelebrationForAccuracy(total === 0 ? 0 : correct / total));
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

  const foundIcon = { x: problem.meta.x, y: problem.meta.y, icon: state.currentLandmark.icon };

  if (isCorrect) {
    state.score += 1;
    playCorrectSound();
    renderGrid({ revealIcon: foundIcon, interactive: false });
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
    renderGrid({ revealIcon: foundIcon, interactive: false });
    setTimeout(finishGame, ROUND_PAUSE_MS);
  } else {
    // Show their wrong guess as an X and let them try again at the same treasure.
    renderGrid({ marker: { x, y }, interactive: true });
  }
}

function startGame() {
  const grade = els.gradeSelect.value;
  const baseSeed = randomSeed();
  state = {
    generatorId: `grade${grade}.coordinatePlane.plotPoint`,
    grade,
    difficulty: els.difficultySelect.value,
    totalRounds: Number(els.roundsSelect.value),
    lives: Number(els.livesSelect.value),
    roundIndex: 0,
    score: 0,
    results: [],
    baseSeed,
    currentProblem: null,
    // A separate rng stream from the per-round problem seeds above (same
    // "+1_000_000 offset" convention used for Math Blaster's/Maze's own
    // layout-jitter streams), so landmarks don't repeat until every one has
    // shown up once (see createLandmarkSequence).
    landmarkSequence: createLandmarkSequence(createRng(baseSeed + 1_000_000)),
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

  els.introNextBtn.addEventListener('click', () => {
    tryPlayIntroMusic();
    showIntroSlide(1);
  });
  els.introStartBtn.addEventListener('click', () => {
    tryPlayIntroMusic();
    finishIntro();
  });
  for (const btn of els.introSkipBtns) {
    btn.addEventListener('click', finishIntro);
  }

  // Setup is the first screen; "Start Hunting" plays the intro with those
  // choices already locked in, instead of starting the game immediately.
  els.startBtn.addEventListener('click', startIntro);
  els.retryBtn.addEventListener('click', startGame);
  els.backBtn.addEventListener('click', backToSetup);
}
