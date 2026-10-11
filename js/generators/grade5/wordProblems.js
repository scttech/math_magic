// The grade-5 "Word Problems" generator. Shares the same template+pattern
// engine and the same shared pattern list as grade 6's wordProblems.js — the
// patterns themselves are grade-agnostic math shapes (multiply, split evenly,
// find a volume, etc.), so both grades draw from the same pool, each under
// its own generator id.
import { randomChoice } from '../../core/rng.js';
import { WORD_PROBLEM_PATTERNS, getPatternById } from '../../core/wordProblemPatterns.js';
import { listUserTemplatesForPattern } from '../../core/wordProblemTemplateStore.js';
import { getWordLists } from '../../core/wordListStore.js';
import { renderTemplate } from '../../core/wordProblemTemplateEngine.js';

const GRADE = '5';
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
  id: 'grade5.wordProblems.templatedProblem',
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
  explain(meta) {
    return getPatternById(meta.patternId).explain(meta.values);
  },
};

export const generators = [templatedWordProblem];
