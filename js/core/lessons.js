// Tutorial-style lesson content: an ordered list of "blocks" (explanatory
// text, a hand-worked example, or an interactive checkpoint) that lessonView.js
// renders in sequence. A checkpoint block doesn't carry its own problem logic
// — it just names a generatorId + difficulty and reuses that generator's real
// generate()/checkAnswer()/explain(), the same machinery the Quiz and Help
// pages use, so a lesson can never drift from how its topic is actually
// scored or explained elsewhere. Only the narrative text here is new content.
export const LESSONS = [
  {
    id: 'grade6-addSubtractFractions',
    grade: '6',
    topic: 'fractionsDecimals',
    generatorId: 'grade6.fractionsDecimals.addSubtractFractions',
    title: 'Adding & Subtracting Fractions',
    summary: 'Why fractions need a common denominator before you can add or subtract them — with practice built in as you go.',
    blocks: [
      {
        type: 'text',
        heading: 'What a Fraction Tells You',
        body: [
          'A fraction like 3/4 has two parts. The denominator (the bottom number) tells you how many equal pieces something is split into. The numerator (the top number) tells you how many of those pieces you have.',
          'The size of one piece depends entirely on the denominator. A piece from something split into fourths is bigger than a piece from something split into eighths — more pieces means each piece is smaller.',
          "That's exactly why you can't just add numerators (or denominators) straight across when two fractions have different denominators: the pieces aren't the same size, so counting them together isn't meaningful yet.",
        ],
      },
      {
        type: 'example',
        heading: 'When the Denominators Already Match',
        prompt: '2/6 + 3/6',
        steps: ['Both fractions are already split into sixths, so the pieces are the same size.', 'Add the numerators: 2 + 3 = 5.', 'Keep the denominator the same. The answer is 5/6.'],
        answerDisplay: '5/6',
      },
      {
        type: 'checkpoint',
        difficulty: 'easy',
        intro: 'Your turn — try one where the denominators already match.',
      },
      {
        type: 'text',
        heading: 'Finding a Common Denominator',
        body: [
          "When the denominators are different, you first have to rewrite both fractions using the same denominator — a common denominator — without changing what either fraction is actually worth.",
          'The easiest common denominator to use is the least common multiple (LCM) of the two denominators.',
          "To rewrite a fraction with a new denominator, multiply the top and bottom by the same number. That keeps the fraction's value exactly the same — it's just written with smaller pieces.",
        ],
      },
      {
        type: 'example',
        heading: 'Different Denominators',
        prompt: '1/4 + 1/6',
        steps: [
          'Find the least common multiple of 4 and 6: it’s 12.',
          'Rewrite 1/4 with a denominator of 12: multiply top and bottom by 3, giving 3/12.',
          'Rewrite 1/6 with a denominator of 12: multiply top and bottom by 2, giving 2/12.',
          'Now add: 3/12 + 2/12 = 5/12.',
        ],
        answerDisplay: '5/12',
      },
      {
        type: 'checkpoint',
        difficulty: 'medium',
        intro: 'Try one with different denominators.',
      },
      {
        type: 'text',
        heading: 'Simplifying and Mixed Numbers',
        body: [
          'Sometimes, after adding or subtracting, the result can be simplified. If the numerator and denominator share a common factor, divide both by it — the greatest common factor (GCF) gets you there in one step.',
          "If the numerator ends up bigger than the denominator (an improper fraction), you can rewrite it as a mixed number — a whole number plus a leftover fraction.",
        ],
      },
      {
        type: 'example',
        heading: 'Simplifying the Result',
        prompt: '5/6 + 1/2',
        steps: [
          'Find the common denominator of 6 and 2: it’s 6.',
          'Rewrite 1/2 as 3/6 (multiply top and bottom by 3).',
          'Add: 5/6 + 3/6 = 8/6.',
          '8/6 is an improper fraction — as a mixed number, that’s 1 2/6.',
          '2/6 can still be simplified: divide top and bottom by 2 to get 1/3.',
          'Final answer: 1 1/3.',
        ],
        answerDisplay: '1 1/3',
      },
      {
        type: 'checkpoint',
        difficulty: 'hard',
        intro: 'One more — this time you may need to simplify or use a mixed number.',
      },
      {
        type: 'text',
        heading: "You've Got It",
        body: [
          "That's the core idea: fractions need matching-size pieces before you can combine them, and a common denominator is what gives you that. From here, it's just practice.",
        ],
      },
    ],
  },
  {
    id: 'grade6-multiplyFractions',
    grade: '6',
    topic: 'fractionsDecimals',
    generatorId: 'grade6.fractionsDecimals.multiplyFractions',
    title: 'Multiplying Fractions',
    summary: 'No common denominator needed this time — multiplying fractions is more direct than adding them.',
    blocks: [
      {
        type: 'text',
        heading: 'A More Direct Rule',
        body: [
          "Adding fractions takes extra work because the pieces have to match size first. Multiplying is more direct: multiply the numerators together, multiply the denominators together, and that's the answer.",
          "Why does that work? Multiplying by a fraction means taking a fraction of a fraction. 1/2 × 1/3 is asking: what's half of one third? You're splitting an already-small piece into even smaller pieces.",
        ],
      },
      {
        type: 'example',
        heading: 'Multiplying Straight Across',
        prompt: '1/2 × 1/3',
        steps: ['Multiply the numerators: 1 × 1 = 1.', 'Multiply the denominators: 2 × 3 = 6.', 'The answer is 1/6 — half of a third is one sixth.'],
        answerDisplay: '1/6',
      },
      {
        type: 'checkpoint',
        difficulty: 'easy',
        intro: 'Give it a try.',
      },
      {
        type: 'text',
        heading: 'Simplify After You Multiply',
        body: [
          "Just like with addition, the result might not be in lowest terms. Once you've multiplied straight across, check whether the numerator and denominator share a common factor, and divide both by it.",
        ],
      },
      {
        type: 'example',
        heading: 'Simplifying the Result',
        prompt: '2/3 × 3/4',
        steps: ['Multiply the numerators: 2 × 3 = 6.', 'Multiply the denominators: 3 × 4 = 12.', 'That gives 6/12. The greatest common factor of 6 and 12 is 6, so divide both by 6.', 'Simplified, the answer is 1/2.'],
        answerDisplay: '1/2',
      },
      {
        type: 'checkpoint',
        difficulty: 'medium',
        intro: 'Try one that needs simplifying.',
      },
      {
        type: 'text',
        heading: 'Bigger Fractions',
        body: ['The same rule works no matter how big the numbers get, even if a numerator ends up larger than its denominator along the way. Multiply straight across, then simplify.'],
      },
      {
        type: 'checkpoint',
        difficulty: 'hard',
        intro: 'One more, with bigger numbers.',
      },
      {
        type: 'text',
        heading: "You've Got It",
        body: ['Multiplying fractions always comes down to the same two steps: multiply straight across, then simplify. No common denominator required.'],
      },
    ],
  },
  {
    id: 'grade6-divideFractions',
    grade: '6',
    topic: 'fractionsDecimals',
    generatorId: 'grade6.fractionsDecimals.divideFractions',
    title: 'Dividing Fractions',
    summary: '"Keep, Change, Flip" — and the reasoning behind why it actually works.',
    blocks: [
      {
        type: 'text',
        heading: 'What Dividing by a Fraction Really Asks',
        body: [
          'Dividing by a fraction answers the question "how many of these fit inside that?" 1/2 ÷ 1/4 is asking: how many fourths fit inside a half? The answer is 2 — a half is the same size as two fourths.',
          'There’s a shortcut for this: dividing by a fraction gives the same result as multiplying by its reciprocal (the fraction flipped upside down). That’s often remembered as "Keep, Change, Flip" — keep the first fraction, change ÷ to ×, and flip the second fraction.',
        ],
      },
      {
        type: 'example',
        heading: 'Keep, Change, Flip',
        prompt: '1/2 ÷ 1/4',
        steps: ['Keep the first fraction: 1/2.', 'Change ÷ to ×, and flip the second fraction: 1/4 becomes 4/1.', 'Multiply: 1/2 × 4/1 = 4/2.', 'Simplify: 4/2 = 2 — exactly what you’d expect, since two fourths fit inside a half.'],
        answerDisplay: '2',
      },
      {
        type: 'checkpoint',
        difficulty: 'easy',
        intro: 'Give it a try.',
      },
      {
        type: 'text',
        heading: 'Finding a Reciprocal',
        body: ['To find a fraction’s reciprocal, just swap the numerator and denominator. The reciprocal of 3/5 is 5/3. Only the second fraction in a division problem gets flipped — the first one stays exactly as it is.'],
      },
      {
        type: 'example',
        heading: 'A Result That Simplifies',
        prompt: '2/3 ÷ 3/5',
        steps: ['Keep the first fraction: 2/3.', 'Flip the second fraction: 3/5 becomes 5/3.', 'Multiply: 2/3 × 5/3 = 10/9.', '10/9 is an improper fraction. As a mixed number, that’s 1 1/9.'],
        answerDisplay: '1 1/9',
      },
      {
        type: 'checkpoint',
        difficulty: 'medium',
        intro: 'Try one that results in an improper fraction.',
      },
      {
        type: 'text',
        heading: 'Bigger Numbers, Same Steps',
        body: ['Keep, change, flip works no matter how large the numbers are. The only extra thing to watch for is simplifying or converting to a mixed number at the end.'],
      },
      {
        type: 'checkpoint',
        difficulty: 'hard',
        intro: 'One more, with bigger numbers.',
      },
      {
        type: 'text',
        heading: "You've Got It",
        body: ['Every fraction division problem turns into a multiplication problem once you flip the second fraction. Keep, change, flip — then simplify.'],
      },
    ],
  },
  {
    id: 'grade6-multiplyDivideDecimals',
    grade: '6',
    topic: 'fractionsDecimals',
    generatorId: 'grade6.fractionsDecimals.multiplyDivideDecimals',
    title: 'Multiplying & Dividing Decimals',
    summary: 'Multiply or divide as if the decimal points weren’t even there, then put the point back where it belongs.',
    blocks: [
      {
        type: 'text',
        heading: 'Multiplying Decimals',
        body: [
          "To multiply two decimals, ignore the decimal points at first and multiply the digits like whole numbers. Then count how many total decimal places were in both factors combined, and place the decimal point that many places from the right in the answer.",
        ],
      },
      {
        type: 'example',
        heading: 'Multiplying Decimals',
        prompt: '0.3 × 0.4',
        steps: ['Ignore the decimal points and multiply: 3 × 4 = 12.', '0.3 has 1 decimal place and 0.4 has 1 decimal place, for a total of 2.', 'Place the decimal point 2 places from the right in 12: 0.12.'],
        answerDisplay: '0.12',
      },
      {
        type: 'text',
        heading: 'Dividing Decimals',
        body: [
          "If the divisor (the number you're dividing by) has a decimal point, multiply both the divisor and the dividend by the same power of 10 so the divisor becomes a whole number. That doesn't change the answer — it just makes the division easier to line up.",
        ],
      },
      {
        type: 'example',
        heading: 'Dividing Decimals',
        prompt: '1.44 ÷ 1.2',
        steps: ['The divisor, 1.2, has a decimal point. Multiply both numbers by 10 to clear it: 14.4 ÷ 12.', 'Divide as usual: 14.4 ÷ 12 = 1.2.'],
        answerDisplay: '1.2',
      },
      {
        type: 'checkpoint',
        difficulty: 'easy',
        intro: 'Try one now — it could be either multiplying or dividing decimals.',
      },
      {
        type: 'checkpoint',
        difficulty: 'medium',
        intro: 'Another one — check carefully which operation it’s asking for.',
      },
      {
        type: 'checkpoint',
        difficulty: 'hard',
        intro: 'One more, with bigger numbers.',
      },
      {
        type: 'text',
        heading: "You've Got It",
        body: ["Whether you're multiplying or dividing, the trick is the same: handle the digits first, then place the decimal point where it belongs."],
      },
    ],
  },
  {
    id: 'grade6-fractionDecimalConversion',
    grade: '6',
    topic: 'fractionsDecimals',
    generatorId: 'grade6.fractionsDecimals.fractionDecimalConversion',
    title: 'Converting Fractions & Decimals',
    summary: 'A fraction bar is secretly a division problem — and every decimal can be written as a fraction.',
    blocks: [
      {
        type: 'text',
        heading: 'Fraction to Decimal',
        body: ['A fraction like 3/4 is really just a division problem written sideways: the numerator divided by the denominator. To write it as a decimal, just do the division.'],
      },
      {
        type: 'example',
        heading: 'Fraction to Decimal',
        prompt: '3/4 as a decimal',
        steps: ['Divide the numerator by the denominator: 3 ÷ 4 = 0.75.'],
        answerDisplay: '0.75',
      },
      {
        type: 'text',
        heading: 'Decimal to Fraction',
        body: [
          'Going the other way, count how many digits are after the decimal point. That tells you the denominator: 1 decimal place means tenths (denominator 10), 2 decimal places means hundredths (denominator 100), and so on. Write the digits (without the decimal point) as the numerator, then simplify.',
        ],
      },
      {
        type: 'example',
        heading: 'Decimal to Fraction',
        prompt: '0.6 as a fraction',
        steps: ['0.6 has 1 decimal place, so write it over 10: 6/10.', 'The greatest common factor of 6 and 10 is 2. Divide both by 2.', 'Simplified, the answer is 3/5.'],
        answerDisplay: '3/5',
      },
      {
        type: 'checkpoint',
        difficulty: 'easy',
        intro: 'Try one now — it could ask for a decimal or a fraction.',
      },
      {
        type: 'checkpoint',
        difficulty: 'medium',
        intro: 'Another one — read carefully which direction it’s asking for.',
      },
      {
        type: 'checkpoint',
        difficulty: 'hard',
        intro: 'One more.',
      },
      {
        type: 'text',
        heading: "You've Got It",
        body: ['A fraction and a decimal are just two different ways of writing the same value — and now you can convert between them either direction.'],
      },
    ],
  },
  {
    id: 'grade6-longDivision',
    grade: '6',
    topic: 'numberTheory',
    generatorId: 'grade6.numberTheory.longDivision',
    title: 'Long Division',
    summary: 'The divide–multiply–subtract–bring down rhythm that works no matter how big the numbers get.',
    blocks: [
      {
        type: 'text',
        heading: 'A Rhythm You Repeat',
        body: [
          'Long division breaks a big division problem into small, repeatable steps: divide, multiply, subtract, then bring down the next digit and repeat. Once you know the rhythm, the size of the numbers stops mattering.',
        ],
      },
      {
        type: 'example',
        heading: 'Dividing Without a Remainder',
        prompt: '84 ÷ 6',
        steps: [
          'Look at the first digit of 84: 8. How many times does 6 go into 8? 1 time (6 × 1 = 6, with 2 left over).',
          'Bring down the next digit (4) to make 24.',
          'How many times does 6 go into 24? 4 times (6 × 4 = 24, with 0 left over).',
          'No digits are left to bring down, so the answer is 14.',
        ],
        answerDisplay: '14',
      },
      {
        type: 'checkpoint',
        difficulty: 'easy',
        intro: 'Give it a try.',
      },
      {
        type: 'text',
        heading: 'Bigger Numbers, Same Rhythm',
        body: ['A bigger dividend just means repeating the rhythm more times — divide, multiply, subtract, bring down — one digit at a time, left to right.'],
      },
      {
        type: 'example',
        heading: 'A Three-Digit Dividend',
        prompt: '372 ÷ 4',
        steps: [
          '4 doesn’t go into 3, so start with the first two digits: 37. How many times does 4 go into 37? 9 times (4 × 9 = 36, with 1 left over).',
          'Bring down the next digit (2) to make 12.',
          'How many times does 4 go into 12? 3 times (4 × 3 = 12, with 0 left over).',
          'No digits are left, so the answer is 93.',
        ],
        answerDisplay: '93',
      },
      {
        type: 'checkpoint',
        difficulty: 'medium',
        intro: 'Try a bigger one.',
      },
      {
        type: 'text',
        heading: "When It Doesn't Divide Evenly",
        body: [
          'Sometimes there’s a leftover amount too small to divide by the divisor again — that’s the remainder. Write it after the quotient, like "23 R 3".',
        ],
      },
      {
        type: 'example',
        heading: 'A Division with a Remainder',
        prompt: '95 ÷ 4',
        steps: [
          'How many times does 4 go into 9? 2 times (4 × 2 = 8, with 1 left over).',
          'Bring down the next digit (5) to make 15.',
          'How many times does 4 go into 15? 3 times (4 × 3 = 12, with 3 left over).',
          'No digits are left to bring down, and 3 is less than the divisor, so 3 is the remainder: 23 R 3.',
        ],
        answerDisplay: '23 R 3',
      },
      {
        type: 'checkpoint',
        difficulty: 'hard',
        intro: 'This one might have a remainder — write it like "23 R 4" if it does.',
      },
      {
        type: 'text',
        heading: "You've Got It",
        body: ['Divide, multiply, subtract, bring down — repeat until there are no digits left. That’s long division, no matter how big the numbers get.'],
      },
    ],
  },
  {
    id: 'grade6-greatestCommonFactor',
    grade: '6',
    topic: 'numberTheory',
    generatorId: 'grade6.numberTheory.greatestCommonFactor',
    title: 'Greatest Common Factor',
    summary: 'Find every factor two numbers share, and pick the biggest one.',
    blocks: [
      {
        type: 'text',
        heading: 'What Makes a Factor "Common"',
        body: [
          'A factor of a number divides into it evenly, with nothing left over. When two numbers share a factor, it’s called a common factor. The greatest common factor (GCF) is the largest number that divides evenly into both.',
        ],
      },
      {
        type: 'example',
        heading: 'Finding the GCF',
        prompt: 'GCF of 12 and 18',
        steps: [
          'List the factors of 12: 1, 2, 3, 4, 6, 12.',
          'List the factors of 18: 1, 2, 3, 6, 9, 18.',
          'The factors they share are 1, 2, 3, and 6.',
          'The greatest one is 6.',
        ],
        answerDisplay: '6',
      },
      {
        type: 'checkpoint',
        difficulty: 'easy',
        intro: 'Give it a try.',
      },
      {
        type: 'text',
        heading: 'Why the GCF Is Useful',
        body: [
          'The GCF is how you simplify a fraction in one step — divide the numerator and denominator by their GCF and you land straight on lowest terms. It also shows up any time you want to split things into the largest possible equal groups.',
        ],
      },
      {
        type: 'example',
        heading: 'A Bigger Pair',
        prompt: 'GCF of 24 and 36',
        steps: [
          'List the factors of 24: 1, 2, 3, 4, 6, 8, 12, 24.',
          'List the factors of 36: 1, 2, 3, 4, 6, 9, 12, 18, 36.',
          'The factors they share are 1, 2, 3, 4, 6, and 12.',
          'The greatest one is 12.',
        ],
        answerDisplay: '12',
      },
      {
        type: 'checkpoint',
        difficulty: 'medium',
        intro: 'Try a bigger pair.',
      },
      {
        type: 'text',
        heading: 'Even Bigger Numbers',
        body: ['The same approach works for numbers up to 100 — just list every factor of each one. There are more of them, but the idea doesn’t change.'],
      },
      {
        type: 'checkpoint',
        difficulty: 'hard',
        intro: 'One more, with bigger numbers.',
      },
      {
        type: 'text',
        heading: "You've Got It",
        body: ['List the factors, find the ones in common, and pick the greatest. That’s the GCF — a tool you’ll keep using to simplify fractions and factor expressions.'],
      },
    ],
  },
  {
    id: 'grade6-leastCommonMultiple',
    grade: '6',
    topic: 'numberTheory',
    generatorId: 'grade6.numberTheory.leastCommonMultiple',
    title: 'Least Common Multiple',
    summary: 'Find the smallest number that shows up in both numbers’ multiplication tables.',
    blocks: [
      {
        type: 'text',
        heading: 'What Makes a Multiple "Common"',
        body: [
          'A multiple of a number is what you get multiplying it by 1, 2, 3, and so on — it’s basically that number’s times table. When two numbers share a multiple, it’s a common multiple. The least common multiple (LCM) is the smallest number that shows up in both times tables.',
        ],
      },
      {
        type: 'example',
        heading: 'Finding the LCM',
        prompt: 'LCM of 4 and 6',
        steps: [
          'List multiples of 4: 4, 8, 12, 16, 20, 24.',
          'List multiples of 6: 6, 12, 18, 24.',
          'The first number that appears in both lists is 12.',
        ],
        answerDisplay: '12',
      },
      {
        type: 'checkpoint',
        difficulty: 'easy',
        intro: 'Give it a try.',
      },
      {
        type: 'text',
        heading: 'The LCM Shows Up With Fractions, Too',
        body: [
          'Remember finding a common denominator to add fractions like 1/4 + 1/6? That common denominator was the LCM of 4 and 6 — the same idea you just used above.',
        ],
      },
      {
        type: 'example',
        heading: 'A Bigger Pair',
        prompt: 'LCM of 8 and 10',
        steps: ['List multiples of 8: 8, 16, 24, 32, 40.', 'List multiples of 10: 10, 20, 30, 40.', 'The first number that appears in both lists is 40.'],
        answerDisplay: '40',
      },
      {
        type: 'checkpoint',
        difficulty: 'medium',
        intro: 'Try a bigger pair.',
      },
      {
        type: 'text',
        heading: 'Even Bigger Numbers',
        body: ['The same listing approach still works for bigger numbers — it just takes a few more multiples before one repeats in both lists.'],
      },
      {
        type: 'checkpoint',
        difficulty: 'hard',
        intro: 'One more, with bigger numbers.',
      },
      {
        type: 'text',
        heading: "You've Got It",
        body: ['List the multiples of each number, and find the smallest one they share. That’s the LCM.'],
      },
    ],
  },
  {
    id: 'grade6-distributiveGcf',
    grade: '6',
    topic: 'numberTheory',
    generatorId: 'grade6.numberTheory.distributiveGcf',
    title: 'Distributive Property with the GCF',
    summary: 'Rewrite a sum as the GCF times a smaller sum — the distributive property, run in reverse.',
    blocks: [
      {
        type: 'text',
        heading: 'Factoring a Sum',
        body: [
          'You’ve used the distributive property to expand something like 4(3 + 2) into 12 + 8. This lesson runs it the other way: starting from 12 + 8, you can pull out the GCF and rewrite it as a product.',
        ],
      },
      {
        type: 'example',
        heading: 'Factoring Out the GCF',
        prompt: '12 + 8',
        steps: ['The GCF of 12 and 8 is 4.', '12 ÷ 4 = 3, and 8 ÷ 4 = 2.', 'So 12 + 8 = 4(3 + 2).'],
        answerDisplay: '4(3+2)',
      },
      {
        type: 'checkpoint',
        difficulty: 'easy',
        intro: 'Give it a try. Write your answer like "4(3+2)".',
      },
      {
        type: 'text',
        heading: 'A Bigger Example',
        body: ['The steps are exactly the same for bigger numbers: find the GCF, divide each number by it, and write the GCF times the sum of those quotients.'],
      },
      {
        type: 'example',
        heading: 'A Bigger Pair',
        prompt: '18 + 30',
        steps: ['The GCF of 18 and 30 is 6.', '18 ÷ 6 = 3, and 30 ÷ 6 = 5.', 'So 18 + 30 = 6(3 + 5).'],
        answerDisplay: '6(3+5)',
      },
      {
        type: 'checkpoint',
        difficulty: 'medium',
        intro: 'Try a bigger pair.',
      },
      {
        type: 'text',
        heading: 'Even Bigger Numbers',
        body: ['The same three steps work no matter how big the numbers get — find the GCF, divide, and write it as a product.'],
      },
      {
        type: 'checkpoint',
        difficulty: 'hard',
        intro: 'One more, with bigger numbers.',
      },
      {
        type: 'text',
        heading: "You've Got It",
        body: ['Find the GCF, divide each number by it, and write the GCF times the sum. That’s the distributive property working in reverse to factor a sum.'],
      },
    ],
  },
];

export function listLessons() {
  return LESSONS;
}

export function getLessonById(id) {
  return LESSONS.find((lesson) => lesson.id === id) || null;
}

/** Every grade that has at least one lesson, in order — drives the Learn page's grade picker. */
export function listGradesWithLessons() {
  return Array.from(new Set(LESSONS.map((l) => l.grade))).sort();
}

/** Every topic within a grade that has at least one lesson, in the order those lessons were declared. */
export function listTopicsForGrade(grade) {
  const topics = [];
  const seen = new Set();
  for (const lesson of LESSONS) {
    if (lesson.grade !== grade) continue;
    if (!seen.has(lesson.topic)) {
      seen.add(lesson.topic);
      topics.push(lesson.topic);
    }
  }
  return topics;
}

/** All lessons for one grade+topic, in the order they were declared (that order is the intended learning path). */
export function getLessonsForTopic(grade, topic) {
  return LESSONS.filter((l) => l.grade === grade && l.topic === topic);
}
