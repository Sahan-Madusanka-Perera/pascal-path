import type { UnitModule } from '../index';
import { pas } from '../util';

const mod: UnitModule = {
  unit: {
    id: 'u5',
    title: 'Loops',
    subtitle: 'for, while and repeat…until',
    hue: 'orange',
    icon: 'repeat',
    topics: ['for', 'while', 'repeat'],
    boss: 'boss-u5',
  },
  topics: [
    // ---------------------------------------------------------------- for
    {
      id: 'for',
      unit: 'u5',
      title: 'FOR Loops',
      short: 'Repeat a known number of times',
      source: 'Tute §9.1',
      minutes: 11,
      objectives: ['Write for…to and for…downto loops', 'Use begin…end to repeat several statements', 'Add up values with a total (accumulator)'],
      lesson: [
        {
          kind: 'concept',
          title: 'Repeat without copying',
          body: 'Loops let you repeat code without writing it again and again. Use a **for** loop when you know **exactly how many times** to repeat.',
          code: pas`
for i := 1 to 5 do
  writeln(i);
`,
          callout: { kind: 'tip', text: '`i` is the **loop counter**. Pascal sets it to 1, 2, 3, 4, 5 automatically.' },
        },
        {
          kind: 'watch',
          title: 'Watch the counter',
          body: 'Press **Play**. Watch `i` change each round, and the output grow.',
          code: pas`
program CountingUp;
var
  i : integer;
begin
  writeln('Counting from 1 to 5:');
  for i := 1 to 5 do
    writeln(i);
end.
`,
        },
        {
          kind: 'concept',
          title: 'Counting down',
          body: 'Use **downto** to count backwards:',
          code: pas`
for i := 5 downto 1 do
  writeln(i);
writeln('Blast off!');
`,
        },
        { kind: 'check', question: 'for-1' },
        {
          kind: 'concept',
          title: 'Several statements: begin…end',
          body: 'Like `if`, a loop repeats only **one** statement. Wrap several in `begin … end`. This program also keeps a **running total** — start it at 0 before the loop!',
          code: pas`
sum := 0;
for i := 1 to 5 do
begin
  write('Enter number ', i, ': ');
  readln(number);
  sum := sum + number;
end;
average := sum / 5;
`,
          callout: { kind: 'mistake', text: 'Forgetting `sum := 0;` before the loop is a classic exam mistake.' },
        },
        {
          kind: 'try',
          title: 'Multiplication table',
          body: 'Read a number and print its table from 1 to 10 in the form `7 x 1 = 7`.',
          starter: pas`
program Table;
var
  number, i : integer;
begin
  readln(number);

end.
`,
          tests: [{ inputs: ['7'], expect: ['7 x 1 = 7', '7 x 2 = 14', '7 x 10 = 70'] }, { inputs: ['3'], expect: ['3 x 1 = 3', '3 x 9 = 27', '3 x 10 = 30'] }],
          hints: ['for i := 1 to 10 do', "writeln(number, ' x ', i, ' = ', number * i);"],
          solution: pas`
program Table;
var
  number, i : integer;
begin
  readln(number);
  for i := 1 to 10 do
    writeln(number, ' x ', i, ' = ', number * i);
end.
`,
        },
        { kind: 'check', question: 'for-5' },
      ],
      revision: {
        what: 'A for loop repeats statements a fixed number of times, with a counter that goes up (`to`) or down (`downto`).',
        why: 'Printing tables, reading a fixed number of inputs and processing arrays all need counted repetition.',
        syntax: pas`
for i := 1 to 10 do
  statement;

for i := 10 downto 1 do
begin
  statement1;
  statement2;
end;
`,
        example: {
          code: pas`
program Sum;
var
  i, sum : integer;
begin
  sum := 0;
  for i := 1 to 5 do
    sum := sum + i;
  writeln(sum);
end.
`,
          output: '15',
        },
        mistakes: ['Not initialising totals: `sum := 0;`', 'Forgetting begin…end around several statements.', 'Changing the counter inside a for loop (not allowed).'],
        examPoints: ['Count the repetitions: `for i := 3 to 7` runs 5 times.', 'If the start is bigger than the end (with `to`), the loop runs 0 times.'],
        keyTerms: [
          { term: 'Iteration', def: 'One repetition (round) of a loop.' },
          { term: 'Loop counter', def: 'The variable a for loop changes each round.' },
          { term: 'Accumulator', def: 'A variable that collects a running total.' },
        ],
        mini: 'for-2',
      },
    },
    // ---------------------------------------------------------------- while
    {
      id: 'while',
      unit: 'u5',
      title: 'WHILE Loops',
      short: 'Repeat while a condition is TRUE',
      source: 'Tute §9.2',
      minutes: 10,
      objectives: ['Write a while loop', 'Make sure the loop can stop', 'Use while when the number of repetitions is unknown'],
      lesson: [
        {
          kind: 'concept',
          title: 'Repeat while it\'s TRUE',
          body: 'A **while** loop checks a condition **before** each round. It keeps going while the condition is TRUE. Use it when you **don\'t know** how many times to repeat.',
          code: pas`
count := 1;
while count <= 5 do
begin
  writeln('Count: ', count);
  count := count + 1;
end;
`,
        },
        {
          kind: 'watch',
          title: 'Watch the condition',
          body: 'Watch the condition get checked every round — and the final check that stops the loop.',
          code: pas`
program WhileExample;
var
  count : integer;
begin
  count := 1;
  while count <= 3 do
  begin
    writeln('Count: ', count);
    count := count + 1;
  end;
  writeln('Loop finished!');
end.
`,
        },
        {
          kind: 'concept',
          title: 'Danger: infinite loops',
          body: 'If nothing inside the loop changes the condition, it runs **forever**. Try running this — Pascal will stop it and explain what happened.',
          code: pas`
count := 1;
while count <= 5 do
  writeln(count);   { count never changes! }
`,
          callout: { kind: 'mistake', text: 'Always change the loop variable inside a while loop (e.g. `count := count + 1;`).' },
        },
        { kind: 'check', question: 'wh-2' },
        {
          kind: 'example',
          title: 'Password checker',
          body: 'This loop runs until the right password is typed. Try a wrong one first. (The password is `secret`.)',
          inputs: ['hello', 'secret'],
          code: pas`
program PasswordChecker;
var
  password : string;
begin
  password := '';
  while password <> 'secret' do
  begin
    write('Enter password: ');
    readln(password);
    if password <> 'secret' then
      writeln('Wrong password! Try again.');
  end;
  writeln('Access granted!');
end.
`,
        },
        {
          kind: 'try',
          title: 'Doubling',
          body: 'Start with `n := 1`. Keep doubling it **while it is less than 100**, printing each value. Output should be 1 2 4 8 16 32 64 on separate lines.',
          starter: pas`
program Doubling;
var
  n : integer;
begin
  n := 1;

end.
`,
          tests: [{ exact: '1\n2\n4\n8\n16\n32\n64' }],
          requires: [{ pattern: '\\bwhile\\b', message: 'Use a while loop.' }],
          hints: ['while n < 100 do', 'Inside: writeln(n); then n := n * 2; — wrapped in begin…end.'],
          solution: pas`
program Doubling;
var
  n : integer;
begin
  n := 1;
  while n < 100 do
  begin
    writeln(n);
    n := n * 2;
  end;
end.
`,
        },
      ],
      revision: {
        what: 'A while loop repeats while its condition is TRUE, checking the condition before each round.',
        why: 'Use it when the number of repetitions depends on data — like waiting for a correct password.',
        syntax: pas`
while condition do
begin
  statements;
  { change something so the condition becomes FALSE }
end;
`,
        mistakes: ['Infinite loop: the condition never becomes FALSE.', 'Forgetting begin…end so only one statement repeats.', 'Not giving the variable a value before the loop.'],
        examPoints: ['A while loop may run **zero** times if the condition is FALSE at the start.', 'The condition is checked at the TOP of the loop.'],
        keyTerms: [{ term: 'Pre-test loop', def: 'A loop that checks its condition before each round (while).' }, { term: 'Infinite loop', def: 'A loop whose condition never becomes false, so it never stops.' }],
        mini: 'wh-1',
      },
    },
    // ---------------------------------------------------------------- repeat
    {
      id: 'repeat',
      unit: 'u5',
      title: 'REPEAT…UNTIL',
      short: 'Run at least once, check at the end',
      source: 'Tute §9.3–9.4',
      minutes: 9,
      objectives: ['Write a repeat…until loop', 'Explain the difference between while and repeat', 'Use repeat for input validation'],
      lesson: [
        {
          kind: 'concept',
          title: 'Check at the end',
          body: '**repeat…until** runs the body first, **then** checks the condition. It stops when the condition becomes **TRUE**. So it always runs **at least once**.',
          code: pas`
repeat
  write('Enter a positive number: ');
  readln(number);
until number > 0;
`,
          callout: { kind: 'tip', text: 'No begin…end needed: everything between `repeat` and `until` is repeated.' },
        },
        {
          kind: 'example',
          title: 'Input validation',
          body: 'Try typing `-3` and `0` before a positive number.',
          inputs: ['-3', '0', '8'],
          code: pas`
program RepeatExample;
var
  number : integer;
begin
  repeat
    write('Enter a positive number: ');
    readln(number);
    if number <= 0 then
      writeln('Invalid! Must be positive.');
  until number > 0;
  writeln('You entered: ', number);
end.
`,
        },
        { kind: 'visual', title: 'while vs repeat', body: 'Same start value, two loops. Slide x to 10 and run both.', visual: 'while-vs-repeat' },
        { kind: 'visual', title: 'Which loop should I use?', visual: 'loop-kinds' },
        { kind: 'check', question: 'rp-3' },
        {
          kind: 'try',
          title: 'Countdown with repeat',
          body: 'Use `repeat…until` to print 3, 2, 1 on separate lines, then `Go!`.',
          starter: pas`
program Countdown;
var
  n : integer;
begin
  n := 3;

  writeln('Go!');
end.
`,
          tests: [{ exact: '3\n2\n1\nGo!' }],
          requires: [{ pattern: '\\brepeat\\b', message: 'Use a repeat…until loop.' }],
          hints: ['repeat writeln(n); n := n - 1; until …', 'Stop when n reaches 0: until n = 0;'],
          solution: pas`
program Countdown;
var
  n : integer;
begin
  n := 3;
  repeat
    writeln(n);
    n := n - 1;
  until n = 0;
  writeln('Go!');
end.
`,
        },
        { kind: 'check', question: 'rp-5' },
      ],
      revision: {
        what: 'repeat…until runs its body, then checks the condition, stopping when the condition is TRUE.',
        why: 'Perfect when something must happen at least once — like asking for input and checking it.',
        syntax: pas`
repeat
  statement1;
  statement2;
until condition;
`,
        mistakes: ['Writing the condition the wrong way round (repeat stops when TRUE; while continues when TRUE).', 'Adding begin…end unnecessarily is OK, but forgetting `until` is an error.'],
        examPoints: ['while: may run 0 times, condition at the top, loops while TRUE.', 'repeat: runs at least once, condition at the bottom, loops until TRUE.', 'for: known number of times.'],
        keyTerms: [{ term: 'Post-test loop', def: 'A loop that checks its condition after each round (repeat…until).' }, { term: 'Validation', def: 'Checking that input is sensible before using it.' }],
        mini: 'rp-1',
      },
    },
  ],
  questions: [
    // ---------- for
    {
      id: 'for-1', topic: 'for', type: 'output', difficulty: 'easy', skill: 'problem', exam: true,
      objective: 'Trace downto', prompt: 'What does this print?',
      code: pas`
program Countdown;
var
  i : integer;
begin
  for i := 3 downto 1 do
    writeln(i);
  writeln('Blast off!');
end.
`,
      answer: '3\n2\n1\nBlast off!', hints: ['downto counts backwards.'], explanation: 'i goes 3, 2, 1, then the loop ends and `Blast off!` prints once.',
    },
    {
      id: 'for-2', topic: 'for', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Count iterations', prompt: 'How many times does `for i := 3 to 7 do` repeat?', options: ['4', '5', '7', '3'], answer: 1,
      why: ['Remember to include both 3 and 7.', '', 'It starts at 3, not 1.', 'Count 3, 4, 5, 6, 7.'],
      hints: ['List the values of i.'], explanation: 'i = 3, 4, 5, 6, 7 → 5 times (7 − 3 + 1).',
    },
    {
      id: 'for-3', topic: 'for', type: 'output', difficulty: 'practice', skill: 'problem', exam: true,
      objective: 'Accumulator', prompt: 'What does this print?',
      code: pas`
program Total;
var
  i, total : integer;
begin
  total := 0;
  for i := 1 to 4 do
    total := total + i * 2;
  writeln(total);
end.
`,
      answer: '20', hints: ['Add 2, 4, 6 and 8.'], explanation: '2 + 4 + 6 + 8 = 20.',
    },
    {
      id: 'for-4', topic: 'for', type: 'trace', difficulty: 'practice', skill: 'problem', exam: true,
      objective: 'Trace a for loop', prompt: 'Fill in `i` and `sum` at the end of each round.',
      code: pas`
sum := 0;
for i := 1 to 4 do
  sum := sum + i;
`,
      columns: ['i', 'sum'], rowLabel: 'Round', rows: [['1', '1'], ['2', '3'], ['3', '6'], ['4', '10']],
      hints: ['Each round, sum gets bigger by i.'], explanation: 'sum: 1, 3, 6, 10.',
    },
    {
      id: 'for-5', topic: 'for', type: 'fix', difficulty: 'practice', skill: 'coding', exam: true,
      objective: 'Fix a summing loop', prompt: 'This should read 5 numbers and print their sum. Fix it.',
      code: pas`
program SumFive;
var
  i, number, sum : integer;
begin
  for i := 1 to 5 do
    readln(number);
    sum := sum + number;
  writeln('Sum: ', sum);
end.
`,
      tests: [{ inputs: ['1', '2', '3', '4', '5'], expect: ['Sum: 15'] }, { inputs: ['10', '10', '10', '10', '0'], expect: ['Sum: 40'] }],
      hints: ['Which statements should be repeated?', 'Two statements in the loop need begin…end.', 'Start the total at 0.'],
      solution: pas`
program SumFive;
var
  i, number, sum : integer;
begin
  sum := 0;
  for i := 1 to 5 do
  begin
    readln(number);
    sum := sum + number;
  end;
  writeln('Sum: ', sum);
end.
`,
      explanation: 'Wrap both statements in begin…end and initialise `sum := 0`.',
    },
    {
      id: 'for-6', topic: 'for', type: 'write', difficulty: 'easy', skill: 'coding',
      objective: 'Simple for loop', prompt: 'Print your name 10 times. (Use any name, but print it with `writeln` inside a for loop.)',
      starter: pas`
program TenTimes;
var
  i : integer;
begin

end.
`,
      tests: [{}],
      requires: [{ pattern: 'for\\s+\\w+\\s*:=\\s*1\\s+to\\s+10', message: 'Use a for loop from 1 to 10.' }],
      hints: ['for i := 1 to 10 do', "  writeln('Kamal');"],
      solution: pas`
program TenTimes;
var
  i : integer;
begin
  for i := 1 to 10 do
    writeln('Kamal');
end.
`,
      explanation: 'A for loop from 1 to 10 repeats the writeln 10 times.',
    },
    {
      id: 'for-7', topic: 'for', type: 'write', difficulty: 'practice', skill: 'coding', exam: true,
      objective: 'Sum and average', prompt: 'Read **5** numbers and print `Sum: ` and `Average: ` (2 decimal places).',
      starter: pas`
program SumAvg;
var
  i, number, sum : integer;
  average : real;
begin

end.
`,
      tests: [{ inputs: ['10', '20', '30', '40', '50'], expect: ['Sum: 150', 'Average: 30.00'] }, { inputs: ['1', '2', '3', '4', '6'], expect: ['Sum: 16', 'Average: 3.20'] }],
      hints: ['sum := 0 before the loop.', 'Inside the loop: readln(number); sum := sum + number;', 'After the loop: average := sum / 5;'],
      solution: pas`
program SumAvg;
var
  i, number, sum : integer;
  average : real;
begin
  sum := 0;
  for i := 1 to 5 do
  begin
    readln(number);
    sum := sum + number;
  end;
  average := sum / 5;
  writeln('Sum: ', sum);
  writeln('Average: ', average:0:2);
end.
`,
      explanation: 'Accumulate the total inside the loop, divide after it.',
    },
    {
      id: 'for-8', topic: 'for', type: 'write', difficulty: 'challenge', skill: 'problem', exam: true,
      objective: 'Factorial', prompt: 'Read n and print `n! = ` followed by the factorial (1 × 2 × … × n). (5 → `5! = 120`)',
      starter: pas`
program Factorial;
var
  n, i, f : integer;
begin

end.
`,
      tests: [{ inputs: ['5'], expect: ['5! = 120'] }, { inputs: ['1'], expect: ['1! = 1'] }, { inputs: ['7'], expect: ['7! = 5040'] }],
      hints: ['Start f at 1 (not 0) because you multiply.', 'for i := 1 to n do f := f * i;'],
      solution: pas`
program Factorial;
var
  n, i, f : integer;
begin
  readln(n);
  f := 1;
  for i := 1 to n do
    f := f * i;
  writeln(n, '! = ', f);
end.
`,
      explanation: 'A product starts at 1 and multiplies by each i.',
    },
    {
      id: 'for-9', topic: 'for', type: 'arrange', difficulty: 'practice', skill: 'coding',
      objective: 'Order loop code', prompt: 'Arrange the lines to print the even numbers 2, 4, 6, 8, 10.',
      fixedTop: ['program Evens;', 'var i : integer;', 'begin'], fixedBottom: ['end.'],
      lines: ['  for i := 1 to 5 do', '    writeln(i * 2);'], distractors: ['    writeln(i + 2);'],
      tests: [{ exact: '2\n4\n6\n8\n10' }],
      hints: ['i goes 1..5 — what calculation turns that into 2..10?'], explanation: 'i × 2 gives 2, 4, 6, 8, 10.',
    },
    // ---------- while
    {
      id: 'wh-1', topic: 'while', type: 'output', difficulty: 'easy', skill: 'problem', exam: true,
      objective: 'Trace a while loop', prompt: 'What does this print?',
      code: pas`
program WhileDemo;
var
  count : integer;
begin
  count := 1;
  while count <= 3 do
  begin
    writeln('Count: ', count);
    count := count + 1;
  end;
  writeln('Loop finished!');
end.
`,
      answer: 'Count: 1\nCount: 2\nCount: 3\nLoop finished!', hints: ['The loop stops when count becomes 4.'], explanation: 'It prints 1, 2, 3, then the condition 4 <= 3 is FALSE.',
    },
    {
      id: 'wh-2', topic: 'while', type: 'spot', difficulty: 'practice', skill: 'coding', exam: true,
      objective: 'Infinite loop', prompt: 'This loop never stops. Click the line that should change but doesn\'t (or is missing a change).',
      code: pas`
program Forever;
var
  n : integer;
begin
  n := 10;
  while n > 0 do
  begin
    writeln(n);
    n := n + 1;
  end;
end.
`,
      lines: [9], hints: ['Will n ever be 0 or less?'], explanation: 'n goes up instead of down, so `n > 0` stays TRUE forever. It should be `n := n - 1;`.',
    },
    {
      id: 'wh-3', topic: 'while', type: 'output', difficulty: 'practice', skill: 'problem', exam: true,
      objective: 'Zero iterations', prompt: 'What does this print?',
      code: pas`
program Zero;
var
  x : integer;
begin
  x := 10;
  while x < 5 do
  begin
    writeln(x);
    x := x + 1;
  end;
  writeln('End');
end.
`,
      answer: 'End', hints: ['Check the condition before the first round.'], explanation: '10 < 5 is FALSE immediately, so the loop body never runs.',
    },
    {
      id: 'wh-4', topic: 'while', type: 'trace', difficulty: 'practice', skill: 'problem',
      objective: 'Trace while', prompt: 'Trace `n` and `steps` after each round.',
      code: pas`
n := 20;
steps := 0;
while n > 1 do
begin
  n := n div 2;
  steps := steps + 1;
end;
`,
      columns: ['n', 'steps'], rowLabel: 'Round', rows: [['10', '1'], ['5', '2'], ['2', '3'], ['1', '4']],
      hints: ['5 div 2 = 2.'], explanation: '20→10→5→2→1, taking 4 steps.',
    },
    {
      id: 'wh-5', topic: 'while', type: 'fix', difficulty: 'practice', skill: 'coding',
      objective: 'Fix a while loop', prompt: 'This should print 1 to 5 but it runs forever. Fix it.',
      code: pas`
program OneToFive;
var
  count : integer;
begin
  count := 1;
  while count <= 5 do
    writeln(count);
    count := count + 1;
end.
`,
      tests: [{ exact: '1\n2\n3\n4\n5' }],
      hints: ['Which statements are inside the loop right now?', 'Use begin…end.'],
      solution: pas`
program OneToFive;
var
  count : integer;
begin
  count := 1;
  while count <= 5 do
  begin
    writeln(count);
    count := count + 1;
  end;
end.
`,
      explanation: 'Without begin…end, only writeln repeats; count never changes.',
    },
    {
      id: 'wh-6', topic: 'while', type: 'write', difficulty: 'challenge', skill: 'problem', exam: true,
      objective: 'Reverse a number', prompt: 'Read a positive number and print its digits in reverse order as one number. (1234 → `4321`)',
      starter: pas`
program Reverse;
var
  n, rev : integer;
begin

end.
`,
      tests: [{ inputs: ['1234'], expect: ['4321'] }, { inputs: ['907'], expect: ['709'] }, { inputs: ['5'], expect: ['5'] }],
      requires: [{ pattern: '\\bwhile\\b', message: 'Use a while loop.' }],
      hints: ['rev := 0 to start.', 'Each round: rev := rev * 10 + n mod 10; n := n div 10;', 'Loop while n > 0.'],
      solution: pas`
program Reverse;
var
  n, rev : integer;
begin
  readln(n);
  rev := 0;
  while n > 0 do
  begin
    rev := rev * 10 + n mod 10;
    n := n div 10;
  end;
  writeln(rev);
end.
`,
      explanation: 'Take the last digit with mod, add it to rev, and remove it with div until n is 0.',
    },
    {
      id: 'wh-7', topic: 'while', type: 'write', difficulty: 'challenge', skill: 'problem',
      objective: 'Sum until zero', prompt: 'Keep reading numbers until the user types `0`, then print `Total: ` and the sum of the numbers.',
      starter: pas`
program SumUntilZero;
var
  n, total : integer;
begin

end.
`,
      tests: [{ inputs: ['5', '10', '3', '0'], expect: ['Total: 18'] }, { inputs: ['0'], expect: ['Total: 0'] }],
      hints: ['Read the first number before the loop.', 'while n <> 0 do begin total := total + n; readln(n); end;'],
      solution: pas`
program SumUntilZero;
var
  n, total : integer;
begin
  total := 0;
  readln(n);
  while n <> 0 do
  begin
    total := total + n;
    readln(n);
  end;
  writeln('Total: ', total);
end.
`,
      explanation: 'Read once before the loop, then read again at the end of each round.',
    },
    {
      id: 'wh-8', topic: 'while', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'When to use while', prompt: 'When is a `while` loop a better choice than a `for` loop?',
      options: ['When you know exactly how many times to repeat', 'When you don\'t know in advance how many times to repeat', 'When you want to count down', 'Never — they are identical'], answer: 1,
      why: ['That\'s a for loop.', '', 'for…downto counts down.', 'They are used in different situations.'],
      hints: ['Think of the password checker.'], explanation: 'while repeats until a condition changes — the number of rounds isn\'t known in advance.',
    },
    // ---------- repeat
    {
      id: 'rp-1', topic: 'repeat', type: 'output', difficulty: 'easy', skill: 'problem', exam: true,
      objective: 'Runs at least once', prompt: 'What does this print?',
      code: pas`
program AtLeastOnce;
var
  x : integer;
begin
  x := 10;
  repeat
    writeln(x);
    x := x + 1;
  until x > 5;
end.
`,
      answer: '10', hints: ['The body runs before the condition is checked.'], explanation: 'It prints 10, then x = 11 > 5 is TRUE so it stops.',
    },
    {
      id: 'rp-2', topic: 'repeat', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'repeat stops when TRUE', prompt: 'A `repeat…until` loop stops when its condition is…', options: ['TRUE', 'FALSE'], answer: 0,
      why: ['', 'That is how while works (it continues while TRUE).'], hints: ['"Repeat UNTIL this happens."'], explanation: 'repeat…until keeps going until the condition becomes TRUE.',
    },
    {
      id: 'rp-3', topic: 'repeat', type: 'match', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'Compare loops', prompt: 'Match each loop with its description.', codeLeft: true,
      pairs: [['for', 'Repeats a known number of times'], ['while', 'Checks the condition BEFORE each round'], ['repeat…until', 'Always runs at least once'], ['until x > 5', 'Stops when the condition becomes TRUE']],
      hints: ['Think about where the condition is checked.'], explanation: 'for: counted; while: pre-test; repeat: post-test (at least once).',
    },
    {
      id: 'rp-4', topic: 'repeat', type: 'output', difficulty: 'practice', skill: 'problem', exam: true,
      objective: 'Trace repeat with input', prompt: 'The user types `-2`, then `0`, then `6`. What is printed?',
      code: pas`
program Positive;
var
  number : integer;
begin
  repeat
    readln(number);
    if number <= 0 then
      writeln('Invalid!');
  until number > 0;
  writeln('You entered: ', number);
end.
`,
      inputs: ['-2', '0', '6'], answer: 'Invalid!\nInvalid!\nYou entered: 6', hints: ['-2 and 0 are not positive.'], explanation: 'Two invalid inputs, then 6 ends the loop.',
    },
    {
      id: 'rp-5', topic: 'repeat', type: 'write', difficulty: 'practice', skill: 'coding', exam: true,
      objective: 'Validation with repeat', prompt: 'Keep reading a mark until it is between 0 and 100, printing `Try again` for invalid marks. Then print `Mark: ` and the mark.',
      starter: pas`
program ValidMark;
var
  mark : integer;
begin

end.
`,
      tests: [{ inputs: ['150', '-1', '72'], expect: ['Try again', 'Try again', 'Mark: 72'] }, { inputs: ['50'], expect: ['Mark: 50'], reject: ['Try again'] }],
      requires: [{ pattern: '\\brepeat\\b', message: 'Use a repeat…until loop.' }],
      hints: ['repeat readln(mark); … until (mark >= 0) and (mark <= 100);', "Inside: if the mark is invalid, writeln('Try again');"],
      solution: pas`
program ValidMark;
var
  mark : integer;
begin
  repeat
    readln(mark);
    if (mark < 0) or (mark > 100) then
      writeln('Try again');
  until (mark >= 0) and (mark <= 100);
  writeln('Mark: ', mark);
end.
`,
      explanation: 'repeat runs at least once, so you always read a mark before checking it.',
    },
    {
      id: 'rp-6', topic: 'repeat', type: 'fill', difficulty: 'easy', skill: 'coding',
      objective: 'repeat syntax', prompt: 'Complete the loop that prints 1 to 5.',
      code: pas`
program Five;
var
  i : integer;
begin
  i := 1;
  [[0]]
    writeln(i);
    i := i + 1;
  [[1]] i > 5;
end.
`,
      blanks: [{ accept: ['repeat'], width: 7 }, { accept: ['until'], width: 6 }], tests: [{ exact: '1\n2\n3\n4\n5' }],
      hints: ['The loop that checks at the end.'], explanation: '`repeat … until i > 5;`',
    },
    {
      id: 'rp-7', topic: 'repeat', type: 'write', difficulty: 'challenge', skill: 'problem', exam: true,
      objective: 'Guessing game', prompt: 'The secret number is **42**. Keep reading guesses, printing `Too low`, `Too high` or `Correct!`. When correct, also print `Attempts: ` and the number of guesses.',
      starter: pas`
program Guess;
var
  guess, attempts : integer;
begin

end.
`,
      tests: [{ inputs: ['50', '30', '42'], expect: ['Too high', 'Too low', 'Correct!', 'Attempts: 3'] }, { inputs: ['42'], expect: ['Correct!', 'Attempts: 1'] }],
      hints: ['attempts := 0 before the loop; add 1 each round.', 'repeat … until guess = 42;'],
      solution: pas`
program Guess;
var
  guess, attempts : integer;
begin
  attempts := 0;
  repeat
    readln(guess);
    attempts := attempts + 1;
    if guess < 42 then
      writeln('Too low')
    else if guess > 42 then
      writeln('Too high')
    else
      writeln('Correct!');
  until guess = 42;
  writeln('Attempts: ', attempts);
end.
`,
      explanation: 'Count attempts inside the loop and stop when the guess is right.',
    },
    {
      id: 'rp-8', topic: 'repeat', type: 'mcq', difficulty: 'challenge', skill: 'concept', exam: true,
      objective: 'Convert while to repeat', prompt: 'Which `repeat` loop prints the same as `x := 1; while x <= 3 do begin writeln(x); x := x + 1; end;`?', codeOptions: true,
      options: ['x := 1;\nrepeat\n  writeln(x);\n  x := x + 1;\nuntil x <= 3;', 'x := 1;\nrepeat\n  writeln(x);\n  x := x + 1;\nuntil x > 3;', 'x := 1;\nrepeat\n  x := x + 1;\n  writeln(x);\nuntil x > 3;', 'x := 0;\nrepeat\n  writeln(x);\nuntil x > 3;'], answer: 1,
      why: ['until x <= 3 is TRUE after the first round, so it stops after printing 1.', '', 'This prints 2, 3, 4.', 'x never changes — infinite loop.'],
      hints: ['repeat stops when the condition is TRUE — the opposite of while.'], explanation: 'The until condition is the opposite of the while condition: `x > 3`.',
    },
  ],
  boss: {
    id: 'boss-u5',
    unit: 'u5',
    title: 'The Number Cruncher',
    emoji: 'bot',
    story: 'A robot guards the maths lab and only opens the door for programmers who can tame loops. Defeat it in three rounds.',
    stages: [
      {
        title: 'Countdown sequence',
        prompt: 'Read n and print the numbers from n down to 1 on **one line** separated by spaces, then `Liftoff!` on the next line. (3 → `3 2 1 ` then `Liftoff!`)',
        starter: pas`
program Liftoff;
var
  n, i : integer;
begin

end.
`,
        tests: [{ inputs: ['3'], expect: ['3 2 1', 'Liftoff!'] }, { inputs: ['5'], expect: ['5 4 3 2 1', 'Liftoff!'] }],
        hints: ['for i := n downto 1 do', "write(i, ' ');", 'Then writeln; and writeln(\'Liftoff!\');'],
        solution: pas`
program Liftoff;
var
  n, i : integer;
begin
  readln(n);
  for i := n downto 1 do
    write(i, ' ');
  writeln;
  writeln('Liftoff!');
end.
`,
      },
      {
        title: 'Count the evens',
        prompt: 'Read 6 numbers. Print `Evens: ` and how many of them are even.',
        starter: pas`
program CountEvens;
var
  i, n, evens : integer;
begin

end.
`,
        tests: [{ inputs: ['1', '2', '3', '4', '5', '6'], expect: ['Evens: 3'] }, { inputs: ['8', '10', '12', '7', '9', '0'], expect: ['Evens: 4'] }],
        hints: ['evens := 0 before the loop.', 'if n mod 2 = 0 then evens := evens + 1;'],
        solution: pas`
program CountEvens;
var
  i, n, evens : integer;
begin
  evens := 0;
  for i := 1 to 6 do
  begin
    readln(n);
    if n mod 2 = 0 then
      evens := evens + 1;
  end;
  writeln('Evens: ', evens);
end.
`,
      },
      {
        title: 'Is it prime?',
        prompt: 'Read a number greater than 1 and print `Prime` or `Not prime`. (A prime number has no divisors other than 1 and itself.)',
        starter: pas`
program PrimeCheck;
var
  n, d : integer;
  isPrime : boolean;
begin

end.
`,
        tests: [{ inputs: ['7'], expect: ['Prime'], reject: ['Not'] }, { inputs: ['9'], expect: ['Not prime'] }, { inputs: ['2'], expect: ['Prime'], reject: ['Not'] }, { inputs: ['97'], expect: ['Prime'], reject: ['Not'] }],
        hints: ['Start with isPrime := true.', 'Try every d from 2 to n - 1: if n mod d = 0 then isPrime := false;'],
        solution: pas`
program PrimeCheck;
var
  n, d : integer;
  isPrime : boolean;
begin
  readln(n);
  isPrime := true;
  for d := 2 to n - 1 do
    if n mod d = 0 then
      isPrime := false;
  if isPrime then
    writeln('Prime')
  else
    writeln('Not prime');
end.
`,
      },
    ],
  },
};

export default mod;
