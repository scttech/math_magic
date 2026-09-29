// Generic machinery for word-problem templates: parsing <tag> placeholders out
// of author-written text, validating a template against a pattern's required
// roles, and rendering a template into a concrete problem. Grade/content-agnostic
// on purpose — the grade-6 word problem patterns (js/core/wordProblemPatterns.js)
// and the Settings template editor both build on this.
//
// Tag syntax: <type> or <type:name>.
//   - Entity types (person, food, object) draw one random word per unique
//     (type, name) pair per template instance; the same tag reused elsewhere
//     in the text (same type, same name — including both unnamed) resolves to
//     the same word, so "<person> ... <person>" is the same person twice.
//   - <mixed_number:name>, <amount:name>, and <random_number_MIN_to_MAX:name>
//     are "value" roles: a pattern declares which named roles it needs and
//     computes the answer from them. Each distinct name gets its own
//     independently generated value. A random_number tag's range is whatever
//     the author wrote in the tag itself (e.g. <random_number_2_to_12:quantity>).
//     Use <mixed_number> for fraction-style quantities (pounds, etc.) and
//     <amount> for decimal quantities like prices, where "$7 2/3" would be wrong.
import { randomInt, randomChoice } from './rng.js';
import { reduceFraction, formatMixedNumber, roundTo } from './problemGenerator.js';

export const ENTITY_TYPES = ['person', 'food', 'object'];

// Default <mixed_number> ranges by difficulty, matching the generosity of the
// site's existing fraction generators (js/generators/grade6/fractionsDecimals.js).
const MIXED_NUMBER_RANGES = {
  easy: { maxWhole: 6, denominators: [2, 3, 4, 5, 6] },
  medium: { maxWhole: 9, denominators: [2, 3, 4, 5, 6, 8, 10] },
  hard: { maxWhole: 12, denominators: [2, 3, 4, 5, 6, 8, 9, 10, 12] },
};

// Default <amount> ranges by difficulty — a decimal value (e.g. a price), always to the cent.
const AMOUNT_RANGES = {
  easy: { min: 1, max: 9 },
  medium: { min: 1, max: 20 },
  hard: { min: 1, max: 50 },
};

/** A random improper-fraction value (usable with formatMixedNumber) sized for the given difficulty. */
export function generateMixedNumber(rng, difficulty) {
  const { maxWhole, denominators } = MIXED_NUMBER_RANGES[difficulty] || MIXED_NUMBER_RANGES.medium;
  const whole = randomInt(rng, 1, maxWhole);
  const den = randomChoice(rng, denominators);
  const num = randomInt(rng, 1, den - 1);
  return reduceFraction(whole * den + num, den);
}

/** A random decimal value (2 places, e.g. a price) sized for the given difficulty. */
export function generateAmount(rng, difficulty) {
  const { min, max } = AMOUNT_RANGES[difficulty] || AMOUNT_RANGES.medium;
  const cents = randomInt(rng, min * 100, max * 100);
  return roundTo(cents / 100, 2);
}

const TAG_RE = /<([^<>]+)>/g;

/** Every <tag> occurrence in text, in order, with its parsed type/name/range. */
export function parseTags(text) {
  const results = [];
  let match;
  TAG_RE.lastIndex = 0;
  while ((match = TAG_RE.exec(text))) {
    const inner = match[1];
    const colonIndex = inner.indexOf(':');
    const base = colonIndex === -1 ? inner : inner.slice(0, colonIndex);
    const name = colonIndex === -1 ? null : inner.slice(colonIndex + 1) || null;
    const randomNumberMatch = /^random_number_(\d+)_to_(\d+)$/.exec(base);
    results.push({
      raw: match[0],
      index: match.index,
      base,
      type: randomNumberMatch ? 'random_number' : base,
      name,
      min: randomNumberMatch ? Number(randomNumberMatch[1]) : null,
      max: randomNumberMatch ? Number(randomNumberMatch[2]) : null,
    });
  }
  return results;
}

function roleTagText(role) {
  if (role.type === 'random_number') {
    const [min, max] = role.exampleRange || [1, 10];
    return `random_number_${min}_to_${max}:${role.name}`;
  }
  return `${role.type}:${role.name}`;
}

/**
 * Check template text for tag-syntax problems and, if a pattern is given,
 * confirm every role the pattern requires is present. Returns { valid, errors }.
 */
export function validateTemplateText(text, pattern) {
  const errors = [];
  const trimmed = (text || '').trim();
  if (trimmed.length < 10) {
    errors.push('Template text is too short.');
    return { valid: false, errors };
  }

  const tags = parseTags(trimmed);
  if (tags.length === 0) {
    errors.push('Template text has no placeholder tags (e.g. <person>, <mixed_number:start>).');
  }

  for (const tag of tags) {
    if (tag.type === 'random_number') {
      if (!Number.isInteger(tag.min) || !Number.isInteger(tag.max) || tag.min >= tag.max) {
        errors.push(`Invalid tag <${tag.base}>: needs an increasing whole-number range, e.g. <random_number_1_to_10>.`);
      }
      if (!tag.name) {
        errors.push(`Tag <${tag.base}> needs a role name, e.g. <${tag.base}:quantity>.`);
      }
    } else if (tag.type === 'mixed_number' || tag.type === 'amount') {
      if (!tag.name) {
        errors.push(`Tag <${tag.type}> needs a role name, e.g. <${tag.type}:${tag.type === 'amount' ? 'price' : 'start'}>.`);
      }
    } else if (!ENTITY_TYPES.includes(tag.type)) {
      errors.push(`Unknown tag type "<${tag.base}>". Allowed: person, food, object, mixed_number, amount, random_number_MIN_to_MAX.`);
    }
  }

  if (pattern) {
    for (const role of pattern.requiredRoles) {
      const found = tags.some((t) => t.type === role.type && t.name === role.name);
      if (!found) {
        errors.push(`Missing required tag <${roleTagText(role)}> for the "${pattern.label}" pattern.`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Fill a template's tags with random values, run the pattern's answer
 * formula, and return the rendered problem: { promptText, answer, answerDisplay, checkAnswer }.
 */
export function renderTemplate({ text, pattern, rng, difficulty, wordLists }) {
  const tags = parseTags(text);
  const entityValues = {};
  const rawValues = {};

  for (const tag of tags) {
    if (ENTITY_TYPES.includes(tag.type)) {
      const key = `${tag.type}:${tag.name || 'default'}`;
      if (!(key in entityValues)) {
        entityValues[key] = randomChoice(rng, wordLists[tag.type]);
      }
    } else if (tag.type === 'mixed_number') {
      if (!(tag.name in rawValues)) {
        rawValues[tag.name] = generateMixedNumber(rng, difficulty);
      }
    } else if (tag.type === 'amount') {
      if (!(tag.name in rawValues)) {
        rawValues[tag.name] = generateAmount(rng, difficulty);
      }
    } else if (tag.type === 'random_number') {
      if (!(tag.name in rawValues)) {
        rawValues[tag.name] = randomInt(rng, tag.min, tag.max);
      }
    }
  }

  const values = typeof pattern.adjustValues === 'function' ? pattern.adjustValues(rawValues, rng, difficulty) : rawValues;
  const { answer, answerDisplay, checkAnswer } = pattern.compute(values);

  let promptText = '';
  let cursor = 0;
  for (const tag of tags) {
    promptText += text.slice(cursor, tag.index);
    if (ENTITY_TYPES.includes(tag.type)) {
      promptText += entityValues[`${tag.type}:${tag.name || 'default'}`];
    } else if (tag.type === 'mixed_number') {
      promptText += formatMixedNumber(values[tag.name]);
    } else if (tag.type === 'amount') {
      promptText += Number(values[tag.name]).toFixed(2);
    } else if (tag.type === 'random_number') {
      promptText += String(values[tag.name]);
    } else {
      promptText += tag.raw;
    }
    cursor = tag.index + tag.raw.length;
  }
  promptText += text.slice(cursor);

  return { promptText, answer, answerDisplay, checkAnswer };
}
