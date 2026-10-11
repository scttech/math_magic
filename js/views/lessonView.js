import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { getLessonById } from '../core/lessons.js';
import { getById } from '../core/registry.js';
import { createRng, randomSeed } from '../core/rng.js';
import { linkifyGlossaryTerms, escapeHtml } from '../app/glossary.js';
import { topicLabel } from '../app/topicLabels.js';
import { getActiveProfileId } from '../core/profileStore.js';
import { recordCheckpointCorrect } from '../core/lessonProgress.js';

const els = {};

function cacheElements() {
  els.backLink = document.getElementById('lesson-back-link');
  els.title = document.getElementById('lesson-title');
  els.summary = document.getElementById('lesson-summary');
  els.blocksContainer = document.getElementById('lesson-blocks');
  els.notFound = document.getElementById('lesson-not-found');
}

function renderTextBlock(block) {
  const section = document.createElement('section');
  section.className = 'lesson-block lesson-text';
  section.innerHTML = `<h2>${escapeHtml(block.heading)}</h2>${block.body.map((p) => `<p>${linkifyGlossaryTerms(p)}</p>`).join('')}`;
  return section;
}

function renderExampleBlock(block) {
  const section = document.createElement('section');
  section.className = 'lesson-block lesson-example';
  section.innerHTML = `
    <h3>${escapeHtml(block.heading)}</h3>
    <p class="lesson-example-prompt">${escapeHtml(block.prompt)}</p>
    <ol>${block.steps.map((step) => `<li>${linkifyGlossaryTerms(step)}</li>`).join('')}</ol>
    <p class="lesson-example-answer">Answer: ${escapeHtml(block.answerDisplay)}</p>`;
  return section;
}

function renderCheckpointBlock(lesson, block, blockIndex) {
  const section = document.createElement('section');
  section.className = 'lesson-block lesson-checkpoint card';
  section.innerHTML = `
    <p class="lesson-checkpoint-intro">${escapeHtml(block.intro)}</p>
    <p class="checkpoint-prompt" style="font-size: 1.1rem"></p>
    <form class="checkpoint-form">
      <div class="field-row">
        <label>Your Answer</label>
        <input type="text" class="checkpoint-input" autocomplete="off" />
      </div>
      <button type="submit" class="btn">Check Answer</button>
    </form>
    <div class="feedback checkpoint-feedback" hidden></div>
    <button type="button" class="btn secondary checkpoint-explain-btn" hidden>Show Me How</button>
    <div class="checkpoint-explanation" hidden></div>
    <button type="button" class="btn secondary checkpoint-retry-btn" hidden>Try Another</button>`;

  const generatorModule = getById(lesson.generatorId);
  const promptEl = section.querySelector('.checkpoint-prompt');
  const form = section.querySelector('.checkpoint-form');
  const input = section.querySelector('.checkpoint-input');
  const submitBtn = form.querySelector('button[type="submit"]');
  const feedbackEl = section.querySelector('.checkpoint-feedback');
  const explainBtn = section.querySelector('.checkpoint-explain-btn');
  const explanationEl = section.querySelector('.checkpoint-explanation');
  const retryBtn = section.querySelector('.checkpoint-retry-btn');

  let currentProblem = null;

  function newProblem() {
    currentProblem = generatorModule.generate({ difficulty: block.difficulty, rng: createRng(randomSeed()) });
    promptEl.innerHTML = linkifyGlossaryTerms(currentProblem.promptText);
    input.value = '';
    input.disabled = false;
    submitBtn.hidden = false;
    feedbackEl.hidden = true;
    feedbackEl.className = 'feedback checkpoint-feedback';
    explainBtn.hidden = true;
    explanationEl.hidden = true;
    explanationEl.innerHTML = '';
    retryBtn.hidden = true;
    input.focus({ preventScroll: true });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const userInput = input.value.trim();
    if (!userInput) return;
    const isCorrect = currentProblem.checkAnswer(userInput);
    if (isCorrect) recordCheckpointCorrect(getActiveProfileId(), lesson.id, blockIndex);
    feedbackEl.hidden = false;
    feedbackEl.classList.add(isCorrect ? 'correct' : 'incorrect');
    feedbackEl.textContent = isCorrect ? 'Correct! Nice work.' : `Not quite. The correct answer was: ${currentProblem.answerDisplay}`;
    input.disabled = true;
    submitBtn.hidden = true;
    explainBtn.hidden = false;
    retryBtn.hidden = false;
  });

  explainBtn.addEventListener('click', () => {
    if (typeof generatorModule.explain !== 'function') return;
    const { strategy, workedSteps, finalAnswerDisplay } = generatorModule.explain(currentProblem.meta);
    explanationEl.innerHTML = `
      <p><strong>Steps to solve:</strong></p>
      <ol>${strategy.map((s) => `<li>${linkifyGlossaryTerms(s)}</li>`).join('')}</ol>
      <p><strong>Worked solution:</strong></p>
      <ol>${workedSteps.map((s) => `<li>${linkifyGlossaryTerms(s)}</li>`).join('')}</ol>
      <p class="feedback correct">Final answer: ${escapeHtml(finalAnswerDisplay)}</p>`;
    explanationEl.hidden = false;
    explainBtn.hidden = true;
  });

  retryBtn.addEventListener('click', newProblem);

  newProblem();
  return section;
}

function renderLesson(lesson) {
  els.backLink.href = `learn-topic.html?grade=${encodeURIComponent(lesson.grade)}&topic=${encodeURIComponent(lesson.topic)}`;
  els.title.textContent = lesson.title;
  els.summary.textContent = lesson.summary;
  document.title = `Math Magic — ${lesson.title}`;

  lesson.blocks.forEach((block, blockIndex) => {
    let el;
    if (block.type === 'text') el = renderTextBlock(block);
    else if (block.type === 'example') el = renderExampleBlock(block);
    else if (block.type === 'checkpoint') el = renderCheckpointBlock(lesson, block, blockIndex);
    else return;
    els.blocksContainer.appendChild(el);
  });

  const cta = document.createElement('section');
  cta.className = 'lesson-block lesson-cta';
  cta.innerHTML = `
    <h2>Ready to practice more?</h2>
    <p class="progress-text">Keep going with a full ${escapeHtml(topicLabel(lesson.topic))} quiz.</p>
    <a class="btn" href="quiz.html?grade=${encodeURIComponent(lesson.grade)}&topic=${encodeURIComponent(lesson.topic)}">Practice This Topic</a>`;
  els.blocksContainer.appendChild(cta);
}

function showNotFound() {
  els.blocksContainer.hidden = true;
  els.summary.hidden = true;
  els.notFound.hidden = false;
}

export function init() {
  cacheElements();
  renderNav('learn.html');

  const params = new URLSearchParams(window.location.search);
  const lesson = getLessonById(params.get('id'));
  if (!lesson) {
    showNotFound();
    return;
  }
  renderLesson(lesson);
}
