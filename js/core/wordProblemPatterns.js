// The fixed set of word-problem "shapes": each pattern owns an answer
// formula (compute) and, where the math needs it, a cross-role constraint
// (adjustValues — e.g. "consumed" must be less than what's on hand). All the
// wording is separate: any number of templates (built-in here, or user-added
// via Settings) can reuse the same pattern with different <person>/<food>/
// <object> flavor. See wordProblemTemplateEngine.js for how templates + a
// pattern turn into a concrete problem.
import { addFractions, subFractions, divFractions, reduceFraction, fractionsEqual, formatMixedNumber, fractionCheckAnswer, roundTo, numericCheckAnswer } from './problemGenerator.js';
import { generateMixedNumber } from './wordProblemTemplateEngine.js';

function fractionLessThan(a, b) {
  return a.num * b.den < b.num * a.den;
}

const combineThenRemove = {
  id: 'combineThenRemove',
  label: 'Start, Gain, Then Remove',
  description: 'Someone starts with an amount of something, gains more, then some is used up or removed. The answer is what remains.',
  requiredRoles: [
    { type: 'mixed_number', name: 'start', hint: 'starting amount' },
    { type: 'mixed_number', name: 'gained', hint: 'amount gained or added' },
    { type: 'mixed_number', name: 'consumed', hint: 'amount used or removed' },
  ],
  adjustValues(values, rng, difficulty) {
    const total = addFractions(values.start, values.gained);
    if (fractionLessThan(values.consumed, total)) return values;
    // "Consumed" must be less than what's on hand — retry a few times, then
    // fall back to a guaranteed-smaller value so this always terminates.
    let consumed = values.consumed;
    let attempts = 0;
    while (!fractionLessThan(consumed, total) && attempts < 30) {
      consumed = generateMixedNumber(rng, difficulty);
      attempts += 1;
    }
    if (!fractionLessThan(consumed, total)) {
      consumed = reduceFraction(total.num, total.den * 2);
    }
    return { ...values, consumed };
  },
  compute(values) {
    const remaining = subFractions(addFractions(values.start, values.gained), values.consumed);
    return { answer: remaining, answerDisplay: formatMixedNumber(remaining), checkAnswer: fractionCheckAnswer(remaining) };
  },
  explain(values) {
    const total = addFractions(values.start, values.gained);
    const remaining = subFractions(total, values.consumed);
    return {
      strategy: [
        'Add the starting amount and the amount gained to find the total on hand.',
        'Subtract the amount used or removed from that total.',
        'The result is what is left.',
      ],
      workedSteps: [
        `Add the starting amount and the amount gained: ${formatMixedNumber(values.start)} + ${formatMixedNumber(values.gained)} = ${formatMixedNumber(total)}.`,
        `Subtract the amount used or removed: ${formatMixedNumber(total)} − ${formatMixedNumber(values.consumed)} = ${formatMixedNumber(remaining)}.`,
      ],
      finalAnswerDisplay: formatMixedNumber(remaining),
    };
  },
  defaultTemplates: [
    '<person> has <mixed_number:start> pounds of <food> at home, then buys an additional <mixed_number:gained> pounds at the store. <person> consumes <mixed_number:consumed> pounds of <food> over the week. How many pounds of <food> does <person> have left?',
  ],
};

const multiplyRate = {
  id: 'multiplyRate',
  label: 'Buy Several at a Rate',
  description: 'Someone buys a whole number of items, each costing the same amount. The answer is the total cost.',
  requiredRoles: [
    { type: 'random_number', name: 'quantity', exampleRange: [2, 12], hint: 'how many items' },
    { type: 'amount', name: 'pricePerItem', hint: 'cost per item, e.g. a dollar price — use <amount>, not <mixed_number>, so it reads like real money' },
  ],
  compute(values) {
    const total = roundTo(values.quantity * values.pricePerItem, 2);
    return { answer: total, answerDisplay: total.toFixed(2), checkAnswer: numericCheckAnswer(total, 0.005) };
  },
  explain(values) {
    const total = roundTo(values.quantity * values.pricePerItem, 2);
    return {
      strategy: ['Multiply the price of one item by how many items were bought.', 'The result is the total cost.'],
      workedSteps: [`Multiply the quantity by the price per item: ${values.quantity} × $${values.pricePerItem.toFixed(2)} = $${total.toFixed(2)}.`],
      finalAnswerDisplay: total.toFixed(2),
    };
  },
  defaultTemplates: [
    '<person> buys <random_number_2_to_12:quantity> <object>s. Each <object> costs $<amount:pricePerItem>. How much did <person> spend in total?',
  ],
};

const compareTotals = {
  id: 'compareTotals',
  label: 'Compare Two Amounts',
  description: 'Two people each have an amount of the same thing. The answer is how much more the larger amount has.',
  requiredRoles: [
    { type: 'mixed_number', name: 'amountA', hint: "first person's amount" },
    { type: 'mixed_number', name: 'amountB', hint: "second person's amount" },
  ],
  adjustValues(values) {
    if (!fractionsEqual(values.amountA, values.amountB)) return values;
    // Equal amounts make "how many more" a trivial zero — nudge B so the comparison means something.
    return { ...values, amountB: reduceFraction(values.amountB.num + 1, values.amountB.den) };
  },
  compute(values) {
    const diff = subFractions(values.amountA, values.amountB);
    const positiveDiff = diff.num < 0 ? { num: -diff.num, den: diff.den } : diff;
    return { answer: positiveDiff, answerDisplay: formatMixedNumber(positiveDiff), checkAnswer: fractionCheckAnswer(positiveDiff) };
  },
  explain(values) {
    const diff = subFractions(values.amountA, values.amountB);
    const positiveDiff = diff.num < 0 ? { num: -diff.num, den: diff.den } : diff;
    const larger = diff.num < 0 ? values.amountB : values.amountA;
    const smaller = diff.num < 0 ? values.amountA : values.amountB;
    return {
      strategy: [
        'Figure out which amount is larger.',
        'Subtract the smaller amount from the larger amount.',
        'The result is how much more the larger amount has.',
      ],
      workedSteps: [
        `Compare the two amounts: ${formatMixedNumber(values.amountA)} and ${formatMixedNumber(values.amountB)}. The larger amount is ${formatMixedNumber(larger)}.`,
        `Subtract the smaller from the larger: ${formatMixedNumber(larger)} − ${formatMixedNumber(smaller)} = ${formatMixedNumber(positiveDiff)}.`,
      ],
      finalAnswerDisplay: formatMixedNumber(positiveDiff),
    };
  },
  defaultTemplates: [
    '<person> has <mixed_number:amountA> pounds of <food>. A friend has <mixed_number:amountB> pounds of <food>. How many more pounds of <food> does the person with more have?',
  ],
};

const divideShare = {
  id: 'divideShare',
  label: 'Split Evenly',
  description: 'An amount is split evenly among a whole number of people. The answer is each share.',
  requiredRoles: [
    { type: 'mixed_number', name: 'total', hint: 'total amount to split' },
    { type: 'random_number', name: 'shareCount', exampleRange: [2, 6], hint: 'how many ways to split it' },
  ],
  compute(values) {
    const each = divFractions(values.total, { num: values.shareCount, den: 1 });
    return { answer: each, answerDisplay: formatMixedNumber(each), checkAnswer: fractionCheckAnswer(each) };
  },
  explain(values) {
    const each = divFractions(values.total, { num: values.shareCount, den: 1 });
    return {
      strategy: ['Divide the total amount by how many ways it is being split.', 'The result is each share.'],
      workedSteps: [`Divide the total by the number of shares: ${formatMixedNumber(values.total)} ÷ ${values.shareCount} = ${formatMixedNumber(each)}.`],
      finalAnswerDisplay: formatMixedNumber(each),
    };
  },
  defaultTemplates: [
    '<person> has <mixed_number:total> pounds of <food> and wants to split it evenly among <random_number_2_to_6:shareCount> friends. How many pounds of <food> does each friend get?',
  ],
};

const wholeNumberProduct = {
  id: 'wholeNumberProduct',
  label: 'Multiply Two Whole Numbers',
  description: 'Something is arranged in equal groups (rows, boxes, packs). The answer is the total count.',
  requiredRoles: [
    { type: 'random_number', name: 'groups', exampleRange: [4, 20], hint: 'number of equal groups' },
    { type: 'random_number', name: 'perGroup', exampleRange: [6, 50], hint: 'amount in each group' },
  ],
  compute(values) {
    const total = values.groups * values.perGroup;
    return { answer: total, answerDisplay: `${total}`, checkAnswer: numericCheckAnswer(total, 1e-9) };
  },
  explain(values) {
    const total = values.groups * values.perGroup;
    return {
      strategy: ['Multiply the number of groups by the amount in each group.'],
      workedSteps: [`${values.groups} × ${values.perGroup} = ${total}.`],
      finalAnswerDisplay: `${total}`,
    };
  },
  defaultTemplates: [
    '<person> arranges <object>s into <random_number_4_to_20:groups> equal rows, with <random_number_6_to_50:perGroup> <object>s in each row. How many <object>s are there in total?',
  ],
};

const boxVolume = {
  id: 'boxVolume',
  label: 'Volume of a Box',
  description: 'A rectangular box has a length, width, and height. The answer is its volume.',
  requiredRoles: [
    { type: 'random_number', name: 'length', exampleRange: [2, 12], hint: 'length of the box' },
    { type: 'random_number', name: 'width', exampleRange: [2, 12], hint: 'width of the box' },
    { type: 'random_number', name: 'height', exampleRange: [2, 12], hint: 'height of the box' },
  ],
  compute(values) {
    const volume = values.length * values.width * values.height;
    return { answer: volume, answerDisplay: `${volume} cubic units`, checkAnswer: numericCheckAnswer(volume, 1e-9) };
  },
  explain(values) {
    const volume = values.length * values.width * values.height;
    return {
      strategy: ['Volume of a rectangular box = length × width × height.'],
      workedSteps: [`${values.length} × ${values.width} × ${values.height} = ${volume}.`],
      finalAnswerDisplay: `${volume} cubic units`,
    };
  },
  defaultTemplates: [
    "<person>'s <object> box is <random_number_2_to_12:length> units long, <random_number_2_to_12:width> units wide, and <random_number_2_to_12:height> units tall. What is the volume of the box?",
  ],
};

const decimalDifference = {
  id: 'decimalDifference',
  label: 'Spend From a Decimal Amount',
  description: 'Someone starts with a decimal amount of money and spends some of it. The answer is what remains.',
  requiredRoles: [
    { type: 'amount', name: 'start', hint: 'starting amount of money' },
    { type: 'amount', name: 'spent', hint: 'amount spent' },
  ],
  adjustValues(values) {
    if (values.spent < values.start) return values;
    return { ...values, spent: roundTo(values.start / 2, 2) };
  },
  compute(values) {
    const remaining = roundTo(values.start - values.spent, 2);
    return { answer: remaining, answerDisplay: remaining.toFixed(2), checkAnswer: numericCheckAnswer(remaining, 0.005) };
  },
  explain(values) {
    const remaining = roundTo(values.start - values.spent, 2);
    return {
      strategy: ['Subtract the amount spent from the starting amount.'],
      workedSteps: [`$${values.start.toFixed(2)} − $${values.spent.toFixed(2)} = $${remaining.toFixed(2)}.`],
      finalAnswerDisplay: remaining.toFixed(2),
    };
  },
  defaultTemplates: ['<person> has $<amount:start> saved up. <person> spends $<amount:spent> on a <object>. How much money does <person> have left?'],
};

const convertMetersCentimeters = {
  id: 'convertMetersCentimeters',
  label: 'Convert Meters to Centimeters',
  description: 'A length is given in meters. The answer is the same length in centimeters.',
  requiredRoles: [{ type: 'random_number', name: 'meters', exampleRange: [2, 40], hint: 'length in meters' }],
  compute(values) {
    const cm = values.meters * 100;
    return { answer: cm, answerDisplay: `${cm} cm`, checkAnswer: numericCheckAnswer(cm, 1e-9) };
  },
  explain(values) {
    const cm = values.meters * 100;
    return {
      strategy: ['1 meter = 100 centimeters.', 'Multiply the number of meters by 100.'],
      workedSteps: [`${values.meters} × 100 = ${cm}.`],
      finalAnswerDisplay: `${cm} cm`,
    };
  },
  defaultTemplates: ['<person> has a ribbon that is <random_number_2_to_40:meters> meters long. How many centimeters long is it?'],
};

export const WORD_PROBLEM_PATTERNS = [
  combineThenRemove,
  multiplyRate,
  compareTotals,
  divideShare,
  wholeNumberProduct,
  boxVolume,
  decimalDifference,
  convertMetersCentimeters,
];

export function getPatternById(id) {
  return WORD_PROBLEM_PATTERNS.find((p) => p.id === id) || null;
}
