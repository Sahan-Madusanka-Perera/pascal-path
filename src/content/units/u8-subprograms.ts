import type { UnitModule } from '../index';
import { pas } from '../util';

const mod: UnitModule = {
  unit: {
    id: 'u8',
    title: 'Sub-programs',
    subtitle: 'Procedures and functions',
    hue: 'violet',
    icon: 'blocks',
    topics: ['procedures', 'functions'],
    boss: 'boss-u8',
  },
  topics: [
    // ---------------------------------------------------------------- procedures
    {
      id: 'procedures',
      unit: 'u8',
      title: 'Procedures',
      short: 'Named blocks that do a job',
      source: 'Tute §16.1–16.5',
      minutes: 11,
      objectives: ['Explain why programs are split into sub-programs', 'Declare and call a procedure', 'Use value and var parameters'],
      lesson: [
        {
          kind: 'concept',
          title: 'Break big programs into parts',
          body: `Large programs become hard to read, debug and maintain. So we break them into **sub-programs**:

- A **procedure** does a task but does **not** return a value.
- A **function** does a task and **returns** a value.

Sub-programs are declared **before** the main \`begin … end.\``,
          code: pas`
program MyProgram;
var
  ...
procedure DoSomething;
begin
  ...
end;

begin
  DoSomething;   { call it }
end.
`,
        },
        {
          kind: 'watch',
          title: 'Calling a procedure',
          body: 'Watch the program **jump** into the procedure, run it, and come back.',
          code: pas`
program Banner;

procedure Line;
begin
  writeln('==========');
end;

begin
  Line;
  writeln('  HELLO');
  Line;
end.
`,
        },
        { kind: 'check', question: 'proc-1' },
        {
          kind: 'concept',
          title: 'Parameters: giving a procedure data',
          body: `**Parameters** pass values into a procedure.

- **Value parameter** \`(r : real)\` — the procedure gets a **copy**. Changes stay inside.
- **var parameter** \`(var r : real)\` — the procedure works on the **caller's own variable**. Changes go back out.`,
          code: pas`
procedure GetData(var r : real);   { fills in the caller's variable }
begin
  write('Enter radius: ');
  readln(r);
end;

procedure ProcessArea(r : real);   { just uses a copy }
var
  area : real;
begin
  area := PI * r * r;
  writeln('Area = ', area:0:2);
end;
`,
        },
        {
          kind: 'example',
          title: 'Circle program using procedures',
          body: 'From your tute. Try radius 7. Then press **Show me what happened** to watch the calls.',
          inputs: ['7'],
          code: pas`
program ProcedureCircle;
const
  PI = 22/7;
var
  radius : real;

procedure GetData(var r : real);
begin
  write('Enter radius: ');
  readln(r);
end;

procedure ProcessArea(r : real);
var
  area : real;
begin
  area := PI * r * r;
  writeln('Area = ', area:0:2);
end;

procedure ProcessCircumference(r : real);
var
  circum : real;
begin
  circum := 2 * PI * r;
  writeln('Circumference = ', circum:0:2);
end;

begin
  GetData(radius);
  ProcessCircumference(radius);
  ProcessArea(radius);
end.
`,
        },
        {
          kind: 'try',
          title: 'Welcome procedure',
          body: 'Write a procedure `Welcome` that prints `Welcome to ICT`. Call it **twice** from the main program.',
          starter: pas`
program Greeting;

begin

end.
`,
          tests: [{ exact: 'Welcome to ICT\nWelcome to ICT' }],
          requires: [{ pattern: 'procedure\\s+Welcome', message: 'Declare a procedure called Welcome.' }],
          hints: ['procedure Welcome; begin writeln(\'Welcome to ICT\'); end;', 'Put it before the main begin, then call Welcome; twice.'],
          solution: pas`
program Greeting;

procedure Welcome;
begin
  writeln('Welcome to ICT');
end;

begin
  Welcome;
  Welcome;
end.
`,
        },
        { kind: 'check', question: 'proc-5' },
      ],
      revision: {
        what: 'A procedure is a named sub-program that performs a task and does not return a value.',
        why: 'Sub-programs make large programs easier to read, debug, maintain and reuse.',
        syntax: pas`
procedure Name(param : type; var outParam : type);
var
  localVar : type;
begin
  statements;
end;
`,
        mistakes: ['Declaring procedures after the main begin.', 'Forgetting `var` when the procedure must change the caller\'s variable.', 'Passing a number (not a variable) to a var parameter.'],
        examPoints: ['Procedure: does a job, no return value.', 'Value parameter = copy; var parameter = the original variable.', 'Advantages: easier to read, debug, maintain and reuse.'],
        keyTerms: [
          { term: 'Procedure', def: 'A sub-program that performs a task without returning a value.' },
          { term: 'Parameter', def: 'A value passed into a sub-program.' },
          { term: 'Local variable', def: 'A variable declared inside a sub-program; it only exists there.' },
        ],
        mini: 'proc-2',
      },
    },
    // ---------------------------------------------------------------- functions
    {
      id: 'functions',
      unit: 'u8',
      title: 'Functions',
      short: 'Sub-programs that give back an answer',
      source: 'Tute §16.4–16.6',
      minutes: 11,
      objectives: ['Declare a function with a return type', 'Return a value by assigning to the function name', 'Choose between a procedure and a function'],
      lesson: [
        { kind: 'visual', title: 'Procedure vs function', body: 'Call each one and see what comes back.', visual: 'proc-vs-func' },
        {
          kind: 'concept',
          title: 'Writing a function',
          body: 'A function has a **return type** after its parameters. It gives back its answer by **assigning to its own name**:',
          code: pas`
function Square(n : integer) : integer;
begin
  Square := n * n;     { this is the "return" }
end;
`,
          callout: { kind: 'mistake', text: 'Pascal does not use `return value;`. Write `FunctionName := value;` instead.' },
        },
        {
          kind: 'watch',
          title: 'Watch a function return',
          body: 'Watch the parameter get its value, the result being set, and the answer coming back.',
          code: pas`
program SquareDemo;
var
  answer : integer;

function Square(n : integer) : integer;
begin
  Square := n * n;
end;

begin
  answer := Square(4);
  writeln(answer);
  writeln(Square(3) + 1);
end.
`,
        },
        { kind: 'check', question: 'fn-2' },
        {
          kind: 'concept',
          title: 'When to use which?',
          body: `- Use a **function** when you need a **value back** (area, maximum, sum, grade).
- Use a **procedure** when you just want to **do steps** (print a menu, read input).

A function call can go anywhere a value can: in \`writeln\`, in calculations, in conditions.`,
          code: pas`
writeln('Area = ', Area(radius):0:2);
if Max(a, b) > 10 then ...
`,
        },
        {
          kind: 'try',
          title: 'Maximum of two',
          body: 'Write a function `Max(a, b : integer) : integer` that returns the larger number. The main program already uses it.',
          starter: pas`
program MaxDemo;

begin
  writeln(Max(4, 9));
  writeln(Max(12, 5));
end.
`,
          tests: [{ exact: '9\n12' }],
          requires: [{ pattern: 'function\\s+Max', message: 'Declare a function called Max.' }],
          hints: ['function Max(a, b : integer) : integer;', 'if a > b then Max := a else Max := b;'],
          solution: pas`
program MaxDemo;

function Max(a, b : integer) : integer;
begin
  if a > b then
    Max := a
  else
    Max := b;
end;

begin
  writeln(Max(4, 9));
  writeln(Max(12, 5));
end.
`,
        },
        { kind: 'check', question: 'fn-6' },
      ],
      revision: {
        what: 'A function is a sub-program that calculates and returns one value, by assigning to its own name.',
        why: 'Functions package a calculation so it can be reused anywhere a value is needed.',
        syntax: pas`
function Name(param : type) : returnType;
begin
  Name := value;
end;
`,
        example: {
          code: pas`
program FunctionCircle;
const
  PI = 22/7;

function Area(r : real) : real;
begin
  Area := PI * r * r;
end;

begin
  writeln('Area = ', Area(7):0:2);
end.
`,
          output: 'Area = 154.00',
        },
        mistakes: ['Using `return` (not Pascal).', 'Forgetting the return type `: integer`.', 'Never assigning to the function name, so no value is returned.', 'Calling a procedure inside writeln (procedures return nothing).'],
        examPoints: ['Function returns a value; procedure does not.', 'Return value is set with `FunctionName := value;`.'],
        keyTerms: [{ term: 'Function', def: 'A sub-program that returns a value.' }, { term: 'Return type', def: 'The data type of the value a function gives back.' }],
        mini: 'fn-1',
      },
    },
  ],
  questions: [
    // ---------- procedures
    {
      id: 'proc-1', topic: 'procedures', type: 'output', difficulty: 'easy', skill: 'problem', exam: true,
      objective: 'Trace procedure calls', prompt: 'What does this print?',
      code: pas`
program Calls;

procedure Hello;
begin
  writeln('Hello');
end;

begin
  writeln('Start');
  Hello;
  Hello;
  writeln('End');
end.
`,
      answer: 'Start\nHello\nHello\nEnd', hints: ['Each call runs the whole procedure.'], explanation: 'The procedure runs once for each call.',
    },
    {
      id: 'proc-2', topic: 'procedures', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Procedure vs function', prompt: 'What is the main difference between a procedure and a function?',
      options: ['A procedure is faster', 'A function returns a value; a procedure does not', 'A procedure can have parameters; a function cannot', 'There is no difference'], answer: 1,
      why: ['Speed isn\'t the difference.', '', 'Both can have parameters.', 'They are used differently.'],
      hints: ['Think of the memory trick from the tute.'], explanation: 'Function → gives a value back. Procedure → just does a job.',
    },
    {
      id: 'proc-3', topic: 'procedures', type: 'mcq', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'Advantages of sub-programs', prompt: 'Which is **NOT** an advantage of using sub-programs?',
      options: ['The program is easier to read', 'Errors are easier to find and fix', 'Code can be reused', 'The program no longer needs variables'], answer: 3,
      why: ['This is an advantage.', 'This is an advantage.', 'This is an advantage.', ''],
      hints: ['Three of these are real benefits.'], explanation: 'Sub-programs still need variables. The real advantages are readability, easier debugging/maintenance and reuse.',
    },
    {
      id: 'proc-4', topic: 'procedures', type: 'output', difficulty: 'practice', skill: 'problem', exam: true,
      objective: 'Value vs var parameters', prompt: 'What does this print?',
      code: pas`
program Params;
var
  a, b : integer;

procedure Change(x : integer; var y : integer);
begin
  x := x + 10;
  y := y + 10;
end;

begin
  a := 1;
  b := 1;
  Change(a, b);
  writeln(a, ' ', b);
end.
`,
      answer: '1 11', hints: ['x is a copy; y is the real variable b.'], explanation: 'Only the var parameter changes the caller\'s variable: a stays 1, b becomes 11.',
    },
    {
      id: 'proc-5', topic: 'procedures', type: 'write', difficulty: 'practice', skill: 'coding', exam: true,
      objective: 'Procedure with a parameter', prompt: 'Write a procedure `Stars(n : integer)` that prints n stars on one line. The main program calls `Stars(3)` and `Stars(5)`.',
      starter: pas`
program StarLines;

begin
  Stars(3);
  Stars(5);
end.
`,
      tests: [{ exact: '***\n*****' }],
      requires: [{ pattern: 'procedure\\s+Stars', message: 'Declare a procedure called Stars.' }],
      hints: ['procedure Stars(n : integer);', 'You need a local variable i for the loop: var i : integer;', "for i := 1 to n do write('*'); writeln;"],
      solution: pas`
program StarLines;

procedure Stars(n : integer);
var
  i : integer;
begin
  for i := 1 to n do
    write('*');
  writeln;
end;

begin
  Stars(3);
  Stars(5);
end.
`,
      explanation: 'The parameter n controls how many stars the loop prints.',
    },
    {
      id: 'proc-6', topic: 'procedures', type: 'fill', difficulty: 'easy', skill: 'coding',
      objective: 'Procedure syntax', prompt: 'Complete the procedure.',
      code: pas`
program Menu;

[[0]] ShowMenu;
begin
  writeln('1. Play');
  writeln('2. Quit');
[[1]]

begin
  ShowMenu;
end.
`,
      blanks: [{ accept: ['procedure'], width: 10 }, { accept: ['end;'], width: 5 }], tests: [{ exact: '1. Play\n2. Quit' }],
      hints: ['Which keyword starts a sub-program that returns nothing?', 'A procedure ends with end and a semicolon.'], explanation: '`procedure ShowMenu; begin … end;`',
    },
    {
      id: 'proc-7', topic: 'procedures', type: 'fix', difficulty: 'challenge', skill: 'coding', exam: true,
      objective: 'var parameters', prompt: 'The procedure should read a number into the main program\'s variable, but `n` stays 0. Fix it.',
      code: pas`
program ReadIt;
var
  n : integer;

procedure GetNumber(x : integer);
begin
  readln(x);
end;

begin
  n := 0;
  GetNumber(n);
  writeln('You typed ', n);
end.
`,
      tests: [{ inputs: ['42'], expect: ['You typed 42'] }],
      hints: ['How can a procedure change the caller\'s variable?'],
      solution: pas`
program ReadIt;
var
  n : integer;

procedure GetNumber(var x : integer);
begin
  readln(x);
end;

begin
  n := 0;
  GetNumber(n);
  writeln('You typed ', n);
end.
`,
      explanation: 'Make x a `var` parameter so it refers to the main program\'s variable.',
    },
    {
      id: 'proc-8', topic: 'procedures', type: 'spot', difficulty: 'practice', skill: 'coding',
      objective: 'Where to declare', prompt: 'This program won\'t run. Click the line where the problem starts.',
      code: pas`
program Wrong;
begin
  Greet;
end.

procedure Greet;
begin
  writeln('Hi');
end;
`,
      lines: [3], hints: ['Pascal must know about Greet before it is called.'], explanation: 'Procedures must be declared **before** the main begin. Pascal stops reading at `end.`, so Greet is unknown on line 3.',
    },
    // ---------- functions
    {
      id: 'fn-1', topic: 'functions', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Returning a value', prompt: 'How does a Pascal function return its value?', codeOptions: true,
      options: ['return value;', 'FunctionName := value;', 'writeln(value);', 'exit(value) only'], answer: 1,
      why: ['`return` is used in other languages, not standard Pascal.', '', 'That prints; it doesn\'t return.', 'Assigning to the name is the standard way.'],
      hints: ['It uses the function\'s own name.'], explanation: 'Assign to the function\'s name: `Square := n * n;`',
    },
    {
      id: 'fn-2', topic: 'functions', type: 'output', difficulty: 'easy', skill: 'problem', exam: true,
      objective: 'Trace a function', prompt: 'What does this print?',
      code: pas`
program Cube;

function Cube(n : integer) : integer;
begin
  Cube := n * n * n;
end;

begin
  writeln(Cube(2));
  writeln(Cube(3) - 1);
end.
`,
      answer: '8\n26', hints: ['2 × 2 × 2', '27 − 1'], explanation: 'Cube(2) = 8; Cube(3) − 1 = 26.',
    },
    {
      id: 'fn-3', topic: 'functions', type: 'spot', difficulty: 'practice', skill: 'coding', exam: true,
      objective: 'No return statement', prompt: 'Click the line that is not valid Pascal.',
      code: pas`
program Doubles;

function Double(n : integer) : integer;
begin
  return n * 2;
end;

begin
  writeln(Double(5));
end.
`,
      lines: [5], hints: ['How do Pascal functions give back a value?'], explanation: 'Use `Double := n * 2;` instead of `return`.',
    },
    {
      id: 'fn-4', topic: 'functions', type: 'write', difficulty: 'practice', skill: 'coding', exam: true,
      objective: 'Write a function', prompt: 'Write a function `Square(n : integer) : integer` that returns n². The main program prints Square(7).',
      starter: pas`
program Sq;

begin
  writeln(Square(7));
end.
`,
      tests: [{ exact: '49' }],
      requires: [{ pattern: 'function\\s+Square', message: 'Declare a function called Square.' }],
      hints: ['function Square(n : integer) : integer;', 'Square := n * n;'],
      solution: pas`
program Sq;

function Square(n : integer) : integer;
begin
  Square := n * n;
end;

begin
  writeln(Square(7));
end.
`,
      explanation: 'Declare the return type and assign the answer to the name.',
    },
    {
      id: 'fn-5', topic: 'functions', type: 'match', difficulty: 'practice', skill: 'concept',
      objective: 'Parts of a function', prompt: 'Match each part of `function Area(r : real) : real;` with its meaning.', codeLeft: true,
      pairs: [['function', 'Keyword that starts the sub-program'], ['Area', 'The function\'s name'], ['(r : real)', 'The parameter'], [': real', 'The return type'], ['Area := PI * r * r;', 'Sets the value that is returned']],
      hints: ['Read the header from left to right.'], explanation: 'keyword → name → parameters → return type; the body assigns the result.',
    },
    {
      id: 'fn-6', topic: 'functions', type: 'mcq', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'Choose procedure or function', prompt: 'Which task is best written as a **function**?',
      options: ['Printing a menu', 'Reading 10 marks into an array', 'Calculating the average of three numbers', 'Printing a line of stars'], answer: 2,
      why: ['Printing is a job — a procedure.', 'Reading input is a job — a procedure.', '', 'Printing is a job — a procedure.'],
      hints: ['Which one produces a value?'], explanation: 'An average is a value you want back — perfect for a function.',
    },
    {
      id: 'fn-7', topic: 'functions', type: 'write', difficulty: 'challenge', skill: 'problem', exam: true,
      objective: 'Function with decisions', prompt: 'Write a function `Grade(marks : integer) : char` that returns A (≥75), B (≥65), C (≥55), S (≥40) or F. The main program reads a mark and prints `Grade: ` and Grade(mark).',
      starter: pas`
program GradeFn;
var
  m : integer;

begin
  readln(m);
  writeln('Grade: ', Grade(m));
end.
`,
      tests: [{ inputs: ['80'], expect: ['Grade: A'] }, { inputs: ['70'], expect: ['Grade: B'] }, { inputs: ['60'], expect: ['Grade: C'] }, { inputs: ['45'], expect: ['Grade: S'] }, { inputs: ['10'], expect: ['Grade: F'] }],
      requires: [{ pattern: 'function\\s+Grade', message: 'Declare a function called Grade.' }],
      hints: ['function Grade(marks : integer) : char;', "if marks >= 75 then Grade := 'A' else if …"],
      solution: pas`
program GradeFn;
var
  m : integer;

function Grade(marks : integer) : char;
begin
  if marks >= 75 then
    Grade := 'A'
  else if marks >= 65 then
    Grade := 'B'
  else if marks >= 55 then
    Grade := 'C'
  else if marks >= 40 then
    Grade := 'S'
  else
    Grade := 'F';
end;

begin
  readln(m);
  writeln('Grade: ', Grade(m));
end.
`,
      explanation: 'A function can contain any statements; it just must assign its result.',
    },
    {
      id: 'fn-8', topic: 'functions', type: 'output', difficulty: 'challenge', skill: 'problem', exam: true,
      objective: 'Nested calls', prompt: 'What does this print?',
      code: pas`
program Nested;

function Add(a, b : integer) : integer;
begin
  Add := a + b;
end;

function Twice(n : integer) : integer;
begin
  Twice := n * 2;
end;

begin
  writeln(Twice(Add(3, 4)));
  writeln(Add(Twice(1), Twice(5)));
end.
`,
      answer: '14\n12', hints: ['Work from the inside out.'], explanation: 'Twice(7) = 14; Add(2, 10) = 12.',
    },
  ],
  boss: {
    id: 'boss-u8',
    unit: 'u8',
    title: 'The Geometry Toolkit',
    emoji: 'compass',
    story: 'The maths department wants a reusable toolkit. Build it from procedures and functions so any program can use it.',
    stages: [
      {
        title: 'Circle functions',
        prompt: 'Using `PI = 22/7`, write functions `Area(r : real) : real` and `Circumference(r : real) : real`. Read a radius and print `Area = ` and `Circumference = ` (2 decimal places).',
        starter: pas`
program CircleTools;
const
  PI = 22/7;
var
  radius : real;

begin
  readln(radius);

end.
`,
        tests: [{ inputs: ['7'], expect: ['Area = 154.00', 'Circumference = 44.00'] }, { inputs: ['3.5'], expect: ['Area = 38.50', 'Circumference = 22.00'] }],
        requires: [{ pattern: 'function\\s+Area', message: 'Write a function called Area.' }, { pattern: 'function\\s+Circumference', message: 'Write a function called Circumference.' }],
        hints: ['Area := PI * r * r;', 'Circumference := 2 * PI * r;', "writeln('Area = ', Area(radius):0:2);"],
        solution: pas`
program CircleTools;
const
  PI = 22/7;
var
  radius : real;

function Area(r : real) : real;
begin
  Area := PI * r * r;
end;

function Circumference(r : real) : real;
begin
  Circumference := 2 * PI * r;
end;

begin
  readln(radius);
  writeln('Area = ', Area(radius):0:2);
  writeln('Circumference = ', Circumference(radius):0:2);
end.
`,
      },
      {
        title: 'Read with a procedure',
        prompt: 'Write a procedure `GetSides(var l, w : integer)` that reads a length and width. The main program then prints `Perimeter: ` and `Area: ` of the rectangle.',
        starter: pas`
program RectTools;
var
  len, wid : integer;

begin
  GetSides(len, wid);

end.
`,
        tests: [{ inputs: ['5', '3'], expect: ['Perimeter: 16', 'Area: 15'] }, { inputs: ['10', '2'], expect: ['Perimeter: 24', 'Area: 20'] }],
        requires: [{ pattern: 'procedure\\s+GetSides\\s*\\(\\s*var', message: 'GetSides needs var parameters so it can fill in len and wid.' }],
        hints: ['procedure GetSides(var l, w : integer); begin readln(l); readln(w); end;', 'Perimeter = 2 * (len + wid).'],
        solution: pas`
program RectTools;
var
  len, wid : integer;

procedure GetSides(var l, w : integer);
begin
  readln(l);
  readln(w);
end;

begin
  GetSides(len, wid);
  writeln('Perimeter: ', 2 * (len + wid));
  writeln('Area: ', len * wid);
end.
`,
      },
      {
        title: 'Largest of three',
        prompt: 'Write `function Max2(a, b : integer) : integer`, then use it **twice** to print the largest of three numbers read from the user: `Largest: `.',
        starter: pas`
program Biggest;
var
  x, y, z : integer;

begin
  readln(x);
  readln(y);
  readln(z);

end.
`,
        tests: [{ inputs: ['3', '9', '4'], expect: ['Largest: 9'] }, { inputs: ['10', '2', '7'], expect: ['Largest: 10'] }, { inputs: ['1', '2', '30'], expect: ['Largest: 30'] }],
        requires: [{ pattern: 'Max2\\s*\\(\\s*Max2|Max2\\s*\\([^)]*,\\s*Max2', message: 'Use Max2 twice, e.g. Max2(Max2(x, y), z).' }],
        hints: ['Max2 returns the bigger of two.', 'The largest of three is Max2(Max2(x, y), z).'],
        solution: pas`
program Biggest;
var
  x, y, z : integer;

function Max2(a, b : integer) : integer;
begin
  if a > b then
    Max2 := a
  else
    Max2 := b;
end;

begin
  readln(x);
  readln(y);
  readln(z);
  writeln('Largest: ', Max2(Max2(x, y), z));
end.
`,
      },
    ],
  },
};

export default mod;
