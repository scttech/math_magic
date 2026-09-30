import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { getById } from '../core/registry.js';
import { linkifyGlossaryTerms } from '../app/glossary.js';

const els = {};

function cacheElements() {
  els.content = document.getElementById('help-content');
  els.notFound = document.getElementById('help-not-found');
  els.context = document.getElementById('help-context');
  els.label = document.getElementById('help-label');
  els.description = document.getElementById('help-description');
  els.strategySteps = document.getElementById('help-strategy-steps');
  els.showWorkedBtn = document.getElementById('show-worked-solution-btn');
  els.workedSolution = document.getElementById('worked-solution');
  els.workedSteps = document.getElementById('worked-solution-steps');
  els.workedAnswer = document.getElementById('worked-solution-answer');
  els.closeTabBtn = document.getElementById('close-tab-btn');
}

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    generatorId: params.get('generatorId'),
    meta: params.get('meta'),
    prompt: params.get('prompt'),
    answer: params.get('answer'),
  };
}

function showNotFound() {
  els.content.hidden = true;
  els.notFound.hidden = false;
}

function renderHelp(params) {
  const generatorModule = getById(params.generatorId);
  if (!generatorModule || typeof generatorModule.explain !== 'function') {
    showNotFound();
    return;
  }

  let meta;
  try {
    meta = JSON.parse(params.meta);
  } catch {
    showNotFound();
    return;
  }

  const { strategy, workedSteps, finalAnswerDisplay } = generatorModule.explain(meta);

  els.context.innerHTML = params.prompt ? `You were working on: "${linkifyGlossaryTerms(params.prompt)}"` : '';
  els.label.textContent = generatorModule.label;
  if (generatorModule.description) {
    els.description.innerHTML = linkifyGlossaryTerms(generatorModule.description);
    els.description.hidden = false;
  } else {
    els.description.hidden = true;
  }
  els.strategySteps.innerHTML = strategy.map((step) => `<li>${linkifyGlossaryTerms(step)}</li>`).join('');

  els.showWorkedBtn.addEventListener('click', () => {
    els.workedSteps.innerHTML = workedSteps.map((step) => `<li>${linkifyGlossaryTerms(step)}</li>`).join('');
    els.workedAnswer.textContent = `Final answer: ${params.answer || finalAnswerDisplay}`;
    els.workedSolution.hidden = false;
    els.showWorkedBtn.hidden = true;
  });
}

export function init() {
  cacheElements();
  renderNav(null);

  const params = parseParams();
  if (params.generatorId) {
    renderHelp(params);
  } else {
    showNotFound();
  }

  els.closeTabBtn.addEventListener('click', () => window.close());
}
