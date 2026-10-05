import type { UnitModule } from '../index';
import { pas } from '../util';

const mod: UnitModule = {
  unit: {
    id: 'u4',
    title: 'Making Decisions',
    subtitle: 'if, else if, begin…end blocks and case',
    hue: 'amber',
    icon: 'split',
    topics: ['if', 'elseif', 'case'],
    boss: 'boss-u4',
  },
  topics: [
    // ---------------------------------------------------------------- if
    {
      id: 'if',
      unit: 'u4',
      title: 'IF and IF…ELSE',
      short: 'Run code only when a condition is TRUE',
      source: 'Tute §8.1–8.2',
      minutes: 9,
      objectives: ['Write an if…then statement', 'Add an else branch', 'Avoid the semicolon-before-else mistake'],
      lesson: [
        {
          kind: 'concept',
          title: 'Programs that decide',
          body: `Programs need to make decisions. An **if statement** runs code only when a condition is TRUE:`,
          code: pas`
if marks >= 50 then
  writeln('Congratulations! You passed!');
`,
          callout: { kind: 'tip', text: 'Read it aloud: "IF marks is at least 50, THEN print…"' },
        },
        { kind: 'visual', title: 'Follow the path', body: 'Move the slider and watch which branch runs.', visual: 'if-flow' },
        {
          kind: 'concept',
          title: 'IF…ELSE: one or the other',
          body: 'Add `else` to choose between **two** paths. Exactly one of them runs.',
          code: pas`
if marks >= 50 then
  writeln('You PASSED!')
else
  writeln('You FAILED. Try again next time.');
`,
          callout: { kind: 'mistake', text: 'No semicolon before `else`! `if…then…else` is ONE statement, so the `;` goes only at the very end.' },
        },
        {
          kind: 'watch',
          title: 'Watch the decision',
          body: 'The user types 42. Press **Play** and watch the condition become TRUE or FALSE.',
          inputs: ['42'],
          code: pas`
program IfElse;
var
  marks : integer;
begin
  write('Enter marks: ');
  readln(marks);
  if marks >= 50 then
    writeln('You PASSED!')
  else
    writeln('You FAILED. Try again next time.');
  writeln('Program ended');
end.
`,
        },
        { kind: 'check', question: 'if-2' },
        {
          kind: 'try',
          title: 'Positive or negative?',
          body: 'Complete the program: print `Positive` if the number is greater than 0, otherwise print `Not positive`.',
          starter: pas`
program Sign;
var
  n : integer;
begin
  readln(n);

end.
`,
          tests: [{ inputs: ['5'], expect: ['Positive'], reject: ['Not'] }, { inputs: ['-3'], expect: ['Not positive'] }, { inputs: ['0'], expect: ['Not positive'] }],
          hints: ['if n > 0 then', "writeln('Positive') — no semicolon here because else follows", "else writeln('Not positive');"],
          solution: pas`
program Sign;
var
  n : integer;
begin
  readln(n);
  if n > 0 then
    writeln('Positive')
  else
    writeln('Not positive');
end.
`,
        },
        { kind: 'check', question: 'if-4' },
      ],
      revision: {
        what: '`if condition then statement` runs the statement only when the condition is TRUE; `else` gives an alternative.',
        why: 'Programs must react differently to different data (pass/fail, valid/invalid input).',
        syntax: pas`
if condition then
  statement1
else
  statement2;
`,
        example: {
          code: pas`
program PassFail;
var
  marks : integer;
begin
  marks := 65;
  if marks >= 50 then
    writeln('PASS')
  else
    writeln('FAIL');
end.
`,
          output: 'PASS',
        },
        mistakes: ['A semicolon before `else`.', 'Using `:=` in the condition: `if x := 5 then`.', 'Forgetting `then`.'],
        examPoints: ['Only ONE branch of if…else runs.', 'Without else, nothing happens when the condition is FALSE.'],
        keyTerms: [
          { term: 'Selection', def: 'Choosing which statements to run based on a condition.' },
          { term: 'Condition', def: 'An expression that is TRUE or FALSE.' },
        ],
        mini: 'if-1',
      },
    },
    // ---------------------------------------------------------------- elseif
    {
      id: 'elseif',
      unit: 'u4',
      title: 'ELSE IF and begin…end',
      short: 'Many choices, and several statements in a branch',
      source: 'Tute §8.3–8.4',
      minutes: 10,
      objectives: ['Write an if…else if…else chain', 'Order conditions correctly', 'Use begin…end for several statements'],
      lesson: [
        {
          kind: 'concept',
          title: 'More than two choices',
          body: 'Chain `else if` to check several conditions **in order**. The **first** TRUE condition wins, and the rest are skipped.',
          code: pas`
if marks >= 75 then
  writeln('Grade: A')
else if marks >= 65 then
  writeln('Grade: B')
else if marks >= 55 then
  writeln('Grade: C')
else if marks >= 40 then
  writeln('Grade: S')
else
  writeln('Grade: F');
`,
        },
        {
          kind: 'watch',
          title: 'Watch the chain',
          body: 'The user types 58. Watch how Pascal checks each condition until one is TRUE.',
          inputs: ['58'],
          code: pas`
program GradeCalculator;
var
  marks : integer;
begin
  readln(marks);
  if marks >= 75 then
    writeln('Grade: A')
  else if marks >= 65 then
    writeln('Grade: B')
  else if marks >= 55 then
    writeln('Grade: C')
  else if marks >= 40 then
    writeln('Grade: S')
  else
    writeln('Grade: F');
end.
`,
        },
        { kind: 'check', question: 'ei-3' },
        {
          kind: 'concept',
          title: 'Several statements? Use begin…end',
          body: 'Each branch can only hold **one** statement. To run several, wrap them in `begin … end`:',
          code: pas`
if marks >= 50 then
begin
  writeln('*** CONGRATULATIONS ***');
  writeln('You have passed the exam!');
end
else
begin
  writeln('Unfortunately, you did not pass');
  writeln('Keep studying and try again');
end;
`,
          callout: { kind: 'mistake', text: 'Notice `end` before `else` has **no** semicolon. And every `begin` needs its own `end`.' },
        },
        { kind: 'check', question: 'ei-5' },
        {
          kind: 'try',
          title: 'Bigger of two',
          body: 'Read two numbers. If the first is bigger, print `First is bigger` **and** `Difference: ` with the difference. Otherwise print `Second is bigger or equal`.',
          starter: pas`
program Bigger;
var
  a, b : integer;
begin
  readln(a);
  readln(b);

end.
`,
          tests: [{ inputs: ['9', '4'], expect: ['First is bigger', 'Difference: 5'] }, { inputs: ['2', '7'], expect: ['Second is bigger or equal'], reject: ['Difference'] }],
          hints: ['The THEN part has two statements, so it needs begin…end.', "if a > b then begin ... end else writeln('Second is bigger or equal');"],
          solution: pas`
program Bigger;
var
  a, b : integer;
begin
  readln(a);
  readln(b);
  if a > b then
  begin
    writeln('First is bigger');
    writeln('Difference: ', a - b);
  end
  else
    writeln('Second is bigger or equal');
end.
`,
        },
      ],
      revision: {
        what: 'An if…else if…else chain chooses one of many branches; `begin…end` groups several statements into one.',
        why: 'Grading, menus and categories need more than two outcomes; most branches need more than one statement.',
        syntax: pas`
if cond1 then
  stmt1
else if cond2 then
begin
  stmt2a;
  stmt2b;
end
else
  stmt3;
`,
        mistakes: ['Checking the smallest boundary first (`marks >= 40` before `>= 75`).', 'Missing `begin…end` so only the first statement belongs to the if.', 'Putting `;` after `end` when `else` follows.'],
        examPoints: ['Only the first TRUE branch runs.', 'Order conditions from highest to lowest for ranges.', 'Count begin/end pairs carefully.'],
        keyTerms: [{ term: 'Compound statement', def: 'Several statements grouped with begin … end so they act as one.' }, { term: 'Nested if', def: 'An if statement inside another if or else.' }],
        mini: 'ei-1',
      },
    },
    // ---------------------------------------------------------------- case
    {
      id: 'case',
      unit: 'u4',
      title: 'CASE Statement',
      short: 'A neat way to choose from many values',
      source: 'Tute §8.5',
      minutes: 8,
      objectives: ['Write a case statement for integers and chars', 'Use several labels and an else branch', 'Choose between case and if'],
      lesson: [
        {
          kind: 'concept',
          title: 'Choosing by value',
          body: 'When **one variable** is compared with **many fixed values**, `case` is cleaner than lots of ifs:',
          code: pas`
case choice of
  1 : writeln('Starting new game...');
  2 : writeln('Loading saved game...');
  3 : writeln('Opening settings...');
  4 : writeln('Goodbye!');
else
  writeln('Invalid choice!');
end;
`,
          callout: { kind: 'tip', text: 'A case statement ends with its own `end;` — even though there is no `begin`.' },
        },
        {
          kind: 'example',
          title: 'A game menu',
          body: 'Run it and choose an option. Try an invalid number too.',
          inputs: ['2'],
          code: pas`
program MenuSystem;
var
  choice : integer;
begin
  writeln('=== Menu ===');
  writeln('1. New Game');
  writeln('2. Load Game');
  writeln('3. Settings');
  writeln('4. Exit');
  write('Enter choice: ');
  readln(choice);
  case choice of
    1 : writeln('Starting new game...');
    2 : writeln('Loading saved game...');
    3 : writeln('Opening settings...');
    4 : writeln('Goodbye!');
  else
    writeln('Invalid choice!');
  end;
end.
`,
        },
        {
          kind: 'concept',
          title: 'Several labels, chars too',
          body: 'One branch can have several labels separated by commas. Case also works with `char`:',
          code: pas`
case grade of
  'A', 'a' : writeln('Outstanding performance!');
  'B', 'b' : writeln('Very good work!');
  'F', 'f' : writeln('Need improvement');
else
  writeln('Invalid grade');
end;
`,
        },
        { kind: 'check', question: 'case-2' },
        {
          kind: 'try',
          title: 'Day names',
          body: 'Read a number 1–7 and print the day name (1 = Monday … 7 = Sunday). Print `Invalid day` for anything else.',
          starter: pas`
program Days;
var
  d : integer;
begin
  readln(d);

end.
`,
          tests: [{ inputs: ['1'], expect: ['Monday'] }, { inputs: ['6'], expect: ['Saturday'] }, { inputs: ['7'], expect: ['Sunday'] }, { inputs: ['9'], expect: ['Invalid day'] }],
          hints: ['case d of', "1 : writeln('Monday');", "else writeln('Invalid day'); then end;"],
          solution: pas`
program Days;
var
  d : integer;
begin
  readln(d);
  case d of
    1 : writeln('Monday');
    2 : writeln('Tuesday');
    3 : writeln('Wednesday');
    4 : writeln('Thursday');
    5 : writeln('Friday');
    6 : writeln('Saturday');
    7 : writeln('Sunday');
  else
    writeln('Invalid day');
  end;
end.
`,
        },
        { kind: 'check', question: 'case-5' },
      ],
      revision: {
        what: '`case variable of` runs the branch whose label matches the variable\'s value; `else` handles everything else.',
        why: 'Menus and codes (1, 2, 3 or A, B, C) are clearer with case than with long if chains.',
        syntax: pas`
case variable of
  value1 : statement;
  value2, value3 : statement;
else
  statement;
end;
`,
        mistakes: ['Forgetting the `end;` that closes the case.', 'Using a real or string variable with labels of the wrong type.', 'Using variables as labels (labels must be fixed values).'],
        examPoints: ['Case works with integer and char values.', 'Several labels can share one branch: `\'A\', \'a\' :`', 'Be able to rewrite a case as if…else if (and back).'],
        keyTerms: [{ term: 'Case label', def: 'A fixed value (like 1 or \'A\') that selects a branch in a case statement.' }],
        mini: 'case-1',
      },
    },
  ],
  questions: [
    // ---------- if
    {
      id: 'if-1', topic: 'if', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'if syntax', prompt: 'Which `if` statement is written correctly?', codeOptions: true,
      options: ["if marks > 50\n  writeln('Pass');", "if marks > 50 then\n  writeln('Pass');", "if (marks > 50) do\n  writeln('Pass');", "if marks > 50 then:\n  writeln('Pass');"], answer: 1,
      why: ['It is missing `then`.', '', '`do` is for loops, not if.', 'There is no colon after then.'],
      hints: ['if … ___ …'], explanation: 'The pattern is `if condition then statement;`',
    },
    {
      id: 'if-2', topic: 'if', type: 'output', difficulty: 'easy', skill: 'problem', exam: true,
      objective: 'Trace an if', prompt: 'What does this print?',
      code: pas`
program SimpleIf;
var
  marks : integer;
begin
  marks := 45;
  if marks >= 50 then
    writeln('Congratulations! You passed!');
  writeln('Program ended');
end.
`,
      answer: 'Program ended', hints: ['Is 45 >= 50?', 'The last writeln is NOT part of the if.'], explanation: 'The condition is FALSE, so only `Program ended` is printed.',
    },
    {
      id: 'if-3', topic: 'if', type: 'spot', difficulty: 'easy', skill: 'coding', exam: true,
      objective: 'Semicolon before else', prompt: 'Click the line that causes the error.',
      code: pas`
program Check;
var
  x : integer;
begin
  x := 5;
  if x > 0 then
    writeln('Positive');
  else
    writeln('Not positive');
end.
`,
      lines: [7], hints: ['Look at the line just before else.'], explanation: 'Line 7 must not end with `;` because `else` follows.',
    },
    {
      id: 'if-4', topic: 'if', type: 'output', difficulty: 'practice', skill: 'problem', exam: true,
      objective: 'if-else trace', prompt: 'The user types `-4`. What is printed?',
      code: pas`
program Abs;
var
  n : integer;
begin
  readln(n);
  if n < 0 then
    n := -n
  else
    n := n * 2;
  writeln(n);
end.
`,
      inputs: ['-4'], answer: '4', hints: ['-4 < 0 is TRUE.', 'What is -(-4)?'], explanation: 'n is negative, so n := -n = 4.',
    },
    {
      id: 'if-5', topic: 'if', type: 'fix', difficulty: 'practice', skill: 'coding',
      objective: 'Fix if errors', prompt: 'Fix the program so it prints `Even` or `Odd` correctly.',
      code: pas`
program EvenOdd;
var
  n : integer;
begin
  readln(n);
  if n mod 2 := 0 then
    writeln('Even');
  else
    writeln('Odd');
end.
`,
      tests: [{ inputs: ['8'], expect: ['Even'] }, { inputs: ['7'], expect: ['Odd'] }],
      hints: ['There are two mistakes.', 'In a condition, use = to compare.', 'No semicolon before else.'],
      solution: pas`
program EvenOdd;
var
  n : integer;
begin
  readln(n);
  if n mod 2 = 0 then
    writeln('Even')
  else
    writeln('Odd');
end.
`,
      explanation: 'Use `=` in the condition and remove the `;` before `else`.',
    },
    {
      id: 'if-6', topic: 'if', type: 'write', difficulty: 'practice', skill: 'coding', exam: true,
      objective: 'Write if-else', prompt: 'Read an age. Print `Can vote` if the age is 18 or more, otherwise `Too young to vote`.',
      starter: pas`
program Vote;
var
  age : integer;
begin

end.
`,
      tests: [{ inputs: ['18'], expect: ['Can vote'] }, { inputs: ['25'], expect: ['Can vote'] }, { inputs: ['17'], expect: ['Too young to vote'] }],
      hints: ['readln(age);', 'if age >= 18 then … else …'],
      solution: pas`
program Vote;
var
  age : integer;
begin
  readln(age);
  if age >= 18 then
    writeln('Can vote')
  else
    writeln('Too young to vote');
end.
`,
      explanation: 'Read the age, then use if…else with `>= 18`.',
    },
    {
      id: 'if-7', topic: 'if', type: 'arrange', difficulty: 'easy', skill: 'coding',
      objective: 'if-else structure', prompt: 'Arrange the lines to print whether a number is zero.',
      fixedTop: ['program Zero;', 'var n : integer;', 'begin', '  readln(n);'], fixedBottom: ['end.'],
      lines: ['  if n = 0 then', "    writeln('Zero')", '  else', "    writeln('Not zero');"],
      tests: [{ inputs: ['0'], expect: ['Zero'], reject: ['Not'] }, { inputs: ['3'], expect: ['Not zero'] }],
      hints: ['if … then comes first, else in the middle.'], explanation: 'if → then-statement → else → else-statement;',
    },
    {
      id: 'if-8', topic: 'if', type: 'write', difficulty: 'challenge', skill: 'problem', exam: true,
      objective: 'Largest of two', prompt: 'Read two numbers and print the **larger** one (if equal, print either). Example: 7 and 12 → `12`.',
      starter: pas`
program Larger;
var
  a, b : integer;
begin

end.
`,
      tests: [{ inputs: ['7', '12'], expect: ['12'], reject: ['7'] }, { inputs: ['30', '4'], expect: ['30'] }, { inputs: ['5', '5'], expect: ['5'] }],
      hints: ['Compare a and b with >.', 'Print a in the then-branch and b in the else-branch.'],
      solution: pas`
program Larger;
var
  a, b : integer;
begin
  readln(a);
  readln(b);
  if a > b then
    writeln(a)
  else
    writeln(b);
end.
`,
      explanation: 'One comparison decides which value to print.',
    },
    // ---------- elseif
    {
      id: 'ei-1', topic: 'elseif', type: 'output', difficulty: 'easy', skill: 'problem', exam: true,
      objective: 'Trace an else-if chain', prompt: 'The user types `68`. What is printed?',
      code: pas`
program Grade;
var
  marks : integer;
begin
  readln(marks);
  if marks >= 75 then
    writeln('A')
  else if marks >= 65 then
    writeln('B')
  else if marks >= 55 then
    writeln('C')
  else
    writeln('F');
end.
`,
      inputs: ['68'], answer: 'B', hints: ['Check the conditions from the top.'], explanation: '68 >= 75 is FALSE; 68 >= 65 is TRUE → B. The rest are skipped.',
    },
    {
      id: 'ei-2', topic: 'elseif', type: 'mcq', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'Order of conditions', prompt: 'A student scores 90. What does this print?',
      code: pas`
if marks >= 40 then
  writeln('S')
else if marks >= 75 then
  writeln('A');
`,
      options: ['A', 'S', 'S and A', 'Nothing'], answer: 1,
      why: ['The first TRUE condition wins, and that is marks >= 40.', '', 'Only one branch of the chain runs.', '90 >= 40 is TRUE, so something is printed.'],
      hints: ['Which condition is checked first?'], explanation: '90 >= 40 is TRUE, so `S` is printed and the rest is skipped. That\'s why the highest boundary should be checked first.',
    },
    {
      id: 'ei-3', topic: 'elseif', type: 'trace', difficulty: 'practice', skill: 'problem',
      objective: 'Predict branches', prompt: 'For each mark, write the grade printed by the tute\'s grade calculator (A ≥ 75, B ≥ 65, C ≥ 55, S ≥ 40, else F).',
      code: pas`
if marks >= 75 then writeln('A')
else if marks >= 65 then writeln('B')
else if marks >= 55 then writeln('C')
else if marks >= 40 then writeln('S')
else writeln('F');
`,
      columns: ['marks', 'grade'], rowLabel: 'Case',
      rows: [['{80}', 'A'], ['{75}', 'A'], ['{64}', 'C'], ['{40}', 'S'], ['{39}', 'F']],
      hints: ['75 is "75 or more".', '64 is not ≥ 65.'], explanation: '80→A, 75→A, 64→C, 40→S, 39→F.',
    },
    {
      id: 'ei-4', topic: 'elseif', type: 'output', difficulty: 'practice', skill: 'problem', exam: true,
      objective: 'Missing begin-end', prompt: 'What does this print? (Look carefully at the indentation — Pascal ignores it!)',
      code: pas`
program Trap;
var
  x : integer;
begin
  x := 3;
  if x > 5 then
    writeln('Big');
    writeln('Very big');
  writeln('Done');
end.
`,
      answer: 'Very big\nDone', hints: ['Without begin…end, only ONE statement belongs to the if.'], explanation: 'Only `writeln(\'Big\')` is inside the if. `Very big` always prints.',
    },
    {
      id: 'ei-5', topic: 'elseif', type: 'fix', difficulty: 'practice', skill: 'coding', exam: true,
      objective: 'Add begin-end', prompt: 'When marks ≥ 50 it should print `PASS` and `Well done!`; otherwise only `FAIL`. Fix it.',
      code: pas`
program Result;
var
  marks : integer;
begin
  readln(marks);
  if marks >= 50 then
    writeln('PASS');
    writeln('Well done!');
  else
    writeln('FAIL');
end.
`,
      tests: [{ inputs: ['70'], expect: ['PASS', 'Well done!'], reject: ['FAIL'] }, { inputs: ['30'], expect: ['FAIL'], reject: ['Well done'] }],
      hints: ['Two statements in the then-branch need begin…end.', 'No semicolon after end when else follows.'],
      solution: pas`
program Result;
var
  marks : integer;
begin
  readln(marks);
  if marks >= 50 then
  begin
    writeln('PASS');
    writeln('Well done!');
  end
  else
    writeln('FAIL');
end.
`,
      explanation: 'Wrap both statements in `begin … end` (with no `;` after `end` before `else`).',
    },
    {
      id: 'ei-6', topic: 'elseif', type: 'write', difficulty: 'practice', skill: 'coding', exam: true,
      objective: 'Write an else-if chain', prompt: 'Read a temperature. Print `Hot` if above 30, `Warm` if 20 to 30, otherwise `Cold`.',
      starter: pas`
program Weather;
var
  temp : integer;
begin

end.
`,
      tests: [{ inputs: ['35'], expect: ['Hot'] }, { inputs: ['30'], expect: ['Warm'] }, { inputs: ['20'], expect: ['Warm'] }, { inputs: ['12'], expect: ['Cold'] }],
      hints: ['Check > 30 first.', 'Then >= 20.'],
      solution: pas`
program Weather;
var
  temp : integer;
begin
  readln(temp);
  if temp > 30 then
    writeln('Hot')
  else if temp >= 20 then
    writeln('Warm')
  else
    writeln('Cold');
end.
`,
      explanation: 'Highest boundary first, then the next, then else.',
    },
    {
      id: 'ei-7', topic: 'elseif', type: 'write', difficulty: 'challenge', skill: 'problem', exam: true,
      objective: 'Largest of three', prompt: 'Read three numbers and print the **largest**. (4, 11, 7 → `11`)',
      starter: pas`
program Largest;
var
  a, b, c : integer;
begin

end.
`,
      tests: [{ inputs: ['4', '11', '7'], expect: ['11'] }, { inputs: ['9', '2', '3'], expect: ['9'] }, { inputs: ['1', '5', '8'], expect: ['8'] }, { inputs: ['6', '6', '2'], expect: ['6'] }],
      hints: ['If a is at least as big as both b and c, a is the largest.', 'if (a >= b) and (a >= c) then … else if b >= c then … else …'],
      solution: pas`
program Largest;
var
  a, b, c : integer;
begin
  readln(a);
  readln(b);
  readln(c);
  if (a >= b) and (a >= c) then
    writeln(a)
  else if b >= c then
    writeln(b)
  else
    writeln(c);
end.
`,
      explanation: 'Check a against both others, then decide between b and c.',
    },
    {
      id: 'ei-8', topic: 'elseif', type: 'spot', difficulty: 'challenge', skill: 'coding',
      objective: 'Matching begin/end', prompt: 'This program won\'t run. Click the line where the problem starts.',
      code: pas`
program Match;
var
  n : integer;
begin
  n := 4;
  if n > 0 then
  begin
    writeln('Positive');
    writeln('Checked');
  else
    writeln('Not positive');
end.
`,
      lines: [9, 10], hints: ['Every begin needs an end.'], explanation: 'The `begin` on line 7 is never closed: an `end` is needed before `else`.',
    },
    // ---------- case
    {
      id: 'case-1', topic: 'case', type: 'output', difficulty: 'easy', skill: 'problem', exam: true,
      objective: 'Trace a case', prompt: 'The user types `3`. What is printed?',
      code: pas`
program Menu;
var
  choice : integer;
begin
  readln(choice);
  case choice of
    1 : writeln('New Game');
    2 : writeln('Load Game');
    3 : writeln('Settings');
  else
    writeln('Invalid');
  end;
end.
`,
      inputs: ['3'], answer: 'Settings', hints: ['Find the label that matches 3.'], explanation: 'The label `3` matches, so `Settings` is printed.',
    },
    {
      id: 'case-2', topic: 'case', type: 'output', difficulty: 'practice', skill: 'problem', exam: true,
      objective: 'case with chars and else', prompt: 'The user types `b`. What is printed?',
      code: pas`
program GradeComment;
var
  grade : char;
begin
  readln(grade);
  case grade of
    'A', 'a' : writeln('Outstanding performance!');
    'B', 'b' : writeln('Very good work!');
    'C', 'c' : writeln('Good job!');
  else
    writeln('Invalid grade');
  end;
end.
`,
      inputs: ['b'], answer: 'Very good work!', hints: ["'b' is listed next to 'B'."], explanation: "The branch `'B', 'b'` matches lowercase b.",
    },
    {
      id: 'case-3', topic: 'case', type: 'fill', difficulty: 'easy', skill: 'coding',
      objective: 'case syntax', prompt: 'Complete the case statement.',
      code: pas`
program Size;
var
  s : char;
begin
  s := 'M';
  [[0]] s [[1]]
    'S' : writeln('Small');
    'M' : writeln('Medium');
    'L' : writeln('Large');
  else
    writeln('Unknown');
  [[2]]
end.
`,
      blanks: [{ accept: ['case'], width: 5 }, { accept: ['of'], width: 3 }, { accept: ['end;'], width: 5 }],
      tests: [{ expect: ['Medium'] }],
      hints: ['case … ___', 'A case statement is closed with its own end.'], explanation: '`case s of … end;`',
    },
    {
      id: 'case-4', topic: 'case', type: 'mcq', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'When to use case', prompt: 'Which situation is **best** handled with a `case` statement?',
      options: ['Checking if marks are between 40 and 100', 'Choosing an action from a menu option 1, 2, 3 or 4', 'Checking if age >= 18 and has a licence', 'Comparing two real numbers'], answer: 1,
      why: ['Ranges with and are easier with if.', '', 'Combined conditions need if.', 'Case labels can\'t be real numbers.'],
      hints: ['Case compares one variable with fixed values.'], explanation: 'A menu compares one integer with a few fixed values — perfect for case.',
    },
    {
      id: 'case-5', topic: 'case', type: 'match', difficulty: 'practice', skill: 'concept',
      objective: 'Parts of a case', prompt: 'Match each part of a case statement with its job.', codeLeft: true,
      pairs: [['case choice of', 'Starts the case and names the variable'], ["1 : writeln('One');", 'Runs when choice is 1'], ["'A', 'a' :", 'Two labels sharing one branch'], ['else', 'Runs when no label matches'], ['end;', 'Closes the case statement']],
      hints: ['Think about the menu example.'], explanation: 'Each part has one job in the case statement.',
    },
    {
      id: 'case-6', topic: 'case', type: 'write', difficulty: 'challenge', skill: 'coding', exam: true,
      objective: 'Calculator with case', prompt: 'Read two integers and an operator character (`+`, `-`, `*`). Use `case` to print the result. For any other operator print `Unknown operator`.',
      starter: pas`
program MiniCalc;
var
  a, b : integer;
  op : char;
begin
  readln(a);
  readln(b);
  readln(op);

end.
`,
      tests: [{ inputs: ['6', '3', '+'], expect: ['9'] }, { inputs: ['6', '3', '-'], expect: ['3'] }, { inputs: ['6', '3', '*'], expect: ['18'] }, { inputs: ['6', '3', '/'], expect: ['Unknown operator'] }],
      requires: [{ pattern: '\\bcase\\b', message: 'Use a `case` statement for this task.' }],
      hints: ['case op of', "'+' : writeln(a + b);"],
      solution: pas`
program MiniCalc;
var
  a, b : integer;
  op : char;
begin
  readln(a);
  readln(b);
  readln(op);
  case op of
    '+' : writeln(a + b);
    '-' : writeln(a - b);
    '*' : writeln(a * b);
  else
    writeln('Unknown operator');
  end;
end.
`,
      explanation: 'Each operator character is a case label.',
    },
    {
      id: 'case-7', topic: 'case', type: 'spot', difficulty: 'practice', skill: 'coding',
      objective: 'case errors', prompt: 'Click the line with the mistake.',
      code: pas`
program Level;
var
  n : integer;
begin
  n := 2;
  case n of
    1 : writeln('Easy');
    2 : writeln('Medium');
    3 : writeln('Hard');
  else
    writeln('Unknown');
end.
`,
      lines: [11, 12], hints: ['How is a case statement closed?'], explanation: 'The case is missing its own `end;` before the program\'s `end.`',
    },
  ],
  boss: {
    id: 'boss-u4',
    unit: 'u4',
    title: 'The Report Card Machine',
    emoji: 'clipboard',
    story: 'Exam results are out and the teacher needs grades fast. Build the machine that checks marks, gives grades and prints comments.',
    stages: [
      {
        title: 'Validate the mark',
        prompt: 'Read a mark. If it is between 0 and 100 print `Valid`, otherwise print `Invalid mark`.',
        starter: pas`
program Validate;
var
  marks : integer;
begin

end.
`,
        tests: [{ inputs: ['55'], expect: ['Valid'], reject: ['Invalid'] }, { inputs: ['101'], expect: ['Invalid mark'] }, { inputs: ['-5'], expect: ['Invalid mark'] }, { inputs: ['0'], expect: ['Valid'], reject: ['Invalid'] }],
        hints: ['(marks >= 0) and (marks <= 100)'],
        solution: pas`
program Validate;
var
  marks : integer;
begin
  readln(marks);
  if (marks >= 0) and (marks <= 100) then
    writeln('Valid')
  else
    writeln('Invalid mark');
end.
`,
      },
      {
        title: 'Give the grade',
        prompt: 'Read a mark and store the grade letter in a `char` variable (A ≥ 75, B ≥ 65, C ≥ 55, S ≥ 40, else F). Then print `Grade: ` and the letter.',
        starter: pas`
program GiveGrade;
var
  marks : integer;
  grade : char;
begin

end.
`,
        tests: [{ inputs: ['82'], expect: ['Grade: A'] }, { inputs: ['66'], expect: ['Grade: B'] }, { inputs: ['55'], expect: ['Grade: C'] }, { inputs: ['41'], expect: ['Grade: S'] }, { inputs: ['12'], expect: ['Grade: F'] }],
        requires: [{ pattern: "grade\\s*:=\\s*'A'", message: "Store the grade in the variable: grade := 'A'" }],
        hints: ["if marks >= 75 then grade := 'A' else if …", "writeln('Grade: ', grade);"],
        solution: pas`
program GiveGrade;
var
  marks : integer;
  grade : char;
begin
  readln(marks);
  if marks >= 75 then
    grade := 'A'
  else if marks >= 65 then
    grade := 'B'
  else if marks >= 55 then
    grade := 'C'
  else if marks >= 40 then
    grade := 'S'
  else
    grade := 'F';
  writeln('Grade: ', grade);
end.
`,
      },
      {
        title: 'Add the comment',
        prompt: 'Read a grade letter (A, B, C, S or F) and use `case` to print the comment: A → `Excellent`, B → `Very good`, C → `Good`, S → `Satisfactory`, F → `Needs improvement`. Anything else → `Invalid grade`.',
        starter: pas`
program Comment;
var
  grade : char;
begin
  readln(grade);

end.
`,
        tests: [{ inputs: ['A'], expect: ['Excellent'] }, { inputs: ['S'], expect: ['Satisfactory'] }, { inputs: ['F'], expect: ['Needs improvement'] }, { inputs: ['X'], expect: ['Invalid grade'] }],
        requires: [{ pattern: '\\bcase\\b', message: 'Use a case statement.' }],
        hints: ["case grade of 'A' : writeln('Excellent'); …"],
        solution: pas`
program Comment;
var
  grade : char;
begin
  readln(grade);
  case grade of
    'A' : writeln('Excellent');
    'B' : writeln('Very good');
    'C' : writeln('Good');
    'S' : writeln('Satisfactory');
    'F' : writeln('Needs improvement');
  else
    writeln('Invalid grade');
  end;
end.
`,
      },
    ],
  },
};

export default mod;
