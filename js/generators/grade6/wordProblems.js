// The single grade-6 "Word Problems" generator. Its actual questions come
// from templates (built-in ones in wordProblemPatterns.js, plus any the user
// added via Settings) rather than from code here — this module just picks one
// at random each time and hands it to the shared template engine to fill in
// and score.
import { randomChoice } from '../../core/rng.js';
import { WORD_PROBLEM_PATTERNS } from '../../core/wordProblemPatterns.js';
import { listUserTemplatesForPattern } from '../../core/wordProblemTemplateStore.js';
import { getWordLists } from '../../core/wordListStore.js';
import { renderTemplate } from '../../core/wordProblemTemplateEngine.js';
import { registerHelpProvider } from '../../core/helpRegistry.js';

const GRADE = '6';
const TOPIC = 'wordProblems';

function allTemplateEntries() {
  const entries = [];
  for (const pattern of WORD_PROBLEM_PATTERNS) {
    for (const text of pattern.defaultTemplates) {
      entries.push({ pattern, text });
    }
    for (const userTemplate of listUserTemplatesForPattern(pattern.id)) {
      entries.push({ pattern, text: userTemplate.text });
    }
  }
  return entries;
}

const templatedWordProblem = {
  id: 'grade6.wordProblems.templatedProblem',
  grade: GRADE,
  topic: TOPIC,
  label: 'Word Problems',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const entry = randomChoice(rng, allTemplateEntries());
    const wordLists = getWordLists();
    const { promptText, answer, answerDisplay, checkAnswer, values } = renderTemplate({ text: entry.text, pattern: entry.pattern, rng, difficulty, wordLists });
    return {
      promptText,
      answer,
      answerDisplay,
      checkAnswer,
      meta: { generatorId: templatedWordProblem.id, difficulty, patternId: entry.pattern.id, values },
    };
  },
};

/** Builds this word problem instance's help-page URL, carrying its pattern id and exact values so the help page can rebuild the same worked solution. */
export function buildHelpUrl(problem) {
  const params = new URLSearchParams({
    type: 'wordProblem',
    patternId: problem.meta.patternId,
    values: JSON.stringify(problem.meta.values),
    prompt: problem.promptText,
    answer: problem.answerDisplay,
  });
  return `help.html?${params.toString()}`;
}

registerHelpProvider(templatedWordProblem.id, buildHelpUrl);

export const generators = [templatedWordProblem];
