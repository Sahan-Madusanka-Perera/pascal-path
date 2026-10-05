import type { UnitModule } from '../index';
import { pas } from '../util';

const mod: UnitModule = {
  unit: {
    id: 'u7',
    title: 'Arrays',
    subtitle: 'Many values under one name',
    hue: 'green',
    icon: 'train',
    topics: ['arrays', 'arrayloops'],
    boss: 'boss-u7',
  },
  topics: [
    // ---------------------------------------------------------------- arrays
    {
      id: 'arrays',
      unit: 'u7',
      title: 'Array Basics',
      short: 'Declare arrays and use indexes',
      source: 'Tute §15.1–15.5',
      minutes: 10,
      objectives: ['Explain why arrays are used', 'Declare a one-dimensional array', 'Store and read elements using an index'],
      lesson: [
        {
          kind: 'concept',
          title: 'Too many variables!',
          body: `To store the marks of 35 students you could write \`m1, m2, m3, … m35\` — but that's impractical.

An **array** stores many values of the **same type** under **one name**. Each value (element) is found by its **index** (position number).`,
        },
        { kind: 'visual', title: 'The array train', body: 'The train is the array, each cart is an element, and the cart number is the index. Type an index to access an element.', visual: 'array-train' },
        {
          kind: 'concept',
          title: 'Declaring an array',
          body: 'The syntax is `arrayName : array[firstIndex..lastIndex] of dataType;`',
          code: pas`
var
  marks : array[0..9] of integer;   { 10 elements: marks[0] .. marks[9] }
  ages  : array[1..20] of integer;  { 20 elements: ages[1] .. ages[20] }
`,
          callout: { kind: 'mistake', text: '`marks ( array[0..9] of integer;` is wrong. Use a colon: `marks : array[0..9] of integer;`' },
        },
        {
          kind: 'watch',
          title: 'Filling an array',
          body: 'Watch each element of `num` get its value. Notice elements can be used in calculations, like normal variables.',
          code: pas`
program ArrayAssignDemo;
var
  num : array[0..4] of integer;
begin
  num[0] := 45;
  num[2] := 36;
  num[4] := 60;
  num[1] := num[4] + 15;
  num[3] := num[0] + num[2];
  writeln(num[1], ' ', num[3]);
end.
`,
        },
        { kind: 'check', question: 'arr-2' },
        {
          kind: 'concept',
          title: 'Important facts about arrays',
          body: `- Elements are stored **next to each other** (sequentially)
- All elements have the **same data type**
- You can access **any** element directly: \`marks[7]\` (random access)
- \`array[0..4]\` and \`array[1..5]\` both have **5** elements — only the indexes differ
- Arrays work perfectly with **loops**`,
          callout: { kind: 'exam', text: 'Size of an array = last index − first index + 1.' },
        },
        {
          kind: 'try',
          title: 'Store three prices',
          body: 'Declare an array `prices` with indexes 1 to 3 of type `real`. Store 150.5, 80 and 220.25, then print `Total: 450.75` (2 decimal places).',
          starter: pas`
program Prices;
var

begin

end.
`,
          tests: [{ expect: ['Total: 450.75'] }],
          requires: [{ pattern: 'array\\s*\\[\\s*1\\s*\\.\\.\\s*3\\s*\\]\\s*of\\s+real', message: 'Declare prices : array[1..3] of real;' }],
          hints: ['prices : array[1..3] of real;', 'prices[1] := 150.5; …', "writeln('Total: ', prices[1] + prices[2] + prices[3]:0:2);"],
          solution: pas`
program Prices;
var
  prices : array[1..3] of real;
begin
  prices[1] := 150.5;
  prices[2] := 80;
  prices[3] := 220.25;
  writeln('Total: ', prices[1] + prices[2] + prices[3]:0:2);
end.
`,
        },
        { kind: 'check', question: 'arr-5' },
      ],
      revision: {
        what: 'An array is a collection of elements of the same data type, stored under one identifier and accessed by index.',
        why: 'It replaces many separate variables, keeps code short, and works with loops.',
        syntax: pas`
var
  marks : array[0..9] of integer;
begin
  marks[0] := 45;
  writeln(marks[0]);
end.
`,
        mistakes: ['Wrong declaration syntax (missing colon or `of`).', 'Using an index outside the range → runtime error.', 'Confusing the index (position) with the value stored there.'],
        examPoints: ['Number of elements = last index − first index + 1.', 'All elements share one data type.', 'Elements are accessed directly using an index (random access).'],
        keyTerms: [
          { term: 'Array', def: 'A collection of same-type values under one name.' },
          { term: 'Element', def: 'One value stored in an array.' },
          { term: 'Index', def: 'The position number used to access an element, written in [ ].' },
        ],
        mini: 'arr-1',
      },
    },
    // ---------------------------------------------------------------- arrayloops
    {
      id: 'arrayloops',
      unit: 'u7',
      title: 'Arrays with Loops',
      short: 'Input, print, total, maximum',
      source: 'Tute §15.5–15.6',
      minutes: 12,
      objectives: ['Read and print arrays with for loops', 'Find the total, average and maximum', 'Print an array in reverse'],
      lesson: [
        {
          kind: 'concept',
          title: 'Loops + arrays = power',
          body: 'Use the loop counter as the index. One short loop can process any number of elements:',
          code: pas`
for i := 0 to 4 do
  readln(num[i]);       { input every element }

for i := 0 to 4 do
  writeln(num[i]);      { print every element }
`,
        },
        {
          kind: 'watch',
          title: 'Finding the maximum',
          body: 'Start by assuming the first element is the biggest, then compare it with every other element.',
          code: pas`
program FindMax;
var
  marks : array[0..4] of integer;
  i, max : integer;
begin
  marks[0] := 45; marks[1] := 75; marks[2] := 36; marks[3] := 81; marks[4] := 60;
  max := marks[0];
  for i := 1 to 4 do
    if marks[i] > max then
      max := marks[i];
  writeln('Maximum = ', max);
end.
`,
        },
        { kind: 'check', question: 'al-2' },
        {
          kind: 'example',
          title: 'ICT marks: max and average',
          body: 'A classic exam program (5 students here instead of 35). Notice `i + 1` for the student number, because the index starts at 0.',
          inputs: ['45', '75', '36', '81', '60'],
          code: pas`
program ICTMarks;
var
  marks : array[0..4] of integer;
  i, tot, max : integer;
  avg : real;
begin
  tot := 0;
  for i := 0 to 4 do
  begin
    write('Enter marks of student ', i + 1, ': ');
    readln(marks[i]);
    tot := tot + marks[i];
  end;
  avg := tot / 5;
  max := marks[0];
  for i := 1 to 4 do
    if marks[i] > max then
      max := marks[i];
  writeln;
  writeln('Maximum marks = ', max);
  writeln('Average marks = ', avg:0:2);
end.
`,
        },
        {
          kind: 'try',
          title: 'Reverse order',
          body: 'Read **5** numbers into an array, then print them in **reverse** order (one per line).',
          starter: pas`
program Reverse;
var
  nums : array[1..5] of integer;
  i : integer;
begin

end.
`,
          tests: [{ inputs: ['1', '2', '3', '4', '5'], exact: '5\n4\n3\n2\n1' }, { inputs: ['9', '8', '7', '6', '0'], exact: '0\n6\n7\n8\n9' }],
          hints: ['First loop: for i := 1 to 5 do readln(nums[i]);', 'Second loop: for i := 5 downto 1 do writeln(nums[i]);'],
          solution: pas`
program Reverse;
var
  nums : array[1..5] of integer;
  i : integer;
begin
  for i := 1 to 5 do
    readln(nums[i]);
  for i := 5 downto 1 do
    writeln(nums[i]);
end.
`,
        },
        { kind: 'check', question: 'al-6' },
      ],
      revision: {
        what: 'Loops use their counter as the array index to input, output and process every element.',
        why: 'With arrays and loops, the same short code handles 5 or 500 values.',
        syntax: pas`
total := 0;
for i := 1 to n do
begin
  readln(a[i]);
  total := total + a[i];
end;
max := a[1];
for i := 2 to n do
  if a[i] > max then max := a[i];
`,
        mistakes: ['Loop range doesn\'t match the array range → index out of range.', 'Starting max at 0 (fails if all values are negative) — start with the first element.', 'Printing student numbers from 0 when the index starts at 0 (use i + 1).'],
        examPoints: ['Know the max/min/total/average patterns by heart.', 'Reverse printing uses downto.'],
        keyTerms: [{ term: 'Traversal', def: 'Visiting every element of an array, usually with a loop.' }],
        mini: 'al-1',
      },
    },
  ],
  questions: [
    // ---------- arrays
    {
      id: 'arr-1', topic: 'arrays', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Array declaration', prompt: 'Which is the correct way to declare an array of 10 integers?', codeOptions: true,
      options: ['marks : array[0..9] of integer;', 'marks ( array[0..9] of integer;', 'marks : integer[10];', 'array marks[0..9] : integer;'], answer: 0,
      why: ['', 'There must be a colon after the name.', 'That isn\'t Pascal syntax.', 'The name comes first, then : array[…] of type.'],
      hints: ['name : array[first..last] of type;'], explanation: '`marks : array[0..9] of integer;` creates marks[0] to marks[9].',
    },
    {
      id: 'arr-2', topic: 'arrays', type: 'output', difficulty: 'easy', skill: 'problem', exam: true,
      objective: 'Access elements', prompt: 'What does this print?',
      code: pas`
program Elements;
var
  num : array[0..4] of integer;
begin
  num[0] := 45;
  num[2] := 36;
  num[4] := 60;
  num[1] := num[4] + 15;
  num[3] := num[0] + num[2];
  writeln(num[1]);
  writeln(num[3]);
end.
`,
      answer: '75\n81', hints: ['num[4] is 60.', 'num[0] + num[2] = 45 + 36.'], explanation: 'num[1] = 60 + 15 = 75; num[3] = 45 + 36 = 81.',
    },
    {
      id: 'arr-3', topic: 'arrays', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Array size', prompt: 'How many elements does `A : array[1..5] of integer;` have?', options: ['4', '5', '6', '1'], answer: 1,
      why: ['Include both 1 and 5.', '', 'Count 1, 2, 3, 4, 5.', '1 is just the first index.'],
      hints: ['last − first + 1'], explanation: '5 − 1 + 1 = 5 elements.',
    },
    {
      id: 'arr-4', topic: 'arrays', type: 'categorize', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'Array properties', prompt: 'Which statements about arrays are TRUE and which are FALSE?', categories: ['TRUE', 'FALSE'],
      items: [
        { text: 'All elements have the same data type', category: 0 },
        { text: 'Elements are accessed using an index', category: 0 },
        { text: 'An array can mix integers and strings', category: 1 },
        { text: '`array[0..4]` and `array[1..5]` have the same number of elements', category: 0 },
        { text: 'You must read the elements in order — no random access', category: 1 },
      ],
      hints: ['Think about the train: same carts, numbered, any cart can be visited.'], explanation: 'Arrays hold one data type, use indexes, and allow direct (random) access.',
    },
    {
      id: 'arr-5', topic: 'arrays', type: 'spot', difficulty: 'practice', skill: 'coding', exam: true,
      objective: 'Index out of range', prompt: 'This program crashes while running. Click the line that causes it.',
      code: pas`
program Crash;
var
  scores : array[1..3] of integer;
begin
  scores[1] := 10;
  scores[2] := 20;
  scores[3] := 30;
  scores[4] := 40;
  writeln(scores[1]);
end.
`,
      lines: [8], hints: ['What indexes does this array have?'], explanation: 'The array only has indexes 1..3, so `scores[4]` is out of range.',
    },
    {
      id: 'arr-6', topic: 'arrays', type: 'fill', difficulty: 'easy', skill: 'coding', exam: true,
      objective: 'Write a declaration', prompt: 'Declare an integer array `ages` for 20 students using indexes 1 to 20.',
      code: pas`
program Ages;
var
  ages : array[[[0]]] of [[1]];
begin
  ages[1] := 16;
  writeln(ages[1]);
end.
`,
      blanks: [{ accept: ['1..20'], width: 6 }, { accept: ['integer'], width: 8 }], tests: [{ expect: ['16'] }],
      hints: ['first..last', 'Ages are whole numbers.'], explanation: '`ages : array[1..20] of integer;`',
    },
    {
      id: 'arr-7', topic: 'arrays', type: 'trace', difficulty: 'practice', skill: 'problem',
      objective: 'Trace array contents', prompt: 'Fill in each element\'s final value.',
      code: pas`
a[1] := 5;
a[2] := a[1] * 2;
a[3] := a[2] - a[1];
a[1] := a[3] + 1;
`,
      columns: ['a[1]', 'a[2]', 'a[3]'], rowLabel: 'End', rows: [['6', '10', '5']],
      hints: ['a[1] changes again on the last line.'], explanation: 'a[2] = 10, a[3] = 5, then a[1] = 6.',
    },
    {
      id: 'arr-8', topic: 'arrays', type: 'fix', difficulty: 'challenge', skill: 'coding',
      objective: 'Fix array code', prompt: 'Fix this program so it stores 3 names and prints the second one.',
      code: pas`
program Names;
var
  names ( array[1..3] of string;
begin
  names[1] := 'Kamal';
  names[2] := 'Nimali';
  names[3] := 'Sunil';
  writeln(names[2);
end.
`,
      tests: [{ exact: 'Nimali' }],
      hints: ['Check the declaration syntax.', 'Every [ needs a ].'],
      solution: pas`
program Names;
var
  names : array[1..3] of string;
begin
  names[1] := 'Kamal';
  names[2] := 'Nimali';
  names[3] := 'Sunil';
  writeln(names[2]);
end.
`,
      explanation: 'Use `:` in the declaration and close the bracket: `names[2]`.',
    },
    // ---------- arrayloops
    {
      id: 'al-1', topic: 'arrayloops', type: 'output', difficulty: 'easy', skill: 'problem', exam: true,
      objective: 'Print a range', prompt: 'What does this print?',
      code: pas`
program PrintSome;
var
  num : array[0..4] of integer;
  x : integer;
begin
  num[0] := 45; num[1] := 75; num[2] := 36; num[3] := 81; num[4] := 60;
  for x := 2 to 4 do
    writeln(num[x]);
end.
`,
      answer: '36\n81\n60', hints: ['x goes 2, 3, 4.'], explanation: 'It prints num[2], num[3] and num[4].',
    },
    {
      id: 'al-2', topic: 'arrayloops', type: 'arrange', difficulty: 'practice', skill: 'coding', exam: true,
      objective: 'Find maximum', prompt: 'Arrange the lines to find the maximum of the array `a` (indexes 1 to 5).',
      fixedTop: ['program Max5;', 'var a : array[1..5] of integer; i, max : integer;', 'begin', '  for i := 1 to 5 do readln(a[i]);'],
      fixedBottom: ["  writeln('Max: ', max);", 'end.'],
      lines: ['  max := a[1];', '  for i := 2 to 5 do', '    if a[i] > max then', '      max := a[i];'],
      distractors: ['  max := 0;'],
      tests: [{ inputs: ['4', '9', '2', '7', '1'], expect: ['Max: 9'] }],
      hints: ['Start with the first element as the max.'], explanation: 'Assume a[1] is the max, then compare with every other element.',
    },
    {
      id: 'al-3', topic: 'arrayloops', type: 'output', difficulty: 'practice', skill: 'problem', exam: true,
      objective: 'Total with an array', prompt: 'What does this print?',
      code: pas`
program Totals;
var
  a : array[1..4] of integer;
  i, t : integer;
begin
  for i := 1 to 4 do
    a[i] := i * i;
  t := 0;
  for i := 1 to 4 do
    t := t + a[i];
  writeln(a[3], ' ', t);
end.
`,
      answer: '9 30', hints: ['a = [1, 4, 9, 16].'], explanation: 'a[3] = 9; total = 1 + 4 + 9 + 16 = 30.',
    },
    {
      id: 'al-4', topic: 'arrayloops', type: 'fix', difficulty: 'practice', skill: 'coding',
      objective: 'Loop range must match array', prompt: 'This program crashes. Fix it so it prints all 5 elements.',
      code: pas`
program Show;
var
  marks : array[0..4] of integer;
  i : integer;
begin
  for i := 0 to 4 do
    marks[i] := (i + 1) * 10;
  for i := 1 to 5 do
    writeln(marks[i]);
end.
`,
      tests: [{ exact: '10\n20\n30\n40\n50' }],
      hints: ['What indexes does marks have?'],
      solution: pas`
program Show;
var
  marks : array[0..4] of integer;
  i : integer;
begin
  for i := 0 to 4 do
    marks[i] := (i + 1) * 10;
  for i := 0 to 4 do
    writeln(marks[i]);
end.
`,
      explanation: 'The array uses indexes 0..4, so the loop must too.',
    },
    {
      id: 'al-5', topic: 'arrayloops', type: 'write', difficulty: 'practice', skill: 'coding', exam: true,
      objective: 'Input and average', prompt: 'Read **6** marks into an array and print `Average: ` with 2 decimal places.',
      starter: pas`
program Average6;
var
  marks : array[1..6] of integer;
  i, total : integer;
begin

end.
`,
      tests: [{ inputs: ['50', '60', '70', '80', '90', '100'], expect: ['Average: 75.00'] }, { inputs: ['1', '2', '3', '4', '5', '6'], expect: ['Average: 3.50'] }],
      requires: [{ pattern: 'marks\\s*\\[\\s*i\\s*\\]', message: 'Read the marks into the array using marks[i].' }],
      hints: ['total := 0;', 'In the loop: readln(marks[i]); total := total + marks[i];', "writeln('Average: ', total / 6:0:2);"],
      solution: pas`
program Average6;
var
  marks : array[1..6] of integer;
  i, total : integer;
begin
  total := 0;
  for i := 1 to 6 do
  begin
    readln(marks[i]);
    total := total + marks[i];
  end;
  writeln('Average: ', total / 6:0:2);
end.
`,
      explanation: 'Read and total in one loop, then divide.',
    },
    {
      id: 'al-6', topic: 'arrayloops', type: 'write', difficulty: 'challenge', skill: 'problem', exam: true,
      objective: 'Highest, lowest, average', prompt: 'Read **5** marks into an array. Print `Highest: `, `Lowest: ` and `Average: ` (2 decimal places).',
      starter: pas`
program HighLow;
var
  m : array[1..5] of integer;
  i, high, low, total : integer;
begin

end.
`,
      tests: [{ inputs: ['45', '75', '36', '81', '60'], expect: ['Highest: 81', 'Lowest: 36', 'Average: 59.40'] }, { inputs: ['10', '10', '10', '10', '11'], expect: ['Highest: 11', 'Lowest: 10', 'Average: 10.20'] }],
      hints: ['After reading, set high := m[1] and low := m[1].', 'Compare every other element with both.'],
      solution: pas`
program HighLow;
var
  m : array[1..5] of integer;
  i, high, low, total : integer;
begin
  total := 0;
  for i := 1 to 5 do
  begin
    readln(m[i]);
    total := total + m[i];
  end;
  high := m[1];
  low := m[1];
  for i := 2 to 5 do
  begin
    if m[i] > high then
      high := m[i];
    if m[i] < low then
      low := m[i];
  end;
  writeln('Highest: ', high);
  writeln('Lowest: ', low);
  writeln('Average: ', total / 5:0:2);
end.
`,
      explanation: 'The maximum and minimum patterns can share one loop.',
    },
    {
      id: 'al-7', topic: 'arrayloops', type: 'write', difficulty: 'challenge', skill: 'problem',
      objective: 'Search an array', prompt: 'Read **5** numbers into an array, then read a number to search for. Print `Found at position ` and its position (1–5), or `Not found`.',
      starter: pas`
program Search;
var
  a : array[1..5] of integer;
  i, target, pos : integer;
begin

end.
`,
      tests: [{ inputs: ['4', '8', '15', '16', '23', '15'], expect: ['Found at position 3'] }, { inputs: ['4', '8', '15', '16', '23', '42'], expect: ['Not found'], reject: ['position'] }],
      hints: ['pos := 0 means "not found yet".', 'if a[i] = target then pos := i;', 'After the loop, check if pos = 0.'],
      solution: pas`
program Search;
var
  a : array[1..5] of integer;
  i, target, pos : integer;
begin
  for i := 1 to 5 do
    readln(a[i]);
  readln(target);
  pos := 0;
  for i := 1 to 5 do
    if a[i] = target then
      pos := i;
  if pos = 0 then
    writeln('Not found')
  else
    writeln('Found at position ', pos);
end.
`,
      explanation: 'Linear search: compare the target with each element.',
    },
    {
      id: 'al-8', topic: 'arrayloops', type: 'trace', difficulty: 'practice', skill: 'problem', exam: true,
      objective: 'Trace max finding', prompt: 'The array is `[45, 75, 36, 81, 60]` (indexes 0..4). Trace `i` and `max` after each round.',
      code: pas`
max := marks[0];
for i := 1 to 4 do
  if marks[i] > max then
    max := marks[i];
`,
      columns: ['i', 'max'], rowLabel: 'Round', rows: [['1', '75'], ['2', '75'], ['3', '81'], ['4', '81']],
      hints: ['max starts as 45.', '36 is not bigger than 75.'], explanation: 'max: 45 → 75 → 75 → 81 → 81.',
    },
  ],
  boss: {
    id: 'boss-u7',
    unit: 'u7',
    title: 'The Class Results Board',
    emoji: 'school',
    story: 'Term test marks for a whole class need processing before the parents\' meeting. Use arrays to tame the data!',
    stages: [
      {
        title: 'Store and list',
        prompt: 'Read **4** marks into an array and print them as `Student 1: 45` … `Student 4: 60`.',
        starter: pas`
program ListMarks;
var
  marks : array[1..4] of integer;
  i : integer;
begin

end.
`,
        tests: [{ inputs: ['45', '75', '36', '60'], expect: ['Student 1: 45', 'Student 2: 75', 'Student 3: 36', 'Student 4: 60'] }],
        hints: ['One loop to read, one to print.', "writeln('Student ', i, ': ', marks[i]);"],
        solution: pas`
program ListMarks;
var
  marks : array[1..4] of integer;
  i : integer;
begin
  for i := 1 to 4 do
    readln(marks[i]);
  for i := 1 to 4 do
    writeln('Student ', i, ': ', marks[i]);
end.
`,
      },
      {
        title: 'Above average',
        prompt: 'Read **5** marks. Print the average (`Average: ` 2 dp), then `Above average: ` and how many students scored **above** it.',
        starter: pas`
program AboveAvg;
var
  m : array[1..5] of integer;
  i, total, count : integer;
  avg : real;
begin

end.
`,
        tests: [{ inputs: ['40', '50', '60', '70', '80'], expect: ['Average: 60.00', 'Above average: 2'] }, { inputs: ['10', '10', '10', '10', '90'], expect: ['Average: 26.00', 'Above average: 1'] }],
        hints: ['You need the average before you can count — that is why the marks are stored in an array.', 'Second loop: if m[i] > avg then count := count + 1;'],
        solution: pas`
program AboveAvg;
var
  m : array[1..5] of integer;
  i, total, count : integer;
  avg : real;
begin
  total := 0;
  for i := 1 to 5 do
  begin
    readln(m[i]);
    total := total + m[i];
  end;
  avg := total / 5;
  count := 0;
  for i := 1 to 5 do
    if m[i] > avg then
      count := count + 1;
  writeln('Average: ', avg:0:2);
  writeln('Above average: ', count);
end.
`,
      },
      {
        title: 'Top student',
        prompt: 'Read **4** names and then **4** marks (in the same order). Print `Top: ` followed by the name of the student with the highest mark.',
        starter: pas`
program TopStudent;
var
  names : array[1..4] of string;
  marks : array[1..4] of integer;
  i, best : integer;
begin

end.
`,
        tests: [{ inputs: ['Kamal', 'Nimali', 'Sunil', 'Dilini', '70', '92', '65', '88'], expect: ['Top: Nimali'] }, { inputs: ['A', 'B', 'C', 'D', '1', '2', '3', '4'], expect: ['Top: D'] }],
        hints: ['Keep the INDEX of the best mark (best := 1 to start).', 'if marks[i] > marks[best] then best := i;', "writeln('Top: ', names[best]);"],
        solution: pas`
program TopStudent;
var
  names : array[1..4] of string;
  marks : array[1..4] of integer;
  i, best : integer;
begin
  for i := 1 to 4 do
    readln(names[i]);
  for i := 1 to 4 do
    readln(marks[i]);
  best := 1;
  for i := 2 to 4 do
    if marks[i] > marks[best] then
      best := i;
  writeln('Top: ', names[best]);
end.
`,
      },
    ],
  },
};

export default mod;
