// The single grade-6 "Word Problems" generator. Its actual questions come
// from templates (built-in ones in wordProblemPatterns.js, plus any the user
// added via Settings) rather than from code here — this module just picks one
// at random each time and hands it to the shared template engine to fill in
// and score.
import { randomChoice } from '../../core/rng.js';
import { WORD_PROBLEM_PATTERNS, getPatternById } from '../../core/wordProblemPatterns.js';
import { listUserTemplatesForPattern } from '../../core/wordProblemTemplateStore.js';
import { getWordLists } from '../../core/wordListStore.js';
import { renderTemplate } from '../../core/wordProblemTemplateEngine.js';

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
  explain(meta) {
    return getPatternById(meta.patternId).explain(meta.values);
  },
};

export const generators = [templatedWordProblem];
