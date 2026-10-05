import type { UnitModule } from '../index';
import { pas } from '../util';

const mod: UnitModule = {
  unit: {
    id: 'u3',
    title: 'Operators',
    subtitle: 'Arithmetic, comparisons and logic',
    hue: 'teal',
    icon: 'calculator',
    topics: ['arithmetic', 'relational', 'logical'],
    boss: 'boss-u3',
  },
  topics: [
    // ---------------------------------------------------------------- arithmetic
    {
      id: 'arithmetic',
      unit: 'u3',
      title: 'Arithmetic Operators',
      short: '+ − * / div mod',
      source: 'Tute §7.1',
      minutes: 10,
      objectives: ['Use + − * / in calculations', 'Explain the difference between /, div and mod', 'Use mod to test for even numbers'],
      lesson: [
        {
          kind: 'concept',
          title: 'Maths in Pascal',
          body: `- \`+\` addition: \`5 + 3\` = **8**
- \`-\` subtraction: \`10 - 4\` = **6**
- \`*\` multiplication: \`6 * 7\` = **42**
- \`/\` real division: \`10 / 4\` = **2.5**
- \`div\` whole-number division: \`10 div 4\` = **2**
- \`mod\` remainder: \`10 mod 4\` = **2**`,
          callout: { kind: 'tip', text: '`*` and `/` (and `div`, `mod`) are worked out before `+` and `-`, just like in maths. Use brackets to change the order: `(a + b) / 2`.' },
        },
        { kind: 'visual', title: 'div and mod: sharing sweets', body: 'Share the sweets into groups. **div** = how many full groups, **mod** = how many are left over.', visual: 'divmod' },
        {
          kind: 'example',
          title: 'Quotient and remainder',
          code: pas`
program DivMod;
var
  number, divisor : integer;
  quotient, remainder : integer;
begin
  number := 17;
  divisor := 5;
  quotient := number div divisor;
  remainder := number mod divisor;
  writeln(number, ' divided by ', divisor);
  writeln('Quotient: ', quotient);
  writeln('Remainder: ', remainder);
end.
`,
          notes: [{ line: 8, text: '17 div 5 = 3 (three full groups of 5).' }, { line: 9, text: '17 mod 5 = 2 (2 left over).' }],
        },
        { kind: 'check', question: 'ar-2' },
        {
          kind: 'concept',
          title: '/ always gives a real',
          body: `Even \`10 / 2\` gives \`5.0\` — a **real** — so you can't store the result of \`/\` in an integer variable.

\`\`\`
avg := total / 3;   { avg must be real }
half := total div 2; { half can be integer }
\`\`\``,
          callout: { kind: 'mistake', text: 'Storing `/` in an integer gives an error. Use a real variable, or `div` if you want a whole number.' },
        },
        {
          kind: 'try',
          title: 'Even or odd?',
          body: 'A number is **even** if `number mod 2 = 0`. Complete the program so it prints `Remainder: 1` for 7.',
          starter: pas`
program EvenOdd;
var
  number, r : integer;
begin
  number := 7;

  writeln('Remainder: ', r);
end.
`,
          tests: [{ expect: ['Remainder: 1'] }],
          requires: [{ pattern: 'mod\\s*2', message: 'Use `mod 2` to find the remainder.' }],
          hints: ['r := number mod 2;'],
          solution: pas`
program EvenOdd;
var
  number, r : integer;
begin
  number := 7;
  r := number mod 2;
  writeln('Remainder: ', r);
end.
`,
        },
        {
          kind: 'concept',
          title: 'Splitting a number into digits',
          body: `\`div\` and \`mod\` with 10 are very useful:
- \`n mod 10\` gives the **last digit**: \`347 mod 10\` = 7
- \`n div 10\` **removes** the last digit: \`347 div 10\` = 34

Exam questions often use this to reverse a number or add up its digits.`,
        },
        { kind: 'check', question: 'ar-6' },
      ],
      revision: {
        what: 'Arithmetic operators: `+`, `-`, `*`, `/` (real division), `div` (whole-number division) and `mod` (remainder).',
        why: 'Calculations are the "process" step of most programs: totals, averages, areas, change, digits.',
        syntax: pas`
sum := a + b;
avg := total / 3;       { real result }
q := 17 div 5;          { 3 }
r := 17 mod 5;          { 2 }
`,
        example: {
          code: pas`
program Ops;
begin
  writeln(10 / 4:0:1);
  writeln(10 div 4);
  writeln(10 mod 4);
end.
`,
          output: '2.5\n2\n2',
        },
        mistakes: ['Storing the result of `/` in an integer.', 'Using `div` or `mod` with real numbers.', 'Forgetting that `*` and `/` happen before `+` and `-`.'],
        examPoints: ['`n mod 2 = 0` means n is even.', '`n mod 10` is the last digit; `n div 10` removes it.', 'Precedence: `* / div mod` before `+ -`.'],
        keyTerms: [
          { term: 'div', def: 'Integer division — keeps only the whole-number part.' },
          { term: 'mod', def: 'The remainder after integer division.' },
          { term: 'Precedence', def: 'The order in which operators are worked out.' },
        ],
        mini: 'ar-1',
      },
    },
    // ---------------------------------------------------------------- relational
    {
      id: 'relational',
      unit: 'u3',
      title: 'Comparison Operators',
      short: '= <> < > <= >= give TRUE or FALSE',
      source: 'Tute §7.2',
      minutes: 7,
      objectives: ['Use the six comparison operators', 'Predict whether a comparison is TRUE or FALSE', 'Compare numbers and text'],
      lesson: [
        {
          kind: 'concept',
          title: 'Asking questions',
          body: `Comparison (relational) operators compare two values and give **TRUE** or **FALSE**:

- \`=\` equal to: \`5 = 5\` → TRUE
- \`<>\` not equal to: \`5 <> 3\` → TRUE
- \`>\` greater than: \`7 > 3\` → TRUE
- \`<\` less than: \`2 < 8\` → TRUE
- \`>=\` greater than or equal: \`5 >= 5\` → TRUE
- \`<=\` less than or equal: \`4 <= 10\` → TRUE`,
          callout: { kind: 'mistake', text: '`=` compares; `:=` stores. `if marks = 100 then` asks a question.' },
        },
        {
          kind: 'example',
          title: 'Comparisons print TRUE or FALSE',
          body: 'Run it and type a mark (try 80, then 30).',
          inputs: ['80'],
          code: pas`
program ComparisonDemo;
var
  marks : integer;
begin
  write('Enter your marks: ');
  readln(marks);
  writeln('Marks >= 75: ', marks >= 75);
  writeln('Marks < 35: ', marks < 35);
  writeln('Marks = 100: ', marks = 100);
end.
`,
        },
        { kind: 'check', question: 'rel-1' },
        {
          kind: 'concept',
          title: 'Comparing text',
          body: `You can compare strings and chars too. Text is compared letter by letter (alphabetical order), and capitals matter:

- \`'Saturday' = 'Saturday'\` → TRUE
- \`'saturday' = 'Saturday'\` → FALSE (s ≠ S)
- \`'apple' < 'banana'\` → TRUE`,
        },
        { kind: 'check', question: 'rel-5' },
      ],
      revision: {
        what: 'Comparison operators (`=`, `<>`, `<`, `>`, `<=`, `>=`) compare two values and return a boolean.',
        why: 'They create the conditions used in if statements and loops.',
        syntax: pas`
writeln(marks >= 75);   { TRUE or FALSE }
if age <> 18 then ...
`,
        mistakes: ['Writing `!=` or `==` (from other languages). Pascal uses `<>` and `=`.', 'Writing `=>` or `=<` instead of `>=` and `<=`.', 'Forgetting that `5 > 5` is FALSE but `5 >= 5` is TRUE.'],
        examPoints: ['`<>` means "not equal to".', 'The result of a comparison is always a boolean (TRUE/FALSE).'],
        keyTerms: [{ term: 'Relational operator', def: 'An operator that compares two values: = <> < > <= >=' }],
        mini: 'rel-2',
      },
    },
    // ---------------------------------------------------------------- logical
    {
      id: 'logical',
      unit: 'u3',
      title: 'Logical Operators',
      short: 'Combine conditions with and, or, not',
      source: 'Tute §7.3',
      minutes: 9,
      objectives: ['Use and, or and not', 'Complete a truth table', 'Write combined conditions with brackets'],
      lesson: [
        {
          kind: 'concept',
          title: 'Combining conditions',
          body: `- **and** — TRUE only if **both** conditions are TRUE
- **or** — TRUE if **at least one** condition is TRUE
- **not** — reverses: TRUE becomes FALSE, FALSE becomes TRUE`,
        },
        { kind: 'visual', title: 'Flip the switches', body: 'Change A and B and watch the results light up.', visual: 'truth-table' },
        {
          kind: 'example',
          title: 'AND: can you drive?',
          body: 'Try age 20 with `true`, then age 16.',
          inputs: ['20', 'true'],
          code: pas`
program AndExample;
var
  age : integer;
  hasLicense : boolean;
begin
  write('Enter age: ');
  readln(age);
  write('Has license (true/false): ');
  readln(hasLicense);
  if (age >= 18) and (hasLicense = true) then
    writeln('Can drive!')
  else
    writeln('Cannot drive');
end.
`,
        },
        {
          kind: 'concept',
          title: 'Brackets are required',
          body: 'In Pascal, `and`/`or` are worked out **before** comparisons. So each comparison must be inside brackets:',
          code: pas`
if age >= 18 and age <= 60 then        { ERROR }
if (age >= 18) and (age <= 60) then    { CORRECT }
`,
          callout: { kind: 'mistake', text: 'Missing brackets around conditions is one of the most common errors. Pascal will refuse to run the program.' },
        },
        { kind: 'check', question: 'log-2' },
        {
          kind: 'try',
          title: 'Weekend checker',
          body: 'Complete the condition so the program prints `It\'s a weekend!` when the day is `Saturday` **or** `Sunday`.',
          starter: pas`
program Weekend;
var
  day : string;
begin
  readln(day);
  if day = 'Saturday' then
    writeln('It''s a weekend!')
  else
    writeln('It''s a weekday');
end.
`,
          tests: [{ inputs: ['Sunday'], expect: ["It's a weekend!"] }, { inputs: ['Saturday'], expect: ["It's a weekend!"] }, { inputs: ['Monday'], expect: ["It's a weekday"] }],
          hints: ['Use or to join two comparisons.', "if (day = 'Saturday') or (day = 'Sunday') then"],
          solution: pas`
program Weekend;
var
  day : string;
begin
  readln(day);
  if (day = 'Saturday') or (day = 'Sunday') then
    writeln('It''s a weekend!')
  else
    writeln('It''s a weekday');
end.
`,
        },
        { kind: 'check', question: 'log-5' },
      ],
      revision: {
        what: '`and`, `or` and `not` combine or reverse boolean conditions.',
        why: 'Real decisions often depend on more than one condition (age AND licence; Saturday OR Sunday).',
        syntax: pas`
if (age >= 18) and (hasLicense) then ...
if (day = 'Sat') or (day = 'Sun') then ...
if not isRaining then ...
`,
        mistakes: ['Missing brackets: `if a > 5 and b < 3 then` is an error.', 'Confusing and/or: "between 1 and 10" needs `(x >= 1) and (x <= 10)`.'],
        examPoints: ['Truth tables: and → TRUE only if both TRUE; or → FALSE only if both FALSE.', '`not TRUE` = FALSE.'],
        keyTerms: [
          { term: 'and', def: 'TRUE only when both conditions are TRUE.' },
          { term: 'or', def: 'TRUE when at least one condition is TRUE.' },
          { term: 'not', def: 'Reverses a boolean value.' },
          { term: 'Truth table', def: 'A table showing the result of a logical operator for every combination of inputs.' },
        ],
        mini: 'log-1',
      },
    },
  ],
  questions: [
    // ---------- arithmetic
    {
      id: 'ar-1', topic: 'arithmetic', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'div', prompt: 'What is the value of `17 div 5`?', options: ['3.4', '3', '2', '85'], answer: 1,
      why: ['That is 17 / 5 (real division).', '', 'That is 17 mod 5.', 'That is 17 * 5.'],
      hints: ['How many full groups of 5 fit into 17?'], explanation: '`div` keeps only the whole-number part: 17 div 5 = 3.',
    },
    {
      id: 'ar-2', topic: 'arithmetic', type: 'match', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Results of operators', prompt: 'Match each expression with its value.', codeLeft: true,
      pairs: [['10 / 4', '2.5'], ['10 div 4', '2 (whole groups)'], ['10 mod 4', '2 (left over)'], ['6 * 7', '42'], ['10 - 4', '6']],
      hints: ['/ gives a decimal answer.'], explanation: '10 / 4 = 2.5; 10 div 4 = 2; 10 mod 4 = 2; 6 × 7 = 42; 10 − 4 = 6.',
    },
    {
      id: 'ar-3', topic: 'arithmetic', type: 'output', difficulty: 'practice', skill: 'problem', exam: true,
      objective: 'Precedence', prompt: 'What does this print?',
      code: pas`
program Prec;
var
  a, b : integer;
begin
  a := 2 + 3 * 4;
  b := (2 + 3) * 4;
  writeln(a, ' ', b);
end.
`,
      answer: '14 20', hints: ['* is done before +.'], explanation: '2 + 12 = 14; (5) × 4 = 20.',
    },
    {
      id: 'ar-4', topic: 'arithmetic', type: 'output', difficulty: 'practice', skill: 'problem', exam: true,
      objective: 'div and mod together', prompt: 'What does this print?',
      code: pas`
program Time;
var
  minutes : integer;
begin
  minutes := 135;
  writeln(minutes div 60, ' hours ', minutes mod 60, ' minutes');
end.
`,
      answer: '2 hours 15 minutes', hints: ['How many full 60s are in 135? What is left?'], explanation: '135 div 60 = 2, 135 mod 60 = 15.',
    },
    {
      id: 'ar-5', topic: 'arithmetic', type: 'spot', difficulty: 'practice', skill: 'coding',
      objective: '/ gives real', prompt: 'One line causes an error. Click it.',
      code: pas`
program Average;
var
  total, avg : integer;
begin
  total := 245;
  avg := total / 3;
  writeln(avg);
end.
`,
      lines: [6], hints: ['What type does / always produce?'], explanation: '`total / 3` is real, but `avg` is an integer. Declare avg as real (or use div).',
    },
    {
      id: 'ar-6', topic: 'arithmetic', type: 'output', difficulty: 'challenge', skill: 'problem', exam: true,
      objective: 'Digits with div/mod', prompt: 'What does this print?',
      code: pas`
program Digits;
var
  n : integer;
begin
  n := 347;
  writeln(n mod 10);
  writeln(n div 10);
  writeln((n div 10) mod 10);
end.
`,
      answer: '7\n34\n4', hints: ['mod 10 gives the last digit.', 'div 10 removes the last digit.'], explanation: '347 mod 10 = 7; 347 div 10 = 34; 34 mod 10 = 4.',
    },
    {
      id: 'ar-7', topic: 'arithmetic', type: 'write', difficulty: 'practice', skill: 'coding', exam: true,
      objective: 'Simple calculator', prompt: 'Write a program that reads two numbers and prints their `Sum:`, `Difference:`, `Product:` and `Quotient:` (quotient to 2 decimal places). Input 12 and 5 → Sum: 17, Difference: 7, Product: 60, Quotient: 2.40',
      starter: pas`
program Calculator;
var
  a, b : integer;
begin

end.
`,
      tests: [{ inputs: ['12', '5'], expect: ['Sum: 17', 'Difference: 7', 'Product: 60', 'Quotient: 2.40'] }, { inputs: ['9', '3'], expect: ['Sum: 12', 'Difference: 6', 'Product: 27', 'Quotient: 3.00'] }],
      hints: ['Read a and b first.', "You can calculate inside writeln: writeln('Sum: ', a + b);", 'The quotient needs :0:2 because / gives a real.'],
      solution: pas`
program Calculator;
var
  a, b : integer;
begin
  readln(a);
  readln(b);
  writeln('Sum: ', a + b);
  writeln('Difference: ', a - b);
  writeln('Product: ', a * b);
  writeln('Quotient: ', a / b:0:2);
end.
`,
      explanation: 'Use + − * and / with formatting for the real quotient.',
    },
    {
      id: 'ar-8', topic: 'arithmetic', type: 'fill', difficulty: 'practice', skill: 'coding',
      objective: 'Use div/mod', prompt: 'Complete the program to convert seconds into minutes and seconds.',
      code: pas`
program Convert;
var
  total, mins, secs : integer;
begin
  total := 200;
  mins := total [[0]] 60;
  secs := total [[1]] 60;
  writeln(mins, ' min ', secs, ' sec');
end.
`,
      blanks: [{ accept: ['div'], width: 4 }, { accept: ['mod'], width: 4 }],
      tests: [{ expect: ['3 min 20 sec'] }],
      hints: ['Whole minutes → whole-number division.', 'Seconds left over → remainder.'], explanation: '200 div 60 = 3 minutes, 200 mod 60 = 20 seconds.',
    },
    {
      id: 'ar-9', topic: 'arithmetic', type: 'write', difficulty: 'challenge', skill: 'problem',
      objective: 'Sum of digits', prompt: 'Read a **3-digit** number and print the sum of its digits. (Input 347 → `14`)',
      starter: pas`
program DigitSum;
var
  n, sum : integer;
begin

end.
`,
      tests: [{ inputs: ['347'], expect: ['14'] }, { inputs: ['905'], expect: ['14'] }, { inputs: ['111'], expect: ['3'] }],
      hints: ['Last digit: n mod 10.', 'Middle digit: (n div 10) mod 10.', 'First digit: n div 100.'],
      solution: pas`
program DigitSum;
var
  n, sum : integer;
begin
  readln(n);
  sum := n mod 10 + (n div 10) mod 10 + n div 100;
  writeln(sum);
end.
`,
      explanation: 'Extract each digit with div and mod, then add them.',
    },
    {
      id: 'ar-10', topic: 'arithmetic', type: 'trace', difficulty: 'practice', skill: 'problem',
      objective: 'Trace calculations', prompt: 'Trace the values after each line.',
      code: pas`
x := 23;
y := x div 4;
z := x mod 4;
x := y * 4 + z;
`,
      columns: ['x', 'y', 'z'], rowLabel: 'Line',
      rows: [['23', '{?}', '{?}'], ['{23}', '5', '{?}'], ['{23}', '{5}', '3'], ['23', '{5}', '{3}']],
      hints: ['23 div 4: how many 4s fit in 23?'], explanation: 'y = 5, z = 3, and 5 × 4 + 3 = 23 again!',
    },
    // ---------- relational
    {
      id: 'rel-1', topic: 'relational', type: 'output', difficulty: 'easy', skill: 'problem', exam: true,
      objective: 'Evaluate comparisons', prompt: 'The user types `80`. What does the program print?',
      code: pas`
program Cmp;
var
  marks : integer;
begin
  readln(marks);
  writeln(marks >= 75);
  writeln(marks < 35);
  writeln(marks = 100);
end.
`,
      inputs: ['80'], answer: 'TRUE\nFALSE\nFALSE', hints: ['Check each comparison with 80.'], explanation: '80 >= 75 is TRUE, 80 < 35 is FALSE, 80 = 100 is FALSE.',
    },
    {
      id: 'rel-2', topic: 'relational', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Not equal', prompt: 'Which operator means **not equal to** in Pascal?', codeOptions: true,
      options: ['!=', '<>', '=/=', 'not='], answer: 1,
      why: ['Used in C/Java, not Pascal.', '', 'Not a Pascal operator.', 'Not a Pascal operator.'],
      hints: ['It looks like "less than or greater than".'], explanation: 'Pascal uses `<>` for "not equal to".',
    },
    {
      id: 'rel-3', topic: 'relational', type: 'categorize', difficulty: 'practice', skill: 'concept',
      objective: 'Evaluate comparisons', prompt: 'Is each comparison TRUE or FALSE?', categories: ['TRUE', 'FALSE'], codeItems: true,
      items: [{ text: '5 >= 5', category: 0 }, { text: '5 > 5', category: 1 }, { text: '3 <> 3', category: 1 }, { text: '2 <= 8', category: 0 }, { text: "'A' = 'a'", category: 1 }, { text: "'apple' < 'banana'", category: 0 }],
      hints: ['>= includes equal; > does not.', 'Capitals matter when comparing text.'], explanation: '5>=5 TRUE, 5>5 FALSE, 3<>3 FALSE, 2<=8 TRUE, A≠a FALSE, apple before banana TRUE.',
    },
    {
      id: 'rel-4', topic: 'relational', type: 'spot', difficulty: 'practice', skill: 'coding',
      objective: 'Correct operators', prompt: 'Which line has an invalid operator?',
      code: pas`
program Check;
var
  age : integer;
begin
  age := 17;
  writeln(age >= 18);
  writeln(age != 18);
  writeln(age < 20);
end.
`,
      lines: [7], hints: ['How does Pascal write "not equal"?'], explanation: '`!=` isn\'t Pascal. Use `<>`.',
    },
    {
      id: 'rel-5', topic: 'relational', type: 'mcq', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'Boundary values', prompt: 'A pass mark is 50 or more. Which condition is correct?', codeOptions: true,
      options: ['marks > 50', 'marks >= 50', 'marks = 50', 'marks <> 50'], answer: 1,
      why: ['This fails a student with exactly 50.', '', 'Only exactly 50 passes.', 'This is TRUE for every mark except 50.'],
      hints: ['Should 50 itself pass?'], explanation: '"50 or more" includes 50, so use `>=`.',
    },
    {
      id: 'rel-6', topic: 'relational', type: 'output', difficulty: 'practice', skill: 'problem',
      objective: 'Comparisons with expressions', prompt: 'What does this print?',
      code: pas`
program Exprs;
var
  a, b : integer;
begin
  a := 7;
  b := 3;
  writeln(a + b > 10);
  writeln(a mod b = 1);
  writeln(a * 2 <> b + 11);
end.
`,
      answer: 'FALSE\nTRUE\nFALSE', hints: ['Work out the arithmetic first, then compare.'], explanation: '10 > 10 FALSE; 7 mod 3 = 1 TRUE; 14 <> 14 FALSE.',
    },
    {
      id: 'rel-7', topic: 'relational', type: 'write', difficulty: 'challenge', skill: 'coding',
      objective: 'Print comparisons', prompt: 'Read two numbers `a` and `b` and print three lines: `a > b: `, `a = b: `, `a < b: ` followed by TRUE/FALSE. (4, 9 → FALSE, FALSE, TRUE)',
      starter: pas`
program Compare;
var
  a, b : integer;
begin

end.
`,
      tests: [{ inputs: ['4', '9'], expect: ['a > b: FALSE', 'a = b: FALSE', 'a < b: TRUE'] }, { inputs: ['6', '6'], expect: ['a > b: FALSE', 'a = b: TRUE', 'a < b: FALSE'] }],
      hints: ["writeln('a > b: ', a > b);"],
      solution: pas`
program Compare;
var
  a, b : integer;
begin
  readln(a);
  readln(b);
  writeln('a > b: ', a > b);
  writeln('a = b: ', a = b);
  writeln('a < b: ', a < b);
end.
`,
      explanation: 'A comparison inside writeln prints its TRUE/FALSE value.',
    },
    // ---------- logical
    {
      id: 'log-1', topic: 'logical', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'and', prompt: '`(5 > 3) and (2 > 4)` is…', options: ['TRUE', 'FALSE'], answer: 1,
      why: ['and needs BOTH to be TRUE.', ''], hints: ['Check each side separately.'], explanation: '5 > 3 is TRUE but 2 > 4 is FALSE, and `and` needs both TRUE.',
    },
    {
      id: 'log-2', topic: 'logical', type: 'trace', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Truth table', prompt: 'Complete the truth table.', code: 'A and B,  A or B',
      columns: ['A', 'B', 'A and B', 'A or B'], rowLabel: 'Row',
      rows: [['{TRUE}', '{TRUE}', 'TRUE', 'TRUE'], ['{TRUE}', '{FALSE}', 'FALSE', 'TRUE'], ['{FALSE}', '{TRUE}', 'FALSE', 'TRUE'], ['{FALSE}', '{FALSE}', 'FALSE', 'FALSE']],
      hints: ['and: TRUE only when both are TRUE.', 'or: FALSE only when both are FALSE.'], explanation: 'and is TRUE only in row 1; or is FALSE only in row 4.',
    },
    {
      id: 'log-3', topic: 'logical', type: 'output', difficulty: 'practice', skill: 'problem', exam: true,
      objective: 'Evaluate logic', prompt: 'What does this print?',
      code: pas`
program Logic;
var
  x : integer;
  raining : boolean;
begin
  x := 7;
  raining := false;
  writeln((x > 5) or (x > 10));
  writeln((x > 5) and (x > 10));
  writeln(not raining);
end.
`,
      answer: 'TRUE\nFALSE\nTRUE', hints: ['7 > 5 TRUE, 7 > 10 FALSE.'], explanation: 'or → TRUE, and → FALSE, not FALSE → TRUE.',
    },
    {
      id: 'log-4', topic: 'logical', type: 'fix', difficulty: 'practice', skill: 'coding',
      objective: 'Brackets in conditions', prompt: 'Fix the condition so the program runs. It should print `Teenager` for ages 13 to 19.',
      code: pas`
program Teen;
var
  age : integer;
begin
  readln(age);
  if age >= 13 and age <= 19 then
    writeln('Teenager')
  else
    writeln('Not a teenager');
end.
`,
      tests: [{ inputs: ['15'], expect: ['Teenager'] }, { inputs: ['13'], expect: ['Teenager'] }, { inputs: ['20'], expect: ['Not a teenager'] }],
      hints: ['Run it to see the error.', 'Put each comparison in its own brackets.'],
      solution: pas`
program Teen;
var
  age : integer;
begin
  readln(age);
  if (age >= 13) and (age <= 19) then
    writeln('Teenager')
  else
    writeln('Not a teenager');
end.
`,
      explanation: 'Each comparison needs brackets: `(age >= 13) and (age <= 19)`.',
    },
    {
      id: 'log-5', topic: 'logical', type: 'mcq', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'Choose and/or', prompt: 'Which condition is TRUE when `x` is **between 1 and 10** (inclusive)?', codeOptions: true,
      options: ['(x >= 1) or (x <= 10)', '(x >= 1) and (x <= 10)', '(x > 1) and (x < 10)', 'not (x = 10)'], answer: 1,
      why: ['Every number is >= 1 or <= 10, so this is always TRUE.', '', 'This leaves out 1 and 10.', 'TRUE for almost every number.'],
      hints: ['Both conditions must hold at the same time.'], explanation: 'A range needs both limits: `(x >= 1) and (x <= 10)`.',
    },
    {
      id: 'log-6', topic: 'logical', type: 'categorize', difficulty: 'practice', skill: 'problem',
      objective: 'Evaluate combined conditions', prompt: 'With `a = 4` and `b = 9`, is each condition TRUE or FALSE?', categories: ['TRUE', 'FALSE'], codeItems: true,
      items: [{ text: '(a < b) and (b < 10)', category: 0 }, { text: '(a > 5) or (b > 5)', category: 0 }, { text: 'not (a = 4)', category: 1 }, { text: '(a = b) or (a > b)', category: 1 }, { text: '(a mod 2 = 0) and (b mod 2 = 0)', category: 1 }],
      hints: ['Work out each bracket first.'], explanation: 'T and T = TRUE; F or T = TRUE; not T = FALSE; F or F = FALSE; T and F = FALSE.',
    },
    {
      id: 'log-7', topic: 'logical', type: 'write', difficulty: 'challenge', skill: 'problem', exam: true,
      objective: 'Scholarship rule', prompt: 'A student gets a scholarship if their marks are **75 or more** AND their attendance is **at least 80**, OR if they are a **sports captain** (`Y`). Read marks, attendance and captain (Y/N) and print `Eligible` or `Not eligible`.',
      starter: pas`
program Scholarship;
var
  marks, attendance : integer;
  captain : char;
begin

end.
`,
      tests: [
        { inputs: ['80', '90', 'N'], expect: ['Eligible'], reject: ['Not'] },
        { inputs: ['80', '70', 'N'], expect: ['Not eligible'] },
        { inputs: ['40', '50', 'Y'], expect: ['Eligible'], reject: ['Not'] },
        { inputs: ['74', '95', 'N'], expect: ['Not eligible'] },
      ],
      hints: ['Read all three values first.', "((marks >= 75) and (attendance >= 80)) or (captain = 'Y')"],
      solution: pas`
program Scholarship;
var
  marks, attendance : integer;
  captain : char;
begin
  readln(marks);
  readln(attendance);
  readln(captain);
  if ((marks >= 75) and (attendance >= 80)) or (captain = 'Y') then
    writeln('Eligible')
  else
    writeln('Not eligible');
end.
`,
      explanation: 'Group the and-condition in brackets, then or it with the captain check.',
    },
    {
      id: 'log-8', topic: 'logical', type: 'fill', difficulty: 'easy', skill: 'coding',
      objective: 'not operator', prompt: 'Complete the code so it prints `Go outside and play!` when it is NOT raining.',
      code: pas`
program NotExample;
var
  isRaining : boolean;
begin
  isRaining := false;
  if [[0]] isRaining then
    writeln('Go outside and play!')
  else
    writeln('Stay indoors');
end.
`,
      blanks: [{ accept: ['not'], width: 4 }], tests: [{ expect: ['Go outside and play!'] }],
      hints: ['Which operator reverses TRUE/FALSE?'], explanation: '`not isRaining` is TRUE when isRaining is FALSE.',
    },
  ],
  boss: {
    id: 'boss-u3',
    unit: 'u3',
    title: 'The Canteen Cashier',
    emoji: 'receipt',
    story: 'The school canteen\'s calculator broke at lunchtime! Build a cashier program that totals orders, gives change in notes, and checks discounts.',
    stages: [
      {
        title: 'Total the order',
        prompt: 'Read the **price** of one item and the **quantity**, then print `Total: Rs. ` followed by the total.',
        starter: pas`
program Canteen;
var
  price, qty, total : integer;
begin

end.
`,
        tests: [{ inputs: ['120', '3'], expect: ['Total: Rs. 360'] }, { inputs: ['45', '10'], expect: ['Total: Rs. 450'] }],
        hints: ['total := price * qty;'],
        solution: pas`
program Canteen;
var
  price, qty, total : integer;
begin
  readln(price);
  readln(qty);
  total := price * qty;
  writeln('Total: Rs. ', total);
end.
`,
      },
      {
        title: 'Give the change in notes',
        prompt: 'Read an amount of change (e.g. 380) and print how many **100** notes, **20** notes and the remaining **rupees**: `100 x 3`, `20 x 4`, `Rs 0`.',
        starter: pas`
program Change;
var
  amount, hundreds, twenties, rest : integer;
begin

end.
`,
        tests: [{ inputs: ['380'], expect: ['100 x 3', '20 x 4', 'Rs 0'] }, { inputs: ['275'], expect: ['100 x 2', '20 x 3', 'Rs 15'] }],
        hints: ['hundreds := amount div 100;', 'What is left after the hundreds? amount mod 100.', 'Then do the same with 20.'],
        solution: pas`
program Change;
var
  amount, hundreds, twenties, rest : integer;
begin
  readln(amount);
  hundreds := amount div 100;
  rest := amount mod 100;
  twenties := rest div 20;
  rest := rest mod 20;
  writeln('100 x ', hundreds);
  writeln('20 x ', twenties);
  writeln('Rs ', rest);
end.
`,
      },
      {
        title: 'Discount day',
        prompt: 'Read the total and whether the customer is a **student** (Y/N). Students get 10% off if the total is **500 or more**. Print `Pay: ` and the amount to pay with 2 decimal places.',
        starter: pas`
program Discount;
var
  total : integer;
  student : char;
  pay : real;
begin

end.
`,
        tests: [{ inputs: ['600', 'Y'], expect: ['Pay: 540.00'] }, { inputs: ['600', 'N'], expect: ['Pay: 600.00'] }, { inputs: ['400', 'Y'], expect: ['Pay: 400.00'] }],
        hints: ["Condition: (student = 'Y') and (total >= 500)", 'pay := total * 0.9; otherwise pay := total;'],
        solution: pas`
program Discount;
var
  total : integer;
  student : char;
  pay : real;
begin
  readln(total);
  readln(student);
  if (student = 'Y') and (total >= 500) then
    pay := total * 0.9
  else
    pay := total;
  writeln('Pay: ', pay:0:2);
end.
`,
      },
    ],
  },
};

export default mod;
