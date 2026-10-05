import type { StructuredQ } from './types';
import { pas } from './util';

/**
 * Structured (Paper II style) questions. Code parts are auto-marked by running
 * the student's program; theory parts use a model answer + marking points.
 */
export const STRUCTURED: StructuredQ[] = [
  {
    id: 's-marks',
    title: 'Marks of a class',
    topics: ['arrays', 'arrayloops', 'for'],
    intro: 'A teacher wants a program to store the ICT marks of 5 students and find the highest mark and the average.',
    parts: [
      {
        label: '(a)', marks: 2,
        prompt: 'Write the declaration of an integer array called `marks` that can store 5 marks using indexes 1 to 5.',
        question: {
          id: 's-marks-a', topic: 'arrays', type: 'fill', difficulty: 'easy', skill: 'coding', objective: 'Declare an array', prompt: 'Complete the declaration.',
          code: 'var\n  marks : [[0]];', blanks: [{ accept: ['array[1..5] of integer', 'array [1..5] of integer', 'array[1 .. 5] of integer'], width: 24 }],
          hints: [], explanation: '`marks : array[1..5] of integer;`',
        },
      },
      {
        label: '(b)', marks: 6,
        prompt: 'Write a complete program that reads 5 marks into the array, then prints `Highest: ` followed by the highest mark and `Average: ` followed by the average to 2 decimal places.',
        question: {
          id: 's-marks-b', topic: 'arrayloops', type: 'write', difficulty: 'challenge', skill: 'problem', objective: 'Max and average with arrays', prompt: 'Write the program.',
          starter: pas`
program ClassMarks;
var
  marks : array[1..5] of integer;
  i, max, total : integer;
  avg : real;
begin

end.
`,
          tests: [
            { inputs: ['45', '75', '36', '81', '60'], expect: ['Highest', '81', 'Average', '59.40'] },
            { inputs: ['90', '10', '20', '30', '40'], expect: ['Highest', '90', 'Average', '38.00'] },
          ],
          requires: [{ pattern: 'marks\\s*\\[', message: 'Store the marks in the array `marks`.' }],
          solution: pas`
program ClassMarks;
var
  marks : array[1..5] of integer;
  i, max, total : integer;
  avg : real;
begin
  total := 0;
  for i := 1 to 5 do
  begin
    readln(marks[i]);
    total := total + marks[i];
  end;
  max := marks[1];
  for i := 2 to 5 do
    if marks[i] > max then
      max := marks[i];
  avg := total / 5;
  writeln('Highest: ', max);
  writeln('Average: ', avg:0:2);
end.
`,
          hints: [], explanation: 'Use one loop to read and total, then find the maximum starting from `marks[1]`.',
        },
      },
      {
        label: '(c)', marks: 2,
        prompt: 'Give **two** advantages of using an array instead of 5 separate variables.',
        model: 'One identifier stores many values of the same type; arrays work with loops so the same code handles any number of elements; elements can be accessed directly by index.',
        points: ['Uses one name/identifier for many values', 'Can be processed easily with a loop (shorter code)', 'Elements accessed directly using an index'],
      },
    ],
  },
  {
    id: 's-trace',
    title: 'Tracing a loop',
    topics: ['while', 'nested'],
    intro: 'Study the program below.',
    code: pas`
program Mystery;
var
  n, s : integer;
begin
  n := 1;
  s := 0;
  while n <= 7 do
  begin
    if n mod 2 = 1 then
      s := s + n;
    n := n + 2;
  end;
  writeln(s);
end.
`,
    parts: [
      {
        label: '(a)', marks: 4,
        prompt: 'Complete the trace table for `n` and `s` each time the loop body finishes.',
        question: {
          id: 's-trace-a', topic: 'while', type: 'trace', difficulty: 'practice', skill: 'problem', objective: 'Trace a while loop', prompt: 'Fill the table.',
          code: pas`
n := 1;
s := 0;
while n <= 7 do
begin
  if n mod 2 = 1 then
    s := s + n;
  n := n + 2;
end;
`,
          columns: ['n', 's'], rowLabel: 'Round', rows: [['3', '1'], ['5', '4'], ['7', '9'], ['9', '16']],
          hints: [], explanation: 'Every value of n (1, 3, 5, 7) is odd, so s = 1 + 3 + 5 + 7 = 16.',
        },
      },
      {
        label: '(b)', marks: 1,
        prompt: 'What is the output of the program?',
        question: {
          id: 's-trace-b', topic: 'while', type: 'output', difficulty: 'practice', skill: 'problem', objective: 'Predict output', prompt: 'Output?',
          code: pas`
program Mystery;
var
  n, s : integer;
begin
  n := 1;
  s := 0;
  while n <= 7 do
  begin
    if n mod 2 = 1 then
      s := s + n;
    n := n + 2;
  end;
  writeln(s);
end.
`,
          answer: '16', hints: [], explanation: '1 + 3 + 5 + 7 = 16',
        },
      },
      {
        label: '(c)', marks: 2,
        prompt: 'Rewrite the loop as a `for` loop that gives the same output. (Describe or write the code.)',
        model: 'for n := 1 to 7 do\n  if n mod 2 = 1 then\n    s := s + n;\n(The for loop counts every number 1..7 and the if keeps only the odd ones.)',
        points: ['Uses for n := 1 to 7 do', 'Keeps the if n mod 2 = 1 check (or otherwise adds only odd numbers)'],
      },
    ],
  },
  {
    id: 's-translators',
    title: 'Language translators',
    topics: ['translators', 'languages'],
    intro: 'Programs written in high-level languages must be translated before a computer can run them.',
    parts: [
      {
        label: '(a)', marks: 2,
        prompt: 'What is the difference between a **compiler** and an **interpreter**?',
        model: 'A compiler translates the whole program into machine code at once before it runs; an interpreter translates and executes the program one statement (line) at a time.',
        points: ['Compiler: translates the whole program at once', 'Interpreter: translates and runs line by line / statement by statement'],
      },
      {
        label: '(b)', marks: 1,
        prompt: 'Which translator converts assembly language into machine code?',
        question: {
          id: 's-tr-b', topic: 'translators', type: 'mcq', difficulty: 'easy', skill: 'concept', objective: 'Assembler', prompt: 'Choose one.',
          options: ['Compiler', 'Interpreter', 'Assembler', 'Editor'], answer: 2, hints: [], explanation: 'An **assembler** translates assembly language into machine code.',
        },
      },
      {
        label: '(c)', marks: 2,
        prompt: 'Give one advantage and one disadvantage of machine language.',
        model: 'Advantage: runs directly on the CPU, so it is fast and needs no translator. Disadvantage: very hard for humans to write/read, and it is machine dependent.',
        points: ['Advantage: fast / runs directly / no translator needed', 'Disadvantage: hard for humans OR machine dependent'],
      },
      {
        label: '(d)', marks: 1,
        prompt: 'A program has an error on line 20. With which translator will lines 1–19 still run?',
        question: {
          id: 's-tr-d', topic: 'translators', type: 'mcq', difficulty: 'practice', skill: 'concept', objective: 'Interpreter behaviour', prompt: 'Choose one.',
          options: ['Compiler', 'Interpreter', 'Neither', 'Both'], answer: 1, hints: [], explanation: 'An interpreter runs line by line and stops at the error, so earlier lines have already run.',
        },
      },
    ],
  },
  {
    id: 's-grade',
    title: 'Grading program',
    topics: ['elseif', 'io'],
    intro: 'A school gives grades: 75 and above → A, 65–74 → B, 55–64 → C, 40–54 → S, below 40 → F.',
    parts: [
      {
        label: '(a)', marks: 5,
        prompt: 'Write a program that reads a mark and prints `Grade: ` followed by the grade letter.',
        question: {
          id: 's-grade-a', topic: 'elseif', type: 'write', difficulty: 'challenge', skill: 'coding', objective: 'Nested if', prompt: 'Write the program.',
          starter: pas`
program Grades;
var
  marks : integer;
begin
  readln(marks);

end.
`,
          tests: [
            { inputs: ['80'], expect: ['Grade: A'] },
            { inputs: ['65'], expect: ['Grade: B'] },
            { inputs: ['55'], expect: ['Grade: C'] },
            { inputs: ['40'], expect: ['Grade: S'] },
            { inputs: ['39'], expect: ['Grade: F'] },
          ],
          solution: pas`
program Grades;
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
          hints: [], explanation: 'Check from the highest grade down so each mark matches the first true condition.',
        },
      },
      {
        label: '(b)', marks: 2,
        prompt: 'Why is the order of the conditions important in an `if … else if` chain?',
        model: 'Only the first TRUE condition runs. If `marks >= 40` were checked first, a mark of 80 would get S. So check the highest boundary first.',
        points: ['Only the first true branch runs', 'Checking the highest value first gives the correct grade'],
      },
    ],
  },
  {
    id: 's-sub',
    title: 'Procedures and functions',
    topics: ['procedures', 'functions'],
    intro: 'Large programs are divided into sub-programs.',
    code: pas`
program Shapes;
var
  side : integer;

function Square(n : integer) : integer;
begin
  Square := n * n;
end;

procedure Line(len : integer);
var
  i : integer;
begin
  for i := 1 to len do
    write('-');
  writeln;
end;

begin
  side := 4;
  Line(side);
  writeln(Square(side));
  Line(3);
end.
`,
    parts: [
      {
        label: '(a)', marks: 2,
        prompt: 'What is the output of the program?',
        question: {
          id: 's-sub-a', topic: 'functions', type: 'output', difficulty: 'practice', skill: 'problem', objective: 'Trace calls', prompt: 'Output?',
          code: pas`
program Shapes;
var
  side : integer;

function Square(n : integer) : integer;
begin
  Square := n * n;
end;

procedure Line(len : integer);
var
  i : integer;
begin
  for i := 1 to len do
    write('-');
  writeln;
end;

begin
  side := 4;
  Line(side);
  writeln(Square(side));
  Line(3);
end.
`,
          answer: '----\n16\n---', hints: [], explanation: 'Line(4) prints 4 dashes, Square(4) = 16, Line(3) prints 3 dashes.',
        },
      },
      {
        label: '(b)', marks: 2,
        prompt: 'State one difference between a procedure and a function, using this program as an example.',
        model: '`Square` is a function: it returns a value (16) that is used in writeln. `Line` is a procedure: it does a job (prints dashes) but returns no value.',
        points: ['Function returns a value (e.g. Square gives 16)', 'Procedure does a task without returning a value (e.g. Line prints)'],
      },
      {
        label: '(c)', marks: 1,
        prompt: 'Name the parameter of the function `Square`.',
        question: {
          id: 's-sub-c', topic: 'functions', type: 'mcq', difficulty: 'easy', skill: 'concept', objective: 'Parameters', prompt: 'Choose one.',
          options: ['side', 'n', 'Square', 'len'], answer: 1, hints: [], explanation: '`n` is declared in `function Square(n : integer)`.',
        },
      },
    ],
  },
  {
    id: 's-menu',
    title: 'Shop menu',
    topics: ['case', 'repeat', 'arithmetic'],
    intro: 'A shop sells three items: 1 = Pen (Rs. 20), 2 = Book (Rs. 150), 3 = Bag (Rs. 1200).',
    parts: [
      {
        label: '(a)', marks: 4,
        prompt: 'Write a program that reads the item number and the quantity, then prints `Total: ` and the cost. For any other item number print `Invalid item`.',
        question: {
          id: 's-menu-a', topic: 'case', type: 'write', difficulty: 'challenge', skill: 'coding', objective: 'case statement', prompt: 'Write the program.',
          starter: pas`
program Shop;
var
  item, qty : integer;
begin
  readln(item);
  readln(qty);

end.
`,
          tests: [
            { inputs: ['1', '3'], expect: ['Total: 60'] },
            { inputs: ['2', '2'], expect: ['Total: 300'] },
            { inputs: ['3', '1'], expect: ['Total: 1200'] },
            { inputs: ['7', '1'], expect: ['Invalid item'], reject: ['Total'] },
          ],
          solution: pas`
program Shop;
var
  item, qty : integer;
begin
  readln(item);
  readln(qty);
  case item of
    1 : writeln('Total: ', 20 * qty);
    2 : writeln('Total: ', 150 * qty);
    3 : writeln('Total: ', 1200 * qty);
  else
    writeln('Invalid item');
  end;
end.
`,
          hints: [], explanation: 'A case statement chooses the price from the item number; else handles invalid items.',
        },
      },
      {
        label: '(b)', marks: 2,
        prompt: 'Explain why a `case` statement is suitable here instead of several `if` statements.',
        model: 'One variable (item) is compared with several fixed values (1, 2, 3), so case is shorter, clearer and easier to read; else catches invalid values.',
        points: ['One variable compared against fixed values', 'Code is clearer/shorter and easier to read'],
      },
    ],
  },
  {
    id: 's-paradigm',
    title: 'Programming paradigms',
    topics: ['paradigms', 'languages'],
    intro: 'Different programming languages follow different approaches.',
    parts: [
      {
        label: '(a)', marks: 2,
        prompt: 'Explain the difference between **procedural** and **declarative** programming.',
        model: 'Procedural programming describes step by step HOW to solve a problem (e.g. Pascal). Declarative programming describes WHAT result is wanted and the system decides how (e.g. database queries, AI).',
        points: ['Procedural: step-by-step how to solve it', 'Declarative: describes what result is wanted'],
      },
      {
        label: '(b)', marks: 3,
        prompt: 'A class called `Student` is used in an object-oriented program. Give **two** properties and **one** method it could have.',
        model: 'Properties: name, indexNumber, grade, marks. Methods: calculateAverage(), printReport(), enrol().',
        points: ['First suitable property (e.g. name)', 'Second suitable property (e.g. marks)', 'A suitable method/action (e.g. calculateAverage())'],
      },
      {
        label: '(c)', marks: 1,
        prompt: 'Which of these is a scripting language?',
        question: {
          id: 's-par-c', topic: 'paradigms', type: 'mcq', difficulty: 'easy', skill: 'concept', objective: 'Scripting languages', prompt: 'Choose one.',
          options: ['Pascal', 'C', 'JavaScript', 'C++'], answer: 2, hints: [], explanation: 'JavaScript (and PHP) are scripting languages.',
        },
      },
    ],
  },
  {
    id: 's-temp',
    title: 'Temperature converter',
    topics: ['arithmetic', 'io', 'variables'],
    intro: 'The formula to convert Celsius to Fahrenheit is  F = C × 9 / 5 + 32.',
    parts: [
      {
        label: '(a)', marks: 1,
        prompt: 'Which data type is most suitable for storing the Fahrenheit value? Why?',
        model: 'real — because the calculation uses / and can produce a decimal value (e.g. 98.6).',
        points: ['real, with reason (decimal result / uses division)'],
      },
      {
        label: '(b)', marks: 4,
        prompt: 'Write a program that reads a Celsius temperature and prints the Fahrenheit value to 1 decimal place.',
        question: {
          id: 's-temp-b', topic: 'arithmetic', type: 'write', difficulty: 'practice', skill: 'coding', objective: 'Formula program', prompt: 'Write the program.',
          starter: pas`
program Convert;
var
  c, f : real;
begin

end.
`,
          tests: [
            { inputs: ['100'], expect: ['212.0'] },
            { inputs: ['37'], expect: ['98.6'] },
            { inputs: ['-40'], expect: ['-40.0'] },
          ],
          solution: pas`
program Convert;
var
  c, f : real;
begin
  write('Celsius: ');
  readln(c);
  f := c * 9 / 5 + 32;
  writeln('Fahrenheit: ', f:0:1);
end.
`,
          hints: [], explanation: 'Read c, compute f := c * 9 / 5 + 32, print with :0:1.',
        },
      },
    ],
  },
];
