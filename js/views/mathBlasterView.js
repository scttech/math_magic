// Math Blaster: a canvas arcade game reusing the exact same generator
// contract the skill drills use. Every topic's choices array (already
// shuffled, already exactly one correct answer) becomes the falling
// asteroids — no new distractor logic needed. Each topic's renderPrompt
// draws into the prompt container however suits it — plain text for the
// numeric/fraction topics, or the existing SVG shape renderer for
// shapeIdentification ("Shape Catch": name the falling asteroid that matches
// the shape shown, reusing shapeIdentification's own choices array of names).
import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { createRng, randomSeed } from '../core/rng.js';
import { getActiveProfileId } from '../core/profileStore.js';
import { recordQuizAttempt } from '../core/progressStore.js';
import { playCorrectSound, playIncorrectSound, animateFeedback } from '../app/feedbackFx.js';
import { createBlasterGame } from '../game/blasterEngine.js';
import { parseNumberSpec } from '../skills/numberSpec.js';
import { renderShape } from '../skills/shapeRenderer.js';
import { generateProblem as generateAddition, GENERATOR_ID as ADD_ID, MIN_VALUE as ADD_MIN, MAX_VALUE as ADD_MAX } from '../skills/additionFacts.js';
import { generateProblem as generateSubtraction, GENERATOR_ID as SUB_ID, MIN_VALUE as SUB_MIN, MAX_VALUE as SUB_MAX } from '../skills/subtractionFacts.js';
import { generateProblem as generateDivision, GENERATOR_ID as DIV_ID, MIN_DIVISOR, MAX_DIVISOR, MIN_QUOTIENT, MAX_QUOTIENT } from '../skills/divisionFacts.js';
import { generateProblem as generateMultiplication, GENERATOR_ID as MULT_ID, parseFactorSpec } from '../skills/multiplicationTables.js';
import { generateProblem as generateFractionSimplification, GENERATOR_ID as FRAC_ID, isReducible, MIN_DENOMINATOR as FRAC_MIN, MAX_DENOMINATOR as FRAC_MAX } from '../skills/fractionSimplification.js';
import { generateProblem as generateMixedNumbers, GENERATOR_ID as MIXED_ID, MIN_DENOMINATOR as MIXED_MIN, MAX_DENOMINATOR as MIXED_MAX } from '../skills/mixedNumbers.js';
import { generateProblem as generateShapeIdentification, GENERATOR_ID as SHAPE_ID } from '../skills/shapeIdentification.js';

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
    label: 'Identify Shapes (Shape Catch)',
    generatorId: SHAPE_ID,
    args: [['2D', '3D']],
    generate: generateShapeIdentification,
    renderPrompt: (container, p) => {
      container.className = 'equation-display shape-display';
      renderShape(container, p.shapeId, 140);
    },
  },
];

const els = {};
let game = null;

function cacheElements() {
  els.setupSection = document.getElementById('blaster-setup');
  els.activeSection = document.getElementById('blaster-active');
  els.resultsSection = document.getElementById('blaster-results');
  els.topicSelect = document.getElementById('blaster-topic-select');
  els.livesSelect = document.getElementById('blaster-lives-select');
  els.launchBtn = document.getElementById('blaster-launch-btn');
  els.canvasContainer = document.getElementById('blaster-canvas-container');
  els.canvas = document.getElementById('blaster-canvas');
  els.prompt = document.getElementById('blaster-prompt');
  els.scoreText = document.getElementById('blaster-score');
  els.livesText = document.getElementById('blaster-lives');
  els.finalScoreText = document.getElementById('blaster-final-score');
  els.finalAccuracyText = document.getElementById('blaster-final-accuracy');
  els.retryBtn = document.getElementById('blaster-retry-btn');
  els.backBtn = document.getElementById('blaster-back-btn');
}

function populateTopicSelect() {
  els.topicSelect.innerHTML = TOPICS.map((t) => `<option value="${t.key}">${t.label}</option>`).join('');
}

function showResults(score, results) {
  els.activeSection.hidden = true;
  els.resultsSection.hidden = false;

  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
  els.finalScoreText.textContent = `Score: ${score}`;
  els.finalAccuracyText.textContent = `${correct} of ${total} shots on target (${accuracy}%).`;
}

function launchGame() {
  if (game) game.stop();

  const topic = TOPICS.find((t) => t.key === els.topicSelect.value) || TOPICS[0];
  const lives = Number(els.livesSelect.value);
  const baseSeed = randomSeed();
  const layoutRng = createRng(baseSeed + 1_000_000); // separate stream from problem seeds, used only for visual jitter
  const startedAt = new Date().toISOString();
  const results = [];
  let roundIndex = 0;

  function getNextProblem() {
    const seed = baseSeed + roundIndex;
    roundIndex += 1;
    const problem = topic.generate(createRng(seed), ...topic.args);
    problem.seed = seed;
    topic.renderPrompt(els.prompt, problem);
    return problem;
  }

  els.scoreText.textContent = 'Score: 0';
  els.livesText.textContent = '❤️'.repeat(lives);

  game = createBlasterGame({
    canvas: els.canvas,
    rng: layoutRng,
    lives,
    getNextProblem,
    onScoreChange: (score) => {
      els.scoreText.textContent = `Score: ${score}`;
    },
    onLivesChange: (remaining) => {
      els.livesText.textContent = '❤️'.repeat(Math.max(0, remaining));
    },
    onHit: ({ problem, isCorrect, label }) => {
      results.push({ generatorId: topic.generatorId, difficulty: null, seed: problem.seed, correct: isCorrect, userAnswer: label, timeMs: 0 });
      if (isCorrect) playCorrectSound();
      else playIncorrectSound();
      animateFeedback(els.canvasContainer, isCorrect);
    },
    onGameOver: ({ score }) => {
      recordQuizAttempt(getActiveProfileId(), {
        type: 'game',
        grade: null,
        topics: [topic.key],
        difficulty: topic.label,
        startedAt,
        completedAt: new Date().toISOString(),
        problems: results,
      });
      showResults(score, results);
    },
  });

  els.setupSection.hidden = true;
  els.resultsSection.hidden = true;
  els.activeSection.hidden = false;
  game.start();
}

function backToSetup() {
  if (game) {
    game.stop();
    game = null;
  }
  els.resultsSection.hidden = true;
  els.activeSection.hidden = true;
  els.setupSection.hidden = false;
}

export function init() {
  cacheElements();
  renderNav('games.html');
  populateTopicSelect();

  els.launchBtn.addEventListener('click', launchGame);
  els.retryBtn.addEventListener('click', launchGame);
  els.backBtn.addEventListener('click', backToSetup);
}
