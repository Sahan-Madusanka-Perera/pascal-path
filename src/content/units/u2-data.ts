import type { UnitModule } from '../index';
import { pas } from '../util';

const mod: UnitModule = {
  unit: {
    id: 'u2',
    title: 'Data & Variables',
    subtitle: 'Data types, storage boxes, input and output',
    hue: 'blue',
    icon: 'box',
    topics: ['datatypes', 'variables', 'io'],
    boss: 'boss-u2',
  },
  topics: [
    // ---------------------------------------------------------------- datatypes
    {
      id: 'datatypes',
      unit: 'u2',
      title: 'Data Types',
      short: 'integer, real, char, string and boolean',
      source: 'Tute §4',
      minutes: 10,
      objectives: [
        'Name the 5 standard data types',
        'Choose the right type for a value',
        'Format real numbers with :0:2',
      ],
      lesson: [
        {
          kind: 'concept',
          title: 'Every value has a type',
          body: `A **data type** tells Pascal what kind of value a variable can hold — like saying "this box can only hold toys" or "this box can only hold books".

- \`integer\` — whole numbers: \`16\`, \`-5\`, \`450\`
- \`real\` — decimal numbers: \`5.8\`, \`87.5\`
- \`char\` — exactly **one** character: \`'A'\`
- \`string\` — text: \`'Kamal Perera'\`
- \`boolean\` — only \`TRUE\` or \`FALSE\``,
        },
        { kind: 'visual', title: 'Sort the values into boxes', body: 'Each box (data type) only accepts one kind of value.', visual: 'data-boxes' },
        {
          kind: 'example',
          title: 'All five types together',
          code: pas`
program DataTypesDemo;
var
  studentName : string;
  age : integer;
  height : real;
  isPassed : boolean;
  grade : char;
begin
  studentName := 'Nimal Silva';
  age := 16;
  height := 5.6;
  isPassed := true;
  grade := 'A';
  writeln('Name: ', studentName);
  writeln('Age: ', age, ' years');
  writeln('Height: ', height:0:1, ' feet');
  writeln('Passed: ', isPassed);
  writeln('Grade: ', grade);
end.
`,
          notes: [
            { line: 3, text: 'Each variable is declared with its type after a colon.' },
            { line: 10, text: 'Text (string) values go inside single quotes.' },
            { line: 16, text: '`height:0:1` prints the real number with 1 decimal place.' },
            { line: 17, text: 'Booleans print as `TRUE` or `FALSE` in capitals.' },
          ],
        },
        {
          kind: 'concept',
          title: 'Making real numbers look nice',
          body: `If you print a real with plain \`writeln(price)\`, Pascal uses scientific notation like \` 1.2507500000000000E+003\`.

Add **:0:2** to choose the number of decimal places:
- \`writeln(price:0:2)\` → \`1250.75\`
- \`writeln(average:0:1)\` → \`87.5\`

The first number is the width (0 = just as wide as needed), the second is the decimal places.`,
          callout: { kind: 'exam', text: 'Integer range in standard Pascal is about −32,768 to 32,767.' },
        },
        { kind: 'check', question: 'dt-2' },
        {
          kind: 'try',
          title: 'Format the price',
          body: 'Change the `writeln` so the price prints as `Price: Rs. 1250.75` (2 decimal places).',
          starter: pas`
program Price;
var
  price : real;
begin
  price := 1250.75;
  writeln('Price: Rs. ', price);
end.
`,
          tests: [{ expect: ['Price: Rs. 1250.75'] }],
          hints: ['Add :0:2 straight after the variable name inside writeln.', "writeln('Price: Rs. ', price:0:2);"],
          solution: pas`
program Price;
var
  price : real;
begin
  price := 1250.75;
  writeln('Price: Rs. ', price:0:2);
end.
`,
        },
        {
          kind: 'concept',
          title: 'char needs quotes',
          body: 'A `char` stores exactly one character, and it must be in single quotes.',
          code: pas`
grade := A;     { WRONG - Pascal thinks A is a variable }
grade := 'A';   { CORRECT }
`,
          callout: { kind: 'mistake', text: "`'7'` (in quotes) is a **char**, not a number. You can't do maths with it." },
        },
        { kind: 'check', question: 'dt-5' },
      ],
      revision: {
        what: 'A data type defines what kind of value a variable stores: `integer`, `real`, `char`, `string` or `boolean`.',
        why: 'Pascal needs to know how much memory to use and which operations are allowed on each value.',
        syntax: pas`
var
  age : integer;      { 16 }
  height : real;      { 5.8 }
  grade : char;       { 'A' }
  name : string;      { 'Kamal' }
  isPassed : boolean; { true }
`,
        example: {
          code: pas`
program Types;
var
  average : real;
begin
  average := 87.5;
  writeln('Average: ', average:0:1, '%');
end.
`,
          output: 'Average: 87.5%',
        },
        mistakes: ["Forgetting quotes around chars and strings: `grade := A;`", 'Using double quotes `"Kamal"`', 'Printing a real without `:0:2` gives scientific notation.'],
        examPoints: ['Know which type suits a value (e.g. marks average → real, number of students → integer).', 'char = ONE character; string = text.', 'boolean holds only TRUE or FALSE.'],
        keyTerms: [
          { term: 'Data type', def: 'What kind of value a variable can hold.' },
          { term: 'integer', def: 'Whole numbers (about −32768 to 32767 in standard Pascal).' },
          { term: 'real', def: 'Numbers with a decimal part.' },
          { term: 'char', def: 'A single character in single quotes.' },
          { term: 'string', def: 'Text made of many characters.' },
          { term: 'boolean', def: 'A TRUE/FALSE value.' },
        ],
        mini: 'dt-1',
      },
    },
    // ---------------------------------------------------------------- variables
    {
      id: 'variables',
      unit: 'u2',
      title: 'Variables & Constants',
      short: 'Storage boxes that change (or never change)',
      source: 'Tute §5',
      minutes: 10,
      objectives: ['Declare variables and give them values with :=', 'Explain how a variable changes', 'Declare and use constants'],
      lesson: [
        {
          kind: 'concept',
          title: 'Variables are labelled boxes',
          body: `A **variable** is a storage box with a label. The **content can change**, but the label stays the same.

Think of your water bottle: the bottle (variable) stays the same, but the amount of water (value) keeps changing.

You store a value with the **assignment operator** \`:=\` (read it as "becomes"):`,
          code: 'score := 10;   { score becomes 10 }',
        },
        { kind: 'visual', title: 'Watch the box change', visual: 'variable-box' },
        {
          kind: 'watch',
          title: 'Watch it run',
          body: 'Press **Play**. Watch the `score` box: the old value is replaced each time.',
          code: pas`
program VariableExample;
var
  score : integer;
begin
  score := 10;
  writeln('Initial score: ', score);
  score := 20;
  writeln('Updated score: ', score);
  score := score + 5;
  writeln('Final score: ', score);
end.
`,
        },
        {
          kind: 'concept',
          title: 'score := score + 5',
          body: `This line looks strange in maths, but in programming it means:

1. Take the **current** value of \`score\` (20)
2. Add 5 → 25
3. Store the answer **back into** \`score\`

The right side is always worked out first.`,
          callout: { kind: 'mistake', text: '`age = 16;` is wrong. `=` compares, `:=` stores.' },
        },
        { kind: 'check', question: 'var-3' },
        {
          kind: 'concept',
          title: 'Constants never change',
          body: `A **constant** is a permanent label: once set, it never changes. Declare constants in a \`const\` section, using \`=\` (not \`:=\`).

Real-life constants: days in a week (7), PI (3.14159), the pass mark (50).`,
          code: pas`
const
  PI = 3.14159;
  DAYS_IN_WEEK = 7;
  PASS_MARK = 50;
`,
          callout: { kind: 'tip', text: 'Write constant names in CAPITAL LETTERS so they are easy to spot.' },
        },
        {
          kind: 'try',
          title: 'Area of a circle',
          body: 'Complete the program so it calculates `area := PI * radius * radius` and prints `Area: 78.54` for radius 5.',
          starter: pas`
program Circle;
const
  PI = 3.14159;
var
  radius, area : real;
begin
  radius := 5;

  writeln('Area: ', area:0:2);
end.
`,
          tests: [{ expect: ['Area: 78.54'] }],
          hints: ['Add one assignment statement before the writeln.', 'area := PI * radius * radius;'],
          solution: pas`
program Circle;
const
  PI = 3.14159;
var
  radius, area : real;
begin
  radius := 5;
  area := PI * radius * radius;
  writeln('Area: ', area:0:2);
end.
`,
        },
        { kind: 'check', question: 'var-6' },
      ],
      revision: {
        what: 'A **variable** is a named storage location whose value can change. A **constant** is a named value that never changes.',
        why: 'Variables let programs remember and update data. Constants make fixed values (like PI) easy to read and change in one place.',
        syntax: pas`
const
  PASS_MARK = 50;      { constant uses = }
var
  score : integer;
begin
  score := 10;         { assignment uses := }
  score := score + 5;
end.
`,
        mistakes: ['Using `=` instead of `:=` in an assignment.', 'Trying to change a constant: `PI := 3;`', 'Using a variable before giving it a value.'],
        examPoints: ['`:=` is the assignment operator.', 'Constants are declared in `const` with `=`; variables in `var` with `:` and a type.', 'In `x := x + 1`, the right side is worked out first.'],
        keyTerms: [
          { term: 'Variable', def: 'A named storage box whose value can change.' },
          { term: 'Constant', def: 'A named value that never changes during the program.' },
          { term: 'Assignment', def: 'Storing a value in a variable using :=' },
        ],
        mini: 'var-1',
      },
    },
    // ---------------------------------------------------------------- io
    {
      id: 'io',
      unit: 'u2',
      title: 'Input & Output',
      short: 'write, writeln and readln',
      source: 'Tute §6',
      minutes: 10,
      objectives: ['Use write and writeln correctly', 'Read input with readln', 'Write an input → process → output program'],
      lesson: [
        {
          kind: 'concept',
          title: 'Two ways to print',
          body: `- \`writeln\` prints, then moves to a **new line**
- \`write\` prints and **stays on the same line**

\`writeln;\` on its own prints an empty line.`,
        },
        { kind: 'visual', title: 'See the difference', body: 'Add statements and watch where the cursor goes.', visual: 'write-vs-writeln' },
        { kind: 'check', question: 'io-1' },
        {
          kind: 'concept',
          title: 'Getting input with readln',
          body: `\`readln(variable)\` waits for the user to type something and press Enter, then stores it in the variable.

Use \`write\` for the question so the answer is typed on the same line:`,
          code: pas`
write('Enter your age: ');
readln(age);
`,
        },
        {
          kind: 'example',
          title: 'A program that talks to you',
          body: 'Press **Run**, then type your answers in the output box and press Enter.',
          inputs: ['Dilini', '16'],
          code: pas`
program InputDemo;
var
  name : string;
  age : integer;
begin
  write('Enter your name: ');
  readln(name);
  write('Enter your age: ');
  readln(age);
  writeln;
  writeln('Hello ', name, '!');
  writeln('Next year you will be ', age + 1);
end.
`,
        },
        {
          kind: 'try',
          title: 'Rectangle area',
          body: 'Write a program that reads the **length** and **width** of a rectangle and prints `Area = ` followed by the area. (Test: length 6, width 4 → `Area = 24`)',
          starter: pas`
program Rectangle;
var
  len, wid, area : integer;
begin

end.
`,
          tests: [{ inputs: ['6', '4'], expect: ['Area = 24'] }, { inputs: ['10', '3'], expect: ['Area = 30'] }],
          hints: ['Use readln twice: once for len, once for wid.', 'Then area := len * wid;', "Print it: writeln('Area = ', area);"],
          solution: pas`
program Rectangle;
var
  len, wid, area : integer;
begin
  write('Length: ');
  readln(len);
  write('Width: ');
  readln(wid);
  area := len * wid;
  writeln('Area = ', area);
end.
`,
        },
        { kind: 'check', question: 'io-6' },
      ],
      revision: {
        what: '`write`/`writeln` display output; `readln` reads input from the keyboard into a variable.',
        why: 'Programs follow Input → Process → Output: get data, work on it, show the result.',
        syntax: pas`
write('Prompt: ');    { stays on this line }
readln(variable);     { waits for input }
writeln('Result: ', variable);
writeln;              { empty line }
`,
        mistakes: ['Using writeln for prompts (the answer appears on the next line — not wrong, but untidy).', "Forgetting the comma between items: `writeln('Age' age)`", 'Typing letters when the program reads an integer causes a runtime error.'],
        examPoints: ['Know the difference between write and writeln.', 'Be able to predict exactly how output appears on screen.'],
        keyTerms: [
          { term: 'writeln', def: 'Print, then move to a new line.' },
          { term: 'write', def: 'Print and stay on the same line.' },
          { term: 'readln', def: 'Read a value typed by the user into a variable.' },
        ],
        mini: 'io-2',
      },
    },
  ],
  questions: [
    // ---------- datatypes
    {
      id: 'dt-1', topic: 'datatypes', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Choose a data type', prompt: 'Which data type is best for storing a student\'s **average mark** like `72.5`?',
      codeOptions: true, options: ['integer', 'real', 'char', 'boolean'], answer: 1,
      why: ['integer can only hold whole numbers.', '', 'char holds one character.', 'boolean holds only TRUE/FALSE.'],
      hints: ['Does the value have a decimal point?'], explanation: '72.5 has a decimal part, so it needs `real`.',
    },
    {
      id: 'dt-2', topic: 'datatypes', type: 'categorize', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Match values to types', prompt: 'Sort each value into its data type.',
      categories: ['integer', 'real', 'char', 'string', 'boolean'], codeItems: true,
      items: [
        { text: '450', category: 0 }, { text: '-5', category: 0 }, { text: '5.8', category: 1 }, { text: "'Y'", category: 2 },
        { text: "'Ananda College'", category: 3 }, { text: 'FALSE', category: 4 }, { text: '87.5', category: 1 },
      ],
      hints: ['Decimal point → real.', 'One character in quotes → char; more → string.'], explanation: 'Whole numbers are integer, decimals are real, one quoted character is char, quoted text is string, TRUE/FALSE is boolean.',
    },
    {
      id: 'dt-3', topic: 'datatypes', type: 'output', difficulty: 'practice', skill: 'problem', exam: true,
      objective: 'Formatting reals', prompt: 'What does this program print?',
      code: pas`
program Fmt;
var
  height, price : real;
begin
  height := 5.8;
  price := 1250.75;
  writeln('Height: ', height:0:2, ' feet');
  writeln('Price: ', price:0:1);
end.
`,
      answer: 'Height: 5.80 feet\nPrice: 1250.8',
      hints: [':0:2 means 2 decimal places.', 'With 1 decimal place, 1250.75 is rounded.'], explanation: '`5.8` with 2 decimals is `5.80`; `1250.75` rounded to 1 decimal is `1250.8`.',
    },
    {
      id: 'dt-4', topic: 'datatypes', type: 'output', difficulty: 'easy', skill: 'problem',
      objective: 'Boolean output', prompt: 'What does this print?',
      code: pas`
program Bools;
var
  isRaining : boolean;
begin
  isRaining := false;
  writeln('Raining: ', isRaining);
end.
`,
      answer: 'Raining: FALSE', hints: ['Pascal prints booleans in capital letters.'], explanation: 'Booleans are printed as `TRUE` or `FALSE`.',
    },
    {
      id: 'dt-5', topic: 'datatypes', type: 'spot', difficulty: 'easy', skill: 'coding',
      objective: 'char needs quotes', prompt: 'Click the line with the mistake.',
      code: pas`
program Grades;
var
  grade : char;
begin
  grade := A;
  writeln('Grade: ', grade);
end.
`,
      lines: [5], hints: ['How is a single character written in Pascal?'], explanation: "`grade := A;` should be `grade := 'A';` — characters need single quotes.",
    },
    {
      id: 'dt-6', topic: 'datatypes', type: 'fix', difficulty: 'practice', skill: 'coding',
      objective: 'Fix type errors', prompt: 'Fix the program so it prints the student\'s details.',
      code: pas`
program Student;
var
  name : string;
  age : integer;
  average : integer;
begin
  name := "Kamal";
  age := 16;
  average := 72.5;
  writeln(name, ' ', age, ' ', average:0:1);
end.
`,
      tests: [{ expect: ['Kamal 16 72.5'] }],
      hints: ['Run it and read the first error.', 'Strings need single quotes.', '72.5 is not a whole number — which type should average be?'],
      solution: pas`
program Student;
var
  name : string;
  age : integer;
  average : real;
begin
  name := 'Kamal';
  age := 16;
  average := 72.5;
  writeln(name, ' ', age, ' ', average:0:1);
end.
`,
      explanation: 'Use single quotes for the string and declare `average` as `real`.',
    },
    {
      id: 'dt-7', topic: 'datatypes', type: 'mcq', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'Integer range', prompt: 'In standard Pascal, which value is **too big** for an `integer`?',
      options: ['32000', '-150', '50000', '0'], answer: 2,
      why: ['32000 is within −32768..32767.', 'Negative whole numbers are fine.', '', '0 is a valid integer.'],
      hints: ['The range is about −32,768 to 32,767.'], explanation: 'Standard Pascal integers go up to 32,767, so 50000 is too large.',
    },
    {
      id: 'dt-8', topic: 'datatypes', type: 'match', difficulty: 'practice', skill: 'concept',
      objective: 'Types for real-world data', prompt: 'Match each piece of information with the best data type.',
      pairs: [['Number of students in a class', 'integer'], ['Price of a book (Rs. 450.50)', 'real'], ["A student's grade ('A')", 'char'], ["A student's full name", 'string'], ['Has the fee been paid?', 'boolean']],
      hints: ['Ask: is it a whole number, decimal, one letter, text or yes/no?'], explanation: 'Count → integer, money with cents → real, a letter → char, a name → string, yes/no → boolean.',
    },
    {
      id: 'dt-9', topic: 'datatypes', type: 'write', difficulty: 'challenge', skill: 'coding',
      objective: 'Declare and print all types', prompt: `Write a program that stores and prints these details exactly:

\`\`\`
Name: Nimal Silva
Age: 16
Height: 5.6
Passed: TRUE
Grade: A
\`\`\`
Use a variable of the correct type for each.`,
      starter: pas`
program Info;
var

begin

end.
`,
      tests: [{ exact: 'Name: Nimal Silva\nAge: 16\nHeight: 5.6\nPassed: TRUE\nGrade: A' }],
      requires: [{ pattern: ':\\s*real', message: 'Store the height in a `real` variable.' }, { pattern: ':\\s*boolean', message: 'Store "Passed" in a `boolean` variable.' }, { pattern: ':\\s*char', message: 'Store the grade in a `char` variable.' }],
      hints: ['Declare five variables: string, integer, real, boolean, char.', 'Print the height with :0:1.', 'A boolean prints as TRUE when its value is true.'],
      solution: pas`
program Info;
var
  name : string;
  age : integer;
  height : real;
  passed : boolean;
  grade : char;
begin
  name := 'Nimal Silva';
  age := 16;
  height := 5.6;
  passed := true;
  grade := 'A';
  writeln('Name: ', name);
  writeln('Age: ', age);
  writeln('Height: ', height:0:1);
  writeln('Passed: ', passed);
  writeln('Grade: ', grade);
end.
`,
      explanation: 'One variable of each type, and `:0:1` to format the real.',
    },
    {
      id: 'dt-10', topic: 'datatypes', type: 'mcq', difficulty: 'challenge', skill: 'concept', exam: true,
      objective: 'char vs string', prompt: "Which assignment is **invalid** if `c` is declared as `char`?",
      codeOptions: true, options: ["c := 'B';", "c := '7';", "c := 'AB';", "c := ' ';"], answer: 2,
      why: ['One character — valid.', "'7' is one character — valid.", '', 'A space is one character — valid.'],
      hints: ['How many characters can a char hold?'], explanation: "`'AB'` has two characters, so it is a string, not a char.",
    },
    // ---------- variables
    {
      id: 'var-1', topic: 'variables', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Assignment operator', prompt: 'Which statement correctly stores 16 in the variable `age`?',
      codeOptions: true, options: ['age = 16;', 'age := 16;', '16 := age;', 'age == 16;'], answer: 1,
      why: ['`=` is for comparing, not storing.', '', 'The variable must be on the left.', '`==` is not used in Pascal.'],
      hints: ['Pascal\'s assignment operator has two characters.'], explanation: '`:=` is the assignment operator: `age := 16;`',
    },
    {
      id: 'var-2', topic: 'variables', type: 'output', difficulty: 'easy', skill: 'problem', exam: true,
      objective: 'Trace assignments', prompt: 'What does this program print?',
      code: pas`
program Scores;
var
  score : integer;
begin
  score := 10;
  score := 20;
  score := score + 5;
  writeln(score);
end.
`,
      answer: '25', hints: ['The second assignment replaces the first value.'], explanation: '10 is replaced by 20, then 20 + 5 = 25.',
    },
    {
      id: 'var-3', topic: 'variables', type: 'trace', difficulty: 'practice', skill: 'problem', exam: true,
      objective: 'Trace variable values', prompt: 'Fill in the value of each variable **after** each line runs.',
      code: pas`
a := 5;
b := a + 3;
a := b * 2;
b := a - b;
`,
      columns: ['a', 'b'], rowLabel: 'Line',
      rows: [['5', '{?}'], ['{5}', '8'], ['16', '{8}'], ['{16}', '8']],
      hints: ['Only one variable changes on each line.', 'Line 3: a becomes 8 × 2.'], explanation: 'a=5; b=8; a=16; b=16−8=8.',
    },
    {
      id: 'var-4', topic: 'variables', type: 'fill', difficulty: 'easy', skill: 'coding',
      objective: 'Write declarations', prompt: 'Complete the declarations.',
      code: pas`
program Shop;
[[0]]
  VAT = 0.18;
[[1]]
  price : [[2]];
begin
  price := 250.50;
end.
`,
      blanks: [{ accept: ['const'], width: 6 }, { accept: ['var'], width: 4 }, { accept: ['real'], width: 6 }],
      hints: ['Fixed values go in one section, changing values in another.', '250.50 is a decimal number.'], explanation: '`const` for VAT, `var` for price, and price is `real`.',
    },
    {
      id: 'var-5', topic: 'variables', type: 'spot', difficulty: 'practice', skill: 'coding',
      objective: 'Constants can\'t change', prompt: 'Which line causes an error?',
      code: pas`
program Pass;
const
  PASS_MARK = 50;
var
  marks : integer;
begin
  marks := 65;
  PASS_MARK := 40;
  writeln(marks >= PASS_MARK);
end.
`,
      lines: [8], hints: ['What is special about the const section?'], explanation: 'A constant\'s value can never be changed, so `PASS_MARK := 40;` is an error.',
    },
    {
      id: 'var-6', topic: 'variables', type: 'mcq', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'Variables vs constants', prompt: 'Which value should be declared as a **constant**?',
      options: ['A student\'s marks', 'The number of days in a week', 'A running total', 'The user\'s name'], answer: 1,
      why: ['Marks differ for each student.', '', 'A total keeps changing.', 'It depends on who uses the program.'],
      hints: ['Which one never changes?'], explanation: 'Days in a week is always 7 — perfect for a constant.',
    },
    {
      id: 'var-7', topic: 'variables', type: 'output', difficulty: 'challenge', skill: 'problem', exam: true,
      objective: 'Swap values', prompt: 'What does this program print?',
      code: pas`
program Swap;
var
  x, y, temp : integer;
begin
  x := 3;
  y := 9;
  temp := x;
  x := y;
  y := temp;
  writeln(x, ' ', y);
end.
`,
      answer: '9 3', hints: ['temp saves the old value of x before it is overwritten.'], explanation: 'The values are swapped using `temp`: x = 9, y = 3.',
    },
    {
      id: 'var-8', topic: 'variables', type: 'write', difficulty: 'practice', skill: 'coding',
      objective: 'Use a constant', prompt: 'A class has `STUDENTS = 35` (a constant). Each student pays Rs. 150 for a trip. Write a program that prints `Total: 5250`.',
      starter: pas`
program Trip;
const
  STUDENTS = 35;
var
  total : integer;
begin

end.
`,
      tests: [{ expect: ['Total: 5250'] }],
      requires: [{ pattern: 'STUDENTS\\s*\\*|\\*\\s*STUDENTS', message: 'Calculate the total using the constant STUDENTS.' }],
      hints: ['total := STUDENTS * 150;', "Then writeln('Total: ', total);"],
      solution: pas`
program Trip;
const
  STUDENTS = 35;
var
  total : integer;
begin
  total := STUDENTS * 150;
  writeln('Total: ', total);
end.
`,
      explanation: 'Multiply the constant by the price and print the result.',
    },
    {
      id: 'var-9', topic: 'variables', type: 'arrange', difficulty: 'practice', skill: 'coding',
      objective: 'Order of statements', prompt: 'Arrange the lines to swap the values of `a` and `b`.',
      fixedTop: ['program SwapAB;', 'var a, b, t : integer;', 'begin', '  a := 1;', '  b := 2;'],
      fixedBottom: ["  writeln(a, ' ', b);", 'end.'],
      lines: ['  t := a;', '  a := b;', '  b := t;'],
      tests: [{ exact: '2 1' }],
      hints: ['Save a before you overwrite it.'], explanation: 'Save `a` in `t`, copy `b` into `a`, then put `t` into `b`.',
    },
    {
      id: 'var-10', topic: 'variables', type: 'trace', difficulty: 'challenge', skill: 'problem',
      objective: 'Trace with constants', prompt: 'Trace the values after each line.',
      code: pas`
const RATE = 2;
x := 4;
y := x * RATE;
x := x + y;
y := y - x div 2;
`,
      columns: ['x', 'y'], rowLabel: 'Line',
      rows: [['4', '{?}'], ['{4}', '8'], ['12', '{8}'], ['{12}', '2']],
      hints: ['RATE is always 2.', 'div is worked out before the subtraction.'], explanation: 'x=4, y=8, x=12, y = 8 − (12 div 2) = 2.',
    },
    // ---------- io
    {
      id: 'io-1', topic: 'io', type: 'output', difficulty: 'easy', skill: 'problem', exam: true,
      objective: 'write vs writeln', prompt: 'What does this program print?',
      code: pas`
program Out;
begin
  write('Hello ');
  write('World');
  writeln('!');
  writeln('Pascal');
end.
`,
      answer: 'Hello World!\nPascal', hints: ['write stays on the same line.'], explanation: 'The two `write`s and the first `writeln` share one line; then `Pascal` is on the next line.',
    },
    {
      id: 'io-2', topic: 'io', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Purpose of readln', prompt: 'What does `readln(age);` do?',
      options: ['Prints the value of age', 'Waits for the user to type a value and stores it in age', 'Deletes the variable age', 'Reads a file called age'], answer: 1,
      why: ['That is writeln.', '', 'Nothing is deleted.', 'It reads from the keyboard.'],
      hints: ['read = input.'], explanation: '`readln` reads input from the keyboard into the variable.',
    },
    {
      id: 'io-3', topic: 'io', type: 'output', difficulty: 'practice', skill: 'problem',
      objective: 'Predict output with input', prompt: 'The user types `7`. What appears? (Only show what the program prints.)',
      code: pas`
program Twice;
var
  n : integer;
begin
  readln(n);
  writeln(n, ' x 2 = ', n * 2);
  writeln;
  writeln('Done');
end.
`,
      inputs: ['7'], answer: '7 x 2 = 14\n\nDone',
      hints: ['writeln; on its own prints an empty line.'], explanation: 'The second line is empty because of `writeln;`.',
    },
    {
      id: 'io-4', topic: 'io', type: 'arrange', difficulty: 'easy', skill: 'coding',
      objective: 'Input → process → output', prompt: 'Arrange the lines: ask for a number, read it, and print its square.',
      fixedTop: ['program Square;', 'var n : integer;', 'begin'], fixedBottom: ['end.'],
      lines: ["  write('Enter a number: ');", '  readln(n);', "  writeln('Square: ', n * n);"],
      tests: [{ inputs: ['5'], expect: ['Square: 25'] }],
      hints: ['You must read the number before you can use it.'], explanation: 'Prompt → read → calculate and print.',
    },
    {
      id: 'io-5', topic: 'io', type: 'fix', difficulty: 'practice', skill: 'coding',
      objective: 'Fix an I/O program', prompt: 'This program should read a name and print `Hello, <name>!`. Fix it.',
      code: pas`
program Greet;
var
  name : string;
begin
  write('Your name: ');
  writeln(name);
  writeln('Hello, ' name '!');
end.
`,
      tests: [{ inputs: ['Sahan'], expect: ['Hello, Sahan!'] }],
      hints: ['Which command READS input?', 'Items inside writeln are separated by commas.'],
      solution: pas`
program Greet;
var
  name : string;
begin
  write('Your name: ');
  readln(name);
  writeln('Hello, ', name, '!');
end.
`,
      explanation: 'Use `readln(name)` to read, and separate the items in writeln with commas.',
    },
    {
      id: 'io-6', topic: 'io', type: 'write', difficulty: 'practice', skill: 'coding', exam: true,
      objective: 'Celsius to Fahrenheit', prompt: 'Write a program that reads a temperature in Celsius and prints the Fahrenheit value with 1 decimal place. Formula: `F = C * 9 / 5 + 32`. (Input 25 → `77.0`)',
      starter: pas`
program Temperature;
var
  c, f : real;
begin

end.
`,
      tests: [{ inputs: ['25'], expect: ['77.0'] }, { inputs: ['0'], expect: ['32.0'] }, { inputs: ['37.5'], expect: ['99.5'] }],
      hints: ['readln(c);', 'f := c * 9 / 5 + 32;', 'writeln(f:0:1);'],
      solution: pas`
program Temperature;
var
  c, f : real;
begin
  write('Celsius: ');
  readln(c);
  f := c * 9 / 5 + 32;
  writeln('Fahrenheit: ', f:0:1);
end.
`,
      explanation: 'Read → calculate with the formula → print with `:0:1`.',
    },
    {
      id: 'io-7', topic: 'io', type: 'write', difficulty: 'challenge', skill: 'problem',
      objective: 'Multiple inputs', prompt: 'Write a program that reads **three** marks and prints `Total: ` and `Average: ` (average with 2 decimal places). (70, 85, 90 → Total: 245, Average: 81.67)',
      starter: pas`
program ThreeMarks;
var
  m1, m2, m3, total : integer;
  avg : real;
begin

end.
`,
      tests: [{ inputs: ['70', '85', '90'], expect: ['Total: 245', 'Average: 81.67'] }, { inputs: ['50', '50', '51'], expect: ['Total: 151', 'Average: 50.33'] }],
      hints: ['Read the three marks with readln.', 'avg := total / 3; — the result is real.', 'Print avg with :0:2.'],
      solution: pas`
program ThreeMarks;
var
  m1, m2, m3, total : integer;
  avg : real;
begin
  readln(m1);
  readln(m2);
  readln(m3);
  total := m1 + m2 + m3;
  avg := total / 3;
  writeln('Total: ', total);
  writeln('Average: ', avg:0:2);
end.
`,
      explanation: 'Add the marks for the total, divide by 3 for the average.',
    },
    {
      id: 'io-8', topic: 'io', type: 'mcq', difficulty: 'practice', skill: 'concept',
      objective: 'Choose write for prompts', prompt: 'Why do we usually use `write` (not `writeln`) for an input prompt like `Enter age: `?',
      options: ['write is faster', 'So the user types the answer on the same line as the question', 'writeln cannot print text', 'readln only works after write'], answer: 1,
      why: ['Speed is not the reason.', '', 'writeln prints text fine.', 'readln works after either.'],
      hints: ['Where does the cursor go after each?'], explanation: '`write` keeps the cursor on the same line, so the answer appears next to the question.',
    },
    {
      id: 'io-9', topic: 'io', type: 'output', difficulty: 'challenge', skill: 'problem', exam: true,
      objective: 'Mixed write/writeln', prompt: 'What does this print?',
      code: pas`
program Pattern;
begin
  write('*');
  writeln('*');
  write('**');
  write('*');
  writeln;
  writeln('*');
end.
`,
      answer: '**\n***\n*', hints: ['Track where each new line starts.'], explanation: 'Line 1: `**`, line 2: `***`, line 3: `*`.',
    },
  ],
  boss: {
    id: 'boss-u2',
    unit: 'u2',
    title: 'The Student ID Card',
    emoji: 'idcard',
    story: 'The school office needs a program that prints ID cards. Collect the details, store them in the right types, and print a neat card.',
    stages: [
      {
        title: 'Collect the details',
        prompt: 'Read a student\'s **name** (string) and **age** (integer), then print `Name: <name>` and `Age: <age>` on separate lines.',
        starter: pas`
program IDCard;
var
  name : string;
  age : integer;
begin

end.
`,
        tests: [{ inputs: ['Nimal Silva', '16'], expect: ['Name: Nimal Silva', 'Age: 16'] }],
        hints: ['Use readln(name); and readln(age);', 'Print each with writeln.'],
        solution: pas`
program IDCard;
var
  name : string;
  age : integer;
begin
  readln(name);
  readln(age);
  writeln('Name: ', name);
  writeln('Age: ', age);
end.
`,
      },
      {
        title: 'Add height and house',
        prompt: 'Also read **height** (real, e.g. 5.6) and **house** letter (char, e.g. `R`). Print `Height: 5.6 ft` (1 decimal place) and `House: R`.',
        starter: pas`
program IDCard2;
var
  height : real;
  house : char;
begin

end.
`,
        tests: [{ inputs: ['5.6', 'R'], expect: ['Height: 5.6 ft', 'House: R'] }, { inputs: ['6', 'G'], expect: ['Height: 6.0 ft', 'House: G'] }],
        hints: ['Format the real with :0:1.', "writeln('Height: ', height:0:1, ' ft');"],
        solution: pas`
program IDCard2;
var
  height : real;
  house : char;
begin
  readln(height);
  readln(house);
  writeln('Height: ', height:0:1, ' ft');
  writeln('House: ', house);
end.
`,
      },
      {
        title: 'Print the card',
        prompt: `Read a name and year of birth, then print exactly:

\`\`\`
==== ID CARD ====
Name: <name>
Age in 2026: <age>
=================
\`\`\`
(Use a constant \`YEAR = 2026\`.)`,
        starter: pas`
program Card;
const
  YEAR = 2026;
var
  name : string;
  born : integer;
begin

end.
`,
        tests: [{ inputs: ['Dilini', '2010'], exact: '==== ID CARD ====\nName: Dilini\nAge in 2026: 16\n=================' }],
        requires: [{ pattern: 'YEAR\\s*-', message: 'Calculate the age using the constant YEAR.' }],
        hints: ['Age is YEAR - born.', "Don't print input prompts in this stage — the output must match the card exactly."],
        solution: pas`
program Card;
const
  YEAR = 2026;
var
  name : string;
  born : integer;
begin
  readln(name);
  readln(born);
  writeln('==== ID CARD ====');
  writeln('Name: ', name);
  writeln('Age in 2026: ', YEAR - born);
  writeln('=================');
end.
`,
      },
    ],
  },
};

export default mod;
