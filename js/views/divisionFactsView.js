import '../app/init.js';
import { initSkillRunner } from '../app/skillRunner.js';
import { parseNumberSpec } from '../skills/numberSpec.js';
import { generateProblem, GENERATOR_ID, MIN_DIVISOR, MAX_DIVISOR, MIN_QUOTIENT, MAX_QUOTIENT } from '../skills/divisionFacts.js';

function validateSetup(els) {
  const divisors = parseNumberSpec(els.divisorInput.value, MIN_DIVISOR, MAX_DIVISOR);
  const quotients = parseNumberSpec(els.quotientInput.value, MIN_QUOTIENT, MAX_QUOTIENT);
  if (!divisors || !quotients) {
    return { error: `Enter a valid number or range for both boxes, e.g. "5" or "1-12" or "2,5-7" (divisors ${MIN_DIVISOR}-${MAX_DIVISOR}, quotients ${MIN_QUOTIENT}-${MAX_QUOTIENT}).` };
  }
  return { label: `÷${els.divisorInput.value.trim()}`, args: [divisors, quotients] };
}

function renderPrompt(container, problem) {
  container.textContent = `${problem.promptText} = ?`;
}

export function init() {
  initSkillRunner({
    elementIds: {
      setupSection: 'skill-setup',
      activeSection: 'skill-active',
      resultsSection: 'skill-results',
      countSelect: 'skill-count-select',
      setupError: 'skill-setup-error',
      startBtn: 'skill-start-btn',
      progressText: 'skill-progress-text',
      promptContainer: 'skill-equation',
      choices: 'skill-choices',
      feedback: 'skill-feedback',
      scoreSummary: 'skill-score-summary',
      celebrationImage: 'skill-celebration-image',
      retryBtn: 'skill-retry-btn',
      backBtn: 'skill-back-btn',
      blitzToggle: 'blitz-toggle',
      timerText: 'skill-timer-text',
      divisorInput: 'divisor-input',
      quotientInput: 'quotient-input',
    },
    navPage: 'skills.html',
    generatorId: GENERATOR_ID,
    topics: ['divisionFacts'],
    validateSetup,
    generateProblem,
    renderPrompt,
    notCorrectText: (problem) => `Not quite — ${problem.promptText} = ${problem.answerDisplay}`,
  });
}
