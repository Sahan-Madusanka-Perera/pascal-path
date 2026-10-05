import type { UnitModule } from '../index';
import { pas } from '../util';

const mod: UnitModule = {
  unit: {
    id: 'u6',
    title: 'Putting It Together',
    subtitle: 'Nested structures, complete programs and debugging',
    hue: 'pink',
    icon: 'puzzle',
    topics: ['nested', 'programs'],
    boss: 'boss-u6',
  },
  topics: [
    // ---------------------------------------------------------------- nested
    {
      id: 'nested',
      unit: 'u6',
      title: 'Nested Structures',
      short: 'Loops inside loops, ifs inside loops',
      source: 'Tute §10',
      minutes: 12,
      objectives: ['Put an if inside a loop', 'Use nested for loops for tables and patterns', 'Count and total with conditions'],
      lesson: [
        {
          kind: 'concept',
          title: 'Structures inside structures',
          body: 'You can put **if statements inside loops**, and **loops inside loops**. This is how real programs are built.',
          code: pas`
for i := 1 to 20 do
  if i mod 2 = 0 then
    writeln(i);     { prints only the even numbers }
`,
        },
        {
          kind: 'watch',
          title: 'If inside a loop',
          body: 'Watch the condition being checked in every round. Only some rounds print.',
          code: pas`
program EvenNumbers;
var
  i : integer;
begin
  for i := 1 to 6 do
  begin
    if i mod 2 = 0 then
      writeln(i, ' is even');
  end;
end.
`,
        },
        {
          kind: 'concept',
          title: 'A loop inside a loop',
          body: `For **each** round of the outer loop, the inner loop runs **completely**.

The outer loop controls the **rows**, the inner loop controls the **columns**.`,
          code: pas`
for i := 1 to 3 do
begin
  for j := 1 to 4 do
    write('*');
  writeln;   { new line after each row }
end;
`,
          callout: { kind: 'tip', text: 'The inner statement runs 3 × 4 = 12 times.' },
        },
        {
          kind: 'example',
          title: 'Multiplication chart',
          body: '`:4` gives each number 4 spaces so the columns line up.',
          code: pas`
program MultiplicationChart;
var
  i, j : integer;
begin
  for i := 1 to 5 do
  begin
    for j := 1 to 5 do
      write(i * j:4);
    writeln;
  end;
end.
`,
        },
        { kind: 'check', question: 'nest-2' },
        {
          kind: 'try',
          title: 'Star triangle',
          body: `Print this pattern using nested loops:

\`\`\`
*
**
***
****
\`\`\``,
          starter: pas`
program Stars;
var
  i, j : integer;
begin

end.
`,
          tests: [{ exact: '*\n**\n***\n****' }],
          hints: ['Outer loop: i from 1 to 4 (rows).', 'Inner loop: j from 1 to i — the row number decides how many stars.', 'writeln; after the inner loop.'],
          solution: pas`
program Stars;
var
  i, j : integer;
begin
  for i := 1 to 4 do
  begin
    for j := 1 to i do
      write('*');
    writeln;
  end;
end.
`,
        },
        { kind: 'check', question: 'nest-5' },
      ],
      revision: {
        what: 'Nesting means putting one control structure inside another: ifs inside loops, loops inside loops.',
        why: 'Patterns, tables and statistics (count how many passed) all need combined structures.',
        syntax: pas`
for i := 1 to rows do
begin
  for j := 1 to cols do
    write(...);
  writeln;
end;
`,
        example: {
          code: pas`
program Triangle;
var
  i, j : integer;
begin
  for i := 1 to 3 do
  begin
    for j := 1 to i do
      write('*');
    writeln;
  end;
end.
`,
          output: '*\n**\n***',
        },
        mistakes: ['Forgetting `writeln;` after the inner loop (everything prints on one line).', 'Using the same counter variable for both loops.', 'Missing begin…end around the outer loop body.'],
        examPoints: ['Total inner runs = outer count × inner count.', 'Counting with a condition: `if marks >= 50 then passCount := passCount + 1;`'],
        keyTerms: [{ term: 'Nested loop', def: 'A loop placed inside another loop.' }],
        mini: 'nest-1',
      },
    },
    // ---------------------------------------------------------------- programs
    {
      id: 'programs',
      unit: 'u6',
      title: 'Complete Programs & Debugging',
      short: 'Plan, build and fix whole programs',
      source: 'Tute §11–14',
      minutes: 12,
      objectives: ['Plan a program as Input → Process → Output', 'Read and understand complete programs', 'Find and fix common mistakes'],
      lesson: [
        {
          kind: 'concept',
          title: 'How to build a program',
          body: `Big problems are solved in small steps:

1. **Input** — what data do I need? (\`readln\`)
2. **Process** — what calculations or decisions? (\`:=\`, \`if\`, loops)
3. **Output** — what should be shown? (\`writeln\`)

Write a little, run it, check it, then add more.`,
        },
        {
          kind: 'example',
          title: 'Student report card',
          body: 'This complete program from your tute uses input, calculations, if…else if and output. Run it!',
          inputs: ['Kamal', '78', '64', '81'],
          code: pas`
program ReportCard;
var
  name : string;
  maths, science, english, total : integer;
  average : real;
  grade : char;
begin
  write('Student name: ');
  readln(name);
  write('Maths: ');
  readln(maths);
  write('Science: ');
  readln(science);
  write('English: ');
  readln(english);

  total := maths + science + english;
  average := total / 3;

  if average >= 75 then
    grade := 'A'
  else if average >= 65 then
    grade := 'B'
  else if average >= 55 then
    grade := 'C'
  else if average >= 40 then
    grade := 'S'
  else
    grade := 'F';

  writeln('Student: ', name);
  writeln('Total: ', total);
  writeln('Average: ', average:0:2);
  writeln('Grade: ', grade);
end.
`,
        },
        {
          kind: 'concept',
          title: 'Debugging like a pro',
          body: `When something goes wrong:
1. **Read the error message** — it tells you the line.
2. Look for: missing \`;\`, unmatched \`begin\`/\`end\`, wrong names, \`=\` instead of \`:=\`.
3. If the output is wrong, use **writeln** to print variables and check your logic — or use **Show me what happened** to watch every step.
4. Comment out parts with \`{ }\` to find which part causes the problem.`,
          callout: { kind: 'tip', text: 'Errors are your teachers, not your enemies. Every programmer makes them.' },
        },
        { kind: 'check', question: 'prog-3' },
        {
          kind: 'try',
          title: 'Debug the shop program',
          body: 'This program has **3 bugs**. Fix them so it prints `Total: 750` for 3 items at 250.',
          starter: pas`
program Shop;
var
  price, qty, total : integer
begin
  price := 250;
  qty = 3;
  total := price * qty;
  writeln('Total: ', totl);
end.
`,
          tests: [{ expect: ['Total: 750'] }],
          hints: ['Run it and fix one error at a time.', 'Check line 3, the assignment on line 6, and the spelling on line 8.'],
          solution: pas`
program Shop;
var
  price, qty, total : integer;
begin
  price := 250;
  qty := 3;
  total := price * qty;
  writeln('Total: ', total);
end.
`,
        },
        { kind: 'check', question: 'prog-6' },
      ],
      revision: {
        what: 'A complete program combines input, processing (calculations, decisions, loops) and output. Debugging is finding and fixing errors.',
        why: 'Exam questions ask you to read, complete, correct and write whole programs.',
        syntax: pas`
program Name;
var ...
begin
  { 1. Input }
  { 2. Process }
  { 3. Output }
end.
`,
        mistakes: ['Missing full stop at the end.', '`=` instead of `:=`.', 'Missing semicolons.', 'Unmatched begin/end.', 'Double quotes for strings.'],
        examPoints: ['Syntax errors stop a program from running; logic errors give wrong results.', 'Use writeln to check variable values while debugging.'],
        keyTerms: [
          { term: 'Syntax error', def: 'A mistake in the way code is written; the program won\'t run.' },
          { term: 'Logic error', def: 'The program runs but gives the wrong result.' },
          { term: 'Runtime error', def: 'An error that happens while the program runs (e.g. division by zero).' },
          { term: 'Debugging', def: 'Finding and fixing errors in a program.' },
        ],
        mini: 'prog-1',
      },
    },
  ],
  questions: [
    // ---------- nested
    {
      id: 'nest-1', topic: 'nested', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Count nested iterations', prompt: 'How many times is `write(\'*\')` executed?',
      code: pas`
for i := 1 to 4 do
  for j := 1 to 3 do
    write('*');
`,
      options: ['7', '12', '4', '3'], answer: 1,
      why: ['Add only when loops are one after another, not nested.', '', 'That is just the outer loop.', 'That is just the inner loop.'],
      hints: ['The inner loop runs fully for every outer round.'], explanation: '4 × 3 = 12 times.',
    },
    {
      id: 'nest-2', topic: 'nested', type: 'output', difficulty: 'practice', skill: 'problem', exam: true,
      objective: 'Predict a pattern', prompt: 'What does this print?',
      code: pas`
program Pattern;
var
  i, j : integer;
begin
  for i := 1 to 3 do
  begin
    for j := 1 to i do
      write(j);
    writeln;
  end;
end.
`,
      answer: '1\n12\n123', hints: ['In row i, j goes from 1 to i.'], explanation: 'Row 1: 1; row 2: 12; row 3: 123.',
    },
    {
      id: 'nest-3', topic: 'nested', type: 'output', difficulty: 'practice', skill: 'problem', exam: true,
      objective: 'Counting with if in a loop', prompt: 'What does this print?',
      code: pas`
program CountMultiples;
var
  i, count : integer;
begin
  count := 0;
  for i := 1 to 20 do
    if i mod 3 = 0 then
      count := count + 1;
  writeln(count);
end.
`,
      answer: '6', hints: ['Which numbers from 1 to 20 divide by 3?'], explanation: '3, 6, 9, 12, 15, 18 → 6 numbers.',
    },
    {
      id: 'nest-4', topic: 'nested', type: 'fix', difficulty: 'practice', skill: 'coding',
      objective: 'Fix a pattern', prompt: 'This should print a 3 × 4 rectangle of `#` (3 rows of `####`). Fix it.',
      code: pas`
program Rect;
var
  i, j : integer;
begin
  for i := 1 to 3 do
    for j := 1 to 4 do
      write('#');
    writeln;
end.
`,
      tests: [{ exact: '####\n####\n####' }],
      hints: ['Which statements should repeat for every row?', 'Wrap the inner loop and the writeln in begin…end.'],
      solution: pas`
program Rect;
var
  i, j : integer;
begin
  for i := 1 to 3 do
  begin
    for j := 1 to 4 do
      write('#');
    writeln;
  end;
end.
`,
      explanation: 'The `writeln;` must be inside the outer loop, so begin…end is needed.',
    },
    {
      id: 'nest-5', topic: 'nested', type: 'write', difficulty: 'practice', skill: 'coding', exam: true,
      objective: 'Pass/fail statistics', prompt: 'Read how many students there are, then each student\'s mark. Print `Passed: ` and `Failed: ` counts (pass = 50 or more).',
      starter: pas`
program Stats;
var
  n, i, marks, passCount, failCount : integer;
begin

end.
`,
      tests: [{ inputs: ['4', '45', '78', '62', '30'], expect: ['Passed: 2', 'Failed: 2'] }, { inputs: ['3', '50', '90', '100'], expect: ['Passed: 3', 'Failed: 0'] }],
      hints: ['Set both counters to 0 first.', 'for i := 1 to n do begin readln(marks); if … end;'],
      solution: pas`
program Stats;
var
  n, i, marks, passCount, failCount : integer;
begin
  passCount := 0;
  failCount := 0;
  readln(n);
  for i := 1 to n do
  begin
    readln(marks);
    if marks >= 50 then
      passCount := passCount + 1
    else
      failCount := failCount + 1;
  end;
  writeln('Passed: ', passCount);
  writeln('Failed: ', failCount);
end.
`,
      explanation: 'An if inside the loop decides which counter to increase.',
    },
    {
      id: 'nest-6', topic: 'nested', type: 'write', difficulty: 'challenge', skill: 'problem', exam: true,
      objective: 'Number pyramid', prompt: `Read n and print a right-aligned number pattern. For n = 3:

\`\`\`
1
22
333
\`\`\``,
      starter: pas`
program Numbers;
var
  n, i, j : integer;
begin

end.
`,
      tests: [{ inputs: ['3'], exact: '1\n22\n333' }, { inputs: ['4'], exact: '1\n22\n333\n4444' }],
      hints: ['Row i prints the digit i, i times.', 'Inner loop: for j := 1 to i do write(i);'],
      solution: pas`
program Numbers;
var
  n, i, j : integer;
begin
  readln(n);
  for i := 1 to n do
  begin
    for j := 1 to i do
      write(i);
    writeln;
  end;
end.
`,
      explanation: 'The outer counter decides both what to print and how many times.',
    },
    {
      id: 'nest-7', topic: 'nested', type: 'trace', difficulty: 'challenge', skill: 'problem',
      objective: 'Trace nested loops', prompt: 'Trace `i`, `j` and `total` each time the inner statement runs.',
      code: pas`
total := 0;
for i := 1 to 2 do
  for j := 1 to 3 do
    total := total + i * j;
`,
      columns: ['i', 'j', 'total'], rowLabel: 'Run',
      rows: [['{1}', '{1}', '1'], ['{1}', '{2}', '3'], ['{1}', '{3}', '6'], ['{2}', '{1}', '8'], ['{2}', '{2}', '12'], ['{2}', '{3}', '18']],
      hints: ['Add i × j each time.'], explanation: '1, 3, 6, then 6+2=8, 8+4=12, 12+6=18.',
    },
    {
      id: 'nest-8', topic: 'nested', type: 'spot', difficulty: 'practice', skill: 'coding',
      objective: 'Same counter in both loops', prompt: 'This nested loop doesn\'t work. Click the line with the bug.',
      code: pas`
program Grid;
var
  i, j : integer;
begin
  for i := 1 to 3 do
  begin
    for i := 1 to 3 do
      write('o');
    writeln;
  end;
end.
`,
      lines: [7], hints: ['Look at the counter variables.'], explanation: 'The inner loop must use a different variable (j). Using i again changes the outer loop\'s counter.',
    },
    // ---------- programs
    {
      id: 'prog-1', topic: 'programs', type: 'categorize', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Types of errors', prompt: 'Sort each mistake into the type of error it causes.', categories: ['Syntax error', 'Runtime error', 'Logic error'],
      items: [
        { text: 'Missing semicolon', category: 0 },
        { text: 'Using double quotes for text', category: 0 },
        { text: 'Dividing by a variable that is 0', category: 1 },
        { text: 'Typing letters when a number is expected', category: 1 },
        { text: 'Average divides by 2 instead of 3', category: 2 },
        { text: 'Using > 50 when 50 should pass', category: 2 },
      ],
      hints: ['Syntax: won\'t run at all. Runtime: crashes while running. Logic: runs but gives wrong results.'], explanation: 'Syntax errors stop it from running; runtime errors crash it; logic errors give wrong answers.',
    },
    {
      id: 'prog-2', topic: 'programs', type: 'spot', difficulty: 'easy', skill: 'coding', exam: true,
      objective: 'Find a syntax error', prompt: 'Click the line with the mistake.',
      code: pas`
program Area;
var
  len, wid, area : integer;
begin
  len := 5;
  wid := 4;
  area = len * wid;
  writeln('Area: ', area);
end.
`,
      lines: [7], hints: ['How do you store a value?'], explanation: 'Line 7 uses `=` instead of `:=`.',
    },
    {
      id: 'prog-3', topic: 'programs', type: 'spot', difficulty: 'practice', skill: 'problem', exam: true,
      objective: 'Find a logic error', prompt: 'This program runs, but the average is wrong. Click the line with the logic error.',
      code: pas`
program Avg3;
var
  a, b, c : integer;
  avg : real;
begin
  a := 60;
  b := 70;
  c := 80;
  avg := a + b + c / 3;
  writeln(avg:0:2);
end.
`,
      lines: [9], hints: ['Which operation happens first: + or /?'], explanation: 'Only `c` is divided by 3. It should be `(a + b + c) / 3`.',
    },
    {
      id: 'prog-4', topic: 'programs', type: 'output', difficulty: 'practice', skill: 'problem', exam: true,
      objective: 'Trace a full program', prompt: 'The user types `3`, `45`, `78`, `62`. What does the program print?',
      code: pas`
program GradeStatistics;
var
  n, i, marks, passCount, total : integer;
begin
  passCount := 0;
  total := 0;
  readln(n);
  for i := 1 to n do
  begin
    readln(marks);
    total := total + marks;
    if marks >= 50 then
      passCount := passCount + 1;
  end;
  writeln('Passed: ', passCount);
  writeln('Average: ', total / n:0:2);
end.
`,
      inputs: ['3', '45', '78', '62'], answer: 'Passed: 2\nAverage: 61.67', hints: ['78 and 62 pass.', '(45 + 78 + 62) / 3'], explanation: '2 students passed; average = 185 / 3 = 61.67.',
    },
    {
      id: 'prog-5', topic: 'programs', type: 'fix', difficulty: 'practice', skill: 'coding', exam: true,
      objective: 'Fix multiple bugs', prompt: 'This program should read a number and print whether it is `Positive`, `Negative` or `Zero`. It has several bugs. Fix them all.',
      code: pas`
program Sign
var
  n : integer;
begin
  readln(n);
  if n > 0 then
    writeln("Positive");
  else if n < 0 then
    writeln('Negative')
  else
    writeln('Zero');
end
`,
      tests: [{ inputs: ['5'], expect: ['Positive'] }, { inputs: ['-2'], expect: ['Negative'] }, { inputs: ['0'], expect: ['Zero'] }],
      hints: ['Run it — fix the first error, run again.', 'Check: heading, quotes, semicolon before else, and the end.'],
      solution: pas`
program Sign;
var
  n : integer;
begin
  readln(n);
  if n > 0 then
    writeln('Positive')
  else if n < 0 then
    writeln('Negative')
  else
    writeln('Zero');
end.
`,
      explanation: 'Four fixes: `;` after the heading, single quotes, no `;` before else, and `end.`',
    },
    {
      id: 'prog-6', topic: 'programs', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Debugging technique', prompt: 'Your program runs but prints the wrong total. What is a good way to find the problem?',
      options: ['Delete the program and start again', 'Add writeln statements to print variable values at each step', 'Add more semicolons', 'Change all integers to reals'], answer: 1,
      why: ['You\'d lose all your work.', '', 'Semicolons don\'t fix logic errors.', 'This rarely fixes the logic.'],
      hints: ['How can you see what the variables are doing?'], explanation: 'Printing variable values (or watching the program step by step) shows where the logic goes wrong.',
    },
    {
      id: 'prog-7', topic: 'programs', type: 'write', difficulty: 'challenge', skill: 'problem', exam: true,
      objective: 'Write a complete program', prompt: 'Electricity bill: read the units used. The first 60 units cost Rs. 10 each; any units **above 60** cost Rs. 25 each. Print `Bill: Rs. ` and the total.',
      starter: pas`
program Bill;
var
  units, bill : integer;
begin

end.
`,
      tests: [{ inputs: ['40'], expect: ['Bill: Rs. 400'] }, { inputs: ['60'], expect: ['Bill: Rs. 600'] }, { inputs: ['100'], expect: ['Bill: Rs. 1600'] }],
      hints: ['If units <= 60, bill := units * 10.', 'Otherwise bill := 60 * 10 + (units - 60) * 25.'],
      solution: pas`
program Bill;
var
  units, bill : integer;
begin
  readln(units);
  if units <= 60 then
    bill := units * 10
  else
    bill := 60 * 10 + (units - 60) * 25;
  writeln('Bill: Rs. ', bill);
end.
`,
      explanation: 'Charge the first 60 units at one rate and the rest at another.',
    },
    {
      id: 'prog-8', topic: 'programs', type: 'arrange', difficulty: 'challenge', skill: 'coding',
      objective: 'Program structure', prompt: 'Arrange the lines to make a program that reads 3 numbers and prints the total.',
      lines: ['program Total3;', 'var', '  i, n, total : integer;', 'begin', '  total := 0;', '  for i := 1 to 3 do', '  begin', '    readln(n);', '    total := total + n;', '  end;', "  writeln('Total: ', total);", 'end.'],
      tests: [{ inputs: ['2', '3', '4'], expect: ['Total: 9'] }],
      hints: ['Heading, var section, then begin.', 'Initialise the total before the loop.', 'Print after the loop.'], explanation: 'Heading → declarations → initialise → loop (read and add) → output → end.',
    },
  ],
  boss: {
    id: 'boss-u6',
    unit: 'u6',
    title: 'The ATM Showdown',
    emoji: 'banknote',
    story: 'The bank\'s ATM program has been wiped! Rebuild it piece by piece: check the PIN, run the menu, and keep the balance right.',
    stages: [
      {
        title: 'PIN check',
        prompt: 'The PIN is `1234`. Give the user up to **3 tries**. Print `Wrong PIN` after each wrong try. If correct, print `Welcome!`; after 3 wrong tries print `Card blocked`.',
        starter: pas`
program PinCheck;
var
  pin : string;
  tries : integer;
begin

end.
`,
        tests: [
          { inputs: ['1234'], expect: ['Welcome!'], reject: ['Wrong', 'blocked'] },
          { inputs: ['1111', '1234'], expect: ['Wrong PIN', 'Welcome!'], reject: ['blocked'] },
          { inputs: ['1', '2', '3'], expect: ['Wrong PIN', 'Wrong PIN', 'Wrong PIN', 'Card blocked'], reject: ['Welcome'] },
        ],
        hints: ['Use repeat…until (pin = \'1234\') or (tries = 3).', 'After the loop, use if to decide what to print.'],
        solution: pas`
program PinCheck;
var
  pin : string;
  tries : integer;
begin
  tries := 0;
  repeat
    readln(pin);
    tries := tries + 1;
    if pin <> '1234' then
      writeln('Wrong PIN');
  until (pin = '1234') or (tries = 3);
  if pin = '1234' then
    writeln('Welcome!')
  else
    writeln('Card blocked');
end.
`,
      },
      {
        title: 'The menu',
        prompt: 'Balance starts at 10000. Repeatedly read a choice: `1` prints `Balance: ` and the balance, `2` reads an amount and withdraws it (print `Insufficient funds` if too much), `3` exits printing `Goodbye`. Any other choice prints `Invalid choice`.',
        starter: pas`
program AtmMenu;
var
  balance, choice, amount : integer;
begin
  balance := 10000;

end.
`,
        tests: [
          { inputs: ['1', '3'], expect: ['Balance: 10000', 'Goodbye'] },
          { inputs: ['2', '2500', '1', '3'], expect: ['Balance: 7500', 'Goodbye'] },
          { inputs: ['2', '20000', '9', '3'], expect: ['Insufficient funds', 'Invalid choice', 'Goodbye'] },
        ],
        hints: ['repeat readln(choice); case choice of … until choice = 3;', 'Option 2 needs begin…end inside the case.'],
        solution: pas`
program AtmMenu;
var
  balance, choice, amount : integer;
begin
  balance := 10000;
  repeat
    readln(choice);
    case choice of
      1 : writeln('Balance: ', balance);
      2 : begin
            readln(amount);
            if amount > balance then
              writeln('Insufficient funds')
            else
              balance := balance - amount;
          end;
      3 : writeln('Goodbye');
    else
      writeln('Invalid choice');
    end;
  until choice = 3;
end.
`,
      },
      {
        title: 'Mini statement',
        prompt: 'Read how many transactions there are, then each amount (positive = deposit, negative = withdrawal). Starting from 5000, print `Deposits: `, `Withdrawals: ` (counts) and `Final balance: `.',
        starter: pas`
program Statement;
var
  n, i, amount, balance, deps, wds : integer;
begin

end.
`,
        tests: [{ inputs: ['4', '1000', '-500', '-200', '300'], expect: ['Deposits: 2', 'Withdrawals: 2', 'Final balance: 5600'] }, { inputs: ['1', '-5000'], expect: ['Deposits: 0', 'Withdrawals: 1', 'Final balance: 0'] }],
        hints: ['balance := 5000; deps := 0; wds := 0;', 'In the loop: balance := balance + amount; then count with if.'],
        solution: pas`
program Statement;
var
  n, i, amount, balance, deps, wds : integer;
begin
  balance := 5000;
  deps := 0;
  wds := 0;
  readln(n);
  for i := 1 to n do
  begin
    readln(amount);
    balance := balance + amount;
    if amount > 0 then
      deps := deps + 1
    else
      wds := wds + 1;
  end;
  writeln('Deposits: ', deps);
  writeln('Withdrawals: ', wds);
  writeln('Final balance: ', balance);
end.
`,
      },
    ],
  },
};

export default mod;
