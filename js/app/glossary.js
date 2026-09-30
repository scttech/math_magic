// A small glossary of math vocabulary that shows up in generator explain()
// text and problem prompts. linkifyGlossaryTerms() turns the first mention of
// each known term in a string into a clickable button; glossaryPopover.js
// (mounted once site-wide, alongside the calculator) shows the definition
// when one of those buttons is clicked.
//
// Deliberately NOT tied to any one generator — it matches on the words
// themselves, so a term is defined everywhere it appears (help text, quiz
// prompts) without every generator having to know about the glossary.

export const GLOSSARY_TERMS = [
  { key: 'gcf', match: ['greatest common factor', 'GCF'], term: 'GCF', definition: 'Short for "greatest common factor" — the largest number that divides evenly into two or more numbers. Example: the GCF of 12 and 18 is 6.' },
  { key: 'lcm', match: ['least common multiple', 'LCM'], term: 'LCM', definition: 'Short for "least common multiple" — the smallest number that both numbers divide into evenly. Example: the LCM of 4 and 6 is 12.' },
  { key: 'distributiveProperty', match: ['distributive property'], term: 'Distributive Property', definition: 'A rule for multiplying a number by a sum: a(b + c) = a×b + a×c. Multiply the outside number by each term inside the parentheses, then add the results.' },
  { key: 'absoluteValue', match: ['absolute value'], term: 'Absolute Value', definition: 'The distance a number is from 0 on the number line, written |n|. Distance is never negative, so absolute value is always 0 or positive.' },
  { key: 'coefficient', match: ['coefficient', 'coefficients'], term: 'Coefficient', definition: 'The number multiplied by a variable in a term, like the 5 in 5x.' },
  { key: 'constantTerm', match: ['constant term', 'constant terms'], term: 'Constant Term', definition: 'The part of an expression that is just a number, with no variable attached, like the 7 in 3x + 7.' },
  { key: 'variable', match: ['variable', 'variables'], term: 'Variable', definition: 'A letter that stands in for a number that can change or is unknown, like x or n.' },
  { key: 'likeTerms', match: ['like terms'], term: 'Like Terms', definition: 'Terms that have the exact same variable part, like 3x and 5x. They can be combined by adding or subtracting their coefficients.' },
  { key: 'exponent', match: ['exponent', 'exponents'], term: 'Exponent', definition: 'The small raised number that tells how many times to multiply the base by itself, like the 3 in 2³ = 2 × 2 × 2.' },
  { key: 'integer', match: ['integer', 'integers'], term: 'Integer', definition: 'A whole number that can be positive, negative, or zero — no fractions or decimals, like -5, 0, or 12.' },
  { key: 'inequality', match: ['inequality', 'inequalities'], term: 'Inequality', definition: 'A comparison between two values that aren’t necessarily equal, using symbols like <, >, ≤, or ≥.' },
  { key: 'reciprocal', match: ['reciprocal', 'reciprocals'], term: 'Reciprocal', definition: 'A fraction flipped upside down. The reciprocal of 2/3 is 3/2. A number times its reciprocal always equals 1.' },
  { key: 'numerator', match: ['numerator', 'numerators'], term: 'Numerator', definition: 'The top number in a fraction — it tells how many parts you have.' },
  { key: 'denominator', match: ['denominator', 'denominators'], term: 'Denominator', definition: 'The bottom number in a fraction — it tells how many equal parts the whole is divided into.' },
  { key: 'mixedNumber', match: ['mixed number', 'mixed numbers'], term: 'Mixed Number', definition: 'A whole number and a fraction written together, like 2 1/3.' },
  { key: 'improperFraction', match: ['improper fraction', 'improper fractions'], term: 'Improper Fraction', definition: 'A fraction where the numerator is greater than or equal to the denominator, like 7/4.' },
  { key: 'unitRate', match: ['unit rate'], term: 'Unit Rate', definition: 'A rate simplified so the second number is 1, like "$4 per item" instead of "$12 per 3 items".' },
  { key: 'mean', match: ['mean'], term: 'Mean', definition: 'The "average" of a data set — add up all the values, then divide by how many values there are.' },
  { key: 'median', match: ['median'], term: 'Median', definition: 'The middle value when a data set is put in order from least to greatest.' },
  { key: 'mode', match: ['mode'], term: 'Mode', definition: 'The value that appears most often in a data set. A data set can have one mode, more than one, or none.' },
  { key: 'range', match: ['range'], term: 'Range', definition: 'The difference between the greatest and least values in a data set: max − min.' },
  { key: 'iqr', match: ['interquartile range', 'IQR'], term: 'IQR', definition: 'Short for "interquartile range" — the width of the middle 50% of a data set: Q3 − Q1.' },
  { key: 'mad', match: ['mean absolute deviation', 'MAD'], term: 'MAD', definition: 'Short for "mean absolute deviation" — the average distance between each value in a data set and the mean.' },
  { key: 'quadrant', match: ['quadrant', 'quadrants'], term: 'Quadrant', definition: 'One of the four regions the x- and y-axes divide the coordinate plane into.' },
  { key: 'orderedPair', match: ['ordered pair', 'ordered pairs'], term: 'Ordered Pair', definition: 'A pair of numbers (x, y) that gives a point’s location on the coordinate plane.' },
  { key: 'surfaceArea', match: ['surface area'], term: 'Surface Area', definition: 'The total area of all the faces (flat surfaces) of a 3D shape, added together.' },
  { key: 'net', match: ['net'], term: 'Net', definition: 'A 2D shape that folds up into a 3D solid — unfolding a box flat gives you its net.' },
  { key: 'hypotenuse', match: ['hypotenuse'], term: 'Hypotenuse', definition: 'The longest side of a right triangle — the one opposite the right angle.' },
  { key: 'rationalNumber', match: ['rational number', 'rational numbers'], term: 'Rational Number', definition: 'A number that can be written as a fraction of two integers — this includes whole numbers, fractions, terminating decimals, and repeating decimals.' },
  { key: 'irrationalNumber', match: ['irrational number', 'irrational numbers'], term: 'Irrational Number', definition: 'A number that cannot be written as a fraction — its decimal form never terminates and never repeats, like π or √2.' },
  { key: 'perfectSquare', match: ['perfect square', 'perfect squares'], term: 'Perfect Square', definition: 'A number you get by squaring a whole number, like 25 (5 × 5) or 36 (6 × 6). Its square root is a whole number.' },
];

const GLOSSARY_BY_KEY = new Map(GLOSSARY_TERMS.map((entry) => [entry.key, entry]));

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Longer aliases first, so e.g. "mean absolute deviation" matches whole
// rather than the bare "mean" alias grabbing just its first word.
const ALL_ALIASES = GLOSSARY_TERMS.flatMap((entry) => entry.match.map((alias) => ({ alias, key: entry.key })))
  .sort((a, b) => b.alias.length - a.alias.length);

const ALIAS_TO_KEY = new Map(ALL_ALIASES.map(({ alias, key }) => [alias.toLowerCase(), key]));

const GLOSSARY_REGEX = new RegExp(`\\b(${ALL_ALIASES.map(({ alias }) => escapeRegExp(alias)).join('|')})\\b`, 'gi');

export function getGlossaryEntry(key) {
  return GLOSSARY_BY_KEY.get(key) || null;
}

export function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/**
 * Escape a plain-text string for HTML, wrapping the first mention of each
 * known glossary term in a clickable button. Safe to assign to .innerHTML —
 * everything outside a recognized term is escaped, and only trusted markup
 * wraps the recognized terms themselves.
 */
export function linkifyGlossaryTerms(text) {
  GLOSSARY_REGEX.lastIndex = 0;
  let html = '';
  let lastIndex = 0;
  let match;
  const seenKeys = new Set();
  while ((match = GLOSSARY_REGEX.exec(text))) {
    const key = ALIAS_TO_KEY.get(match[0].toLowerCase());
    html += escapeHtml(text.slice(lastIndex, match.index));
    if (seenKeys.has(key)) {
      html += escapeHtml(match[0]);
    } else {
      seenKeys.add(key);
      html += `<button type="button" class="glossary-term" data-glossary-term="${key}">${escapeHtml(match[0])}</button>`;
    }
    lastIndex = GLOSSARY_REGEX.lastIndex;
  }
  html += escapeHtml(text.slice(lastIndex));
  return html;
}
