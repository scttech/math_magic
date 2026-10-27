import '../app/init.js';
import { initSkillRunner } from '../app/skillRunner.js';
import { parseNumberSpec } from '../skills/numberSpec.js';
import { generateProblem, GENERATOR_ID, MIN_DENOMINATOR, MAX_DENOMINATOR, isReducible } from '../skills/fractionSimplification.js';

function validateSetup(els) {
  const parsed = parseNumberSpec(els.denominatorInput.value, MIN_DENOMINATOR, MAX_DENOMINATOR);
  const denominators = parsed ? parsed.filter(isReducible) : null;
  if (!denominators || denominators.length === 0) {
    return { error: `Enter at least one denominator that isn't prime, so it can actually be simplified, e.g. "4-12" (${MIN_DENOMINATOR}-${MAX_DENOMINATOR} only).` };
  }
  return { label: els.denominatorInput.value.trim(), args: [denominators] };
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
      retryBtn: 'skill-retry-btn',
      backBtn: 'skill-back-btn',
      blitzToggle: 'blitz-toggle',
      timerText: 'skill-timer-text',
      denominatorInput: 'denominator-input',
    },
    navPage: 'skills.html',
    generatorId: GENERATOR_ID,
    topics: ['fractionSimplification'],
    validateSetup,
    generateProblem,
    renderPrompt,
    notCorrectText: (problem) => `Not quite — ${problem.promptText} simplifies to ${problem.answerDisplay}`,
  });
}
