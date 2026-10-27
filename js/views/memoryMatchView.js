// Memory Match: flip cards to pair a problem with its answer. No canvas, no
// special engine — just the same generator contract as Duel Mode and Math
// Blaster, reused a third way. Deck-building (ensuring every prompt and
// answer in the deck is unique) lives in js/app/memoryDeck.js, where it's
// directly unit-testable.
import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { createRng, randomSeed, shuffle } from '../core/rng.js';
import { getActiveProfileId } from '../core/profileStore.js';
import { recordQuizAttempt } from '../core/progressStore.js';
import { playCorrectSound, playIncorrectSound, animateFeedback } from '../app/feedbackFx.js';
import { buildDeck } from '../app/memoryDeck.js';
import { parseNumberSpec } from '../skills/numberSpec.js';
import { generateProblem as generateAddition, GENERATOR_ID as ADD_ID, MIN_VALUE as ADD_MIN, MAX_VALUE as ADD_MAX } from '../skills/additionFacts.js';
import { generateProblem as generateSubtraction, GENERATOR_ID as SUB_ID, MIN_VALUE as SUB_MIN, MAX_VALUE as SUB_MAX } from '../skills/subtractionFacts.js';
import { generateProblem as generateDivision, GENERATOR_ID as DIV_ID, MIN_DIVISOR, MAX_DIVISOR, MIN_QUOTIENT, MAX_QUOTIENT } from '../skills/divisionFacts.js';
import { generateProblem as generateMultiplication, GENERATOR_ID as MULT_ID, parseFactorSpec } from '../skills/multiplicationTables.js';
import { generateProblem as generateFractionSimplification, GENERATOR_ID as FRAC_ID, isReducible, MIN_DENOMINATOR as FRAC_MIN, MAX_DENOMINATOR as FRAC_MAX } from '../skills/fractionSimplification.js';
import { generateProblem as generateMixedNumbers, GENERATOR_ID as MIXED_ID, MIN_DENOMINATOR as MIXED_MIN, MAX_DENOMINATOR as MIXED_MAX } from '../skills/mixedNumbers.js';

const MISMATCH_PAUSE_MS = 900;

const TOPICS = [
  { key: 'multiplicationTables', label: 'Multiplication Tables (1–12)', generatorId: MULT_ID, args: [parseFactorSpec('1-12'), parseFactorSpec('1-12')], generate: generateMultiplication },
  { key: 'additionFacts', label: 'Addition Facts (0–12)', generatorId: ADD_ID, args: [parseNumberSpec('0-12', ADD_MIN, ADD_MAX), parseNumberSpec('0-12', ADD_MIN, ADD_MAX)], generate: generateAddition },
  { key: 'subtractionFacts', label: 'Subtraction Facts (0–12)', generatorId: SUB_ID, args: [parseNumberSpec('0-12', SUB_MIN, SUB_MAX), parseNumberSpec('0-12', SUB_MIN, SUB_MAX)], generate: generateSubtraction },
  { key: 'divisionFacts', label: 'Division Facts (1–12)', generatorId: DIV_ID, args: [parseNumberSpec('1-12', MIN_DIVISOR, MAX_DIVISOR), parseNumberSpec('1-12', MIN_QUOTIENT, MAX_QUOTIENT)], generate: generateDivision },
  { key: 'fractionSimplification', label: 'Fraction Simplification (4–24)', generatorId: FRAC_ID, args: [parseNumberSpec('4-24', FRAC_MIN, FRAC_MAX).filter(isReducible)], generate: generateFractionSimplification },
  { key: 'mixedNumbers', label: 'Mixed Numbers & Improper Fractions (2–12)', generatorId: MIXED_ID, args: [parseNumberSpec('2-12', MIXED_MIN, MIXED_MAX)], generate: generateMixedNumbers },
];

const els = {};
let state = null;

function cacheElements() {
  els.setupSection = document.getElementById('memory-setup');
  els.activeSection = document.getElementById('memory-active');
  els.resultsSection = document.getElementById('memory-results');
  els.topicSelect = document.getElementById('memory-topic-select');
  els.pairCountSelect = document.getElementById('memory-pair-count-select');
  els.setupError = document.getElementById('memory-setup-error');
  els.startBtn = document.getElementById('memory-start-btn');
  els.movesText = document.getElementById('memory-moves');
  els.matchedText = document.getElementById('memory-matched');
  els.board = document.getElementById('memory-board');
  els.finalMovesText = document.getElementById('memory-final-moves');
  els.finalAccuracyText = document.getElementById('memory-final-accuracy');
  els.retryBtn = document.getElementById('memory-retry-btn');
  els.backBtn = document.getElementById('memory-back-btn');
}

function populateTopicSelect() {
  els.topicSelect.innerHTML = TOPICS.map((t) => `<option value="${t.key}">${t.label}</option>`).join('');
}

function buildCards(problems, shuffleSeed) {
  const cards = [];
  problems.forEach((problem, pairId) => {
    cards.push({ pairId, text: problem.promptText, matched: false });
    cards.push({ pairId, text: problem.answerDisplay, matched: false });
  });
  return shuffle(createRng(shuffleSeed), cards);
}

function renderCards() {
  els.board.innerHTML = '';
  state.cards.forEach((card, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'memory-card';
    const isFaceUp = card.matched || state.flipped.includes(index);
    btn.dataset.index = String(index);
    if (isFaceUp) {
      btn.classList.add('face-up');
      btn.textContent = card.text;
      if (card.matched) btn.classList.add('matched');
    } else {
      btn.textContent = '❓';
    }
    btn.disabled = card.matched;
    btn.addEventListener('click', () => handleCardClick(index));
    els.board.appendChild(btn);
  });
  els.movesText.textContent = `Moves: ${state.moves}`;
  els.matchedText.textContent = `Matched: ${state.matchedPairs} of ${state.cards.length / 2}`;
}

function finishGame() {
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
  els.finalMovesText.textContent = `Completed in ${state.moves} move${state.moves === 1 ? '' : 's'}.`;
  els.finalAccuracyText.textContent = `${correct} of ${total} match attempt${total === 1 ? '' : 's'} correct (${accuracy}%).`;
}

function handleCardClick(index) {
  if (state.locked) return;
  const card = state.cards[index];
  if (card.matched || state.flipped.includes(index)) return;

  state.flipped.push(index);
  renderCards();
  if (state.flipped.length < 2) return;

  state.locked = true;
  state.moves += 1;
  const [i1, i2] = state.flipped;
  const c1 = state.cards[i1];
  const c2 = state.cards[i2];
  const isMatch = c1.pairId === c2.pairId;

  state.results.push({
    generatorId: state.topic.generatorId,
    difficulty: null,
    seed: state.baseSeed + c1.pairId,
    correct: isMatch,
    userAnswer: `${c1.text} / ${c2.text}`,
    timeMs: 0,
  });

  if (isMatch) {
    c1.matched = true;
    c2.matched = true;
    state.matchedPairs += 1;
    state.flipped = [];
    state.locked = false;
    playCorrectSound();
    animateFeedback(els.board, true);
    renderCards();
    if (state.matchedPairs === state.cards.length / 2) finishGame();
    return;
  }

  playIncorrectSound();
  animateFeedback(els.board, false);
  setTimeout(() => {
    state.flipped = [];
    state.locked = false;
    renderCards();
  }, MISMATCH_PAUSE_MS);
}

function startGame() {
  const topic = TOPICS.find((t) => t.key === els.topicSelect.value) || TOPICS[0];
  const pairCount = Number(els.pairCountSelect.value);
  const baseSeed = randomSeed();

  const problems = buildDeck(topic, pairCount, baseSeed);
  if (problems.length < pairCount) {
    els.setupError.textContent = `Couldn't generate ${pairCount} unique pairs for this topic — try fewer pairs.`;
    els.setupError.hidden = false;
    return;
  }
  els.setupError.hidden = true;

  state = {
    topic,
    baseSeed,
    cards: buildCards(problems, baseSeed + 1_000_000),
    flipped: [],
    matchedPairs: 0,
    moves: 0,
    locked: false,
    results: [],
    startedAt: new Date().toISOString(),
  };

  els.setupSection.hidden = true;
  els.resultsSection.hidden = true;
  els.activeSection.hidden = false;
  renderCards();
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
}
