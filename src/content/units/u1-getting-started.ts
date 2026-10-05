import type { UnitModule } from '../index';
import { pas } from '../util';

const HELLO = pas`
program HelloWorld;
begin
  writeln('Hello, World!');
  writeln('Welcome to Pascal Programming!');
end.
`;

const mod: UnitModule = {
  unit: {
    id: 'u1',
    title: 'Getting Started',
    subtitle: 'Your first program, names and reserved words',
    hue: 'violet',
    icon: 'rocket',
    topics: ['intro', 'identifiers', 'reserved'],
    boss: 'boss-u1',
  },
  topics: [
    // ---------------------------------------------------------------- intro
    {
      id: 'intro',
      unit: 'u1',
      title: 'Your First Program',
      short: 'What Pascal is and the shape of every program',
      source: 'Tute §1',
      minutes: 8,
      objectives: [
        'Say what a program is and why we learn Pascal',
        'Name the parts of a Pascal program',
        'Write and run a program that prints messages',
      ],
      lesson: [
        {
          kind: 'concept',
          title: 'A program is a list of instructions',
          body: `Computers are fast but they only do **exactly** what they are told. A **program** is a list of instructions that tells the computer what to do, step by step.

**Pascal** is a programming language created by **Niklaus Wirth in 1970**. It is named after the French mathematician **Blaise Pascal**.`,
          callout: { kind: 'tip', text: 'Pascal uses English-like words such as `begin`, `end`, `if` and `then`, which makes it a great first language.' },
        },
        {
          kind: 'visual',
          title: 'Every program has the same shape',
          body: 'Tap each part to see what it does.',
          visual: 'program-anatomy',
        },
        {
          kind: 'example',
          title: 'Your first program',
          body: 'This program prints two lines. Press **Run** to try it.',
          code: HELLO,
          notes: [
            { line: 1, text: 'The program heading gives the program a name and ends with ;' },
            { line: 2, text: '`begin` marks the start of the instructions.' },
            { line: 3, text: '`writeln` prints the text inside the quotes, then moves to a new line.' },
            { line: 5, text: '`end.` finishes the program. Notice the full stop!' },
          ],
        },
        {
          kind: 'concept',
          title: 'Two tiny symbols that matter',
          body: `- The **semicolon** \`;\` separates one instruction from the next.
- The **full stop** \`.\` after the last \`end\` tells Pascal the program is complete.

Text that should be printed goes inside **single quotes**: \`'Hello'\`.`,
          callout: { kind: 'mistake', text: 'Forgetting the full stop after the final `end` is one of the most common mistakes. Pascal will refuse to run the program.' },
        },
        { kind: 'check', question: 'intro-2' },
        {
          kind: 'try',
          title: 'Make it yours',
          body: `Change the program so it prints exactly these two lines (use your own name):

\`\`\`
Hello, I am Nimal
I am learning Pascal
\`\`\``,
          starter: HELLO,
          tests: [{ expect: ['Hello, I am', 'I am learning Pascal'] }],
          hints: [
            'Change the text inside the quotes of each writeln.',
            "Keep the single quotes: writeln('I am learning Pascal');",
          ],
          solution: pas`
program HelloWorld;
begin
  writeln('Hello, I am Nimal');
  writeln('I am learning Pascal');
end.
`,
        },
        {
          kind: 'concept',
          title: 'Comments: notes for humans',
          body: `Anything inside curly brackets \`{ }\` is a **comment**. Pascal ignores comments completely. We use them to explain our code to other people (and to our future selves).`,
          code: pas`
program Comments;
begin
  { This line is a comment - Pascal skips it }
  writeln('Only this is printed');
end.
`,
        },
        { kind: 'check', question: 'intro-4' },
      ],
      revision: {
        what: 'A program is a set of instructions. Pascal (Niklaus Wirth, 1970) is a structured, high-level language.',
        why: 'Pascal uses English-like words and strict structure, which teaches logical thinking and makes errors easy to spot.',
        syntax: pas`
program ProgramName;
var
  { declare variables here }
begin
  { statements here }
end.
`,
        example: { code: HELLO, output: 'Hello, World!\nWelcome to Pascal Programming!' },
        mistakes: ['Forgetting the full stop after the final `end`.', 'Forgetting `;` between statements.', 'Using double quotes `"Hi"` instead of single quotes `\'Hi\'`.'],
        examPoints: ['Pascal was created by **Niklaus Wirth** in **1970**, named after **Blaise Pascal**.', 'Order of a program: heading → declarations (`const`, `var`) → `begin` … `end.`'],
        keyTerms: [
          { term: 'Program', def: 'A sequence of instructions to solve a problem.' },
          { term: 'Comment', def: 'Text inside { } that Pascal ignores.' },
        ],
        mini: 'intro-1',
      },
    },
    // ---------------------------------------------------------------- identifiers
    {
      id: 'identifiers',
      unit: 'u1',
      title: 'Identifiers',
      short: 'Rules for naming things in your program',
      source: 'Tute §2',
      minutes: 8,
      objectives: ['Explain what an identifier is', 'Use the 6 rules to decide if a name is valid', 'Choose meaningful names'],
      lesson: [
        {
          kind: 'concept',
          title: 'Names for things',
          body: `An **identifier** is simply a **name** you give to something in your program, just like naming a pet "Buddy".

Identifiers are used to name:
- **Variables**: boxes whose values can change
- **Constants**: boxes whose values never change
- **Programs**
- **Procedures and functions**`,
        },
        {
          kind: 'concept',
          title: 'The 6 rules',
          body: `1. Must **start with a letter** (A–Z or a–z)
2. After that: letters, digits or underscore \`_\`
3. **No spaces**
4. **No reserved words** (like \`begin\`, \`end\`)
5. **No special symbols** like @ # $ % & * - +
6. Pascal is **not case-sensitive**: \`Total\`, \`total\` and \`TOTAL\` are the same name`,
          callout: { kind: 'exam', text: 'Exam questions often give a list of names and ask which are valid. Check each rule in order.' },
        },
        { kind: 'check', title: 'Sort the names', question: 'id-1' },
        {
          kind: 'example',
          title: 'Not case-sensitive',
          body: 'All three spellings below mean the **same** variable.',
          code: pas`
program SameName;
var
  total : integer;
begin
  total := 10;
  TOTAL := Total + 5;
  writeln(ToTaL);
end.
`,
        },
        {
          kind: 'concept',
          title: 'Make names meaningful',
          body: 'Pascal accepts `x` or `a`, but good programmers choose names that say what the value is: `studentAge`, `averageMarks`, `isPassed`, `grade_A_count`.',
          code: pas`
var
  studentAge : integer;
  averageMarks : real;
  studentName : string;
  isPassed : boolean;
`,
          callout: { kind: 'mistake', text: 'Avoid names like `x`, `y`, `a` unless it is a maths formula. Your code should be readable!' },
        },
        {
          kind: 'try',
          title: 'Fix the names',
          body: 'This program will not run because of bad identifiers. Fix the variable names so it runs and prints the total.',
          starter: pas`
program FixNames;
var
  2ndMark, total-marks : integer;
begin
  2ndMark := 40;
  total-marks := 2ndMark + 30;
  writeln('Total: ', total-marks);
end.
`,
          tests: [{ expect: ['Total', '70'] }],
          hints: ['A name cannot start with a digit. Try `mark2` instead of `2ndMark`.', 'A hyphen (-) is not allowed. Use an underscore or join the words: `totalMarks`.', 'Change the name everywhere it is used, not just in the var section.'],
          solution: pas`
program FixNames;
var
  mark2, totalMarks : integer;
begin
  mark2 := 40;
  totalMarks := mark2 + 30;
  writeln('Total: ', totalMarks);
end.
`,
        },
        { kind: 'check', question: 'id-5' },
      ],
      revision: {
        what: 'An identifier is a name for a variable, constant, program, procedure or function.',
        why: 'Names let us refer to stored values and parts of our program. Good names make code readable.',
        syntax: pas`
var
  studentName : string;   { valid }
  marks2023   : integer;  { valid }
  student_age : integer;  { valid }
`,
        mistakes: ['Starting with a digit: `9thGrade`', 'Spaces: `student name`', 'Hyphens or symbols: `total-marks`, `student#`', 'Using reserved words: `begin`, `end`'],
        examPoints: ['The 6 rules: start with a letter; letters/digits/underscore only; no spaces; no reserved words; no special symbols; not case-sensitive.', '`Total`, `total` and `TOTAL` are the **same** identifier.'],
        keyTerms: [{ term: 'Identifier', def: 'A programmer-chosen name for something in a program.' }],
        mini: 'id-2',
      },
    },
    // ---------------------------------------------------------------- reserved
    {
      id: 'reserved',
      unit: 'u1',
      title: 'Reserved Words',
      short: "Pascal's VIP words you can't use as names",
      source: 'Tute §3',
      minutes: 6,
      objectives: ['Explain what a reserved word is', 'Recognise common Pascal reserved words', 'Avoid using reserved words as identifiers'],
      lesson: [
        {
          kind: 'concept',
          title: "Pascal's VIP words",
          body: `**Reserved words** already have a special meaning and job in Pascal. They are "VIP" words — you can't use them as names for your own variables.

Some you have already met: \`program\`, \`begin\`, \`end\`, \`var\`.`,
        },
        {
          kind: 'concept',
          title: 'Common reserved words',
          body: `\`program\` \`begin\` \`end\` \`var\` \`const\`
\`if\` \`then\` \`else\` \`case\` \`of\`
\`for\` \`to\` \`downto\` \`do\` \`while\` \`repeat\` \`until\`
\`div\` \`mod\` \`and\` \`or\` \`not\` \`true\` \`false\`
\`integer\` \`real\` \`string\` \`char\` \`boolean\`
\`array\` \`procedure\` \`function\``,
          callout: { kind: 'tip', text: 'In the code editor, reserved words are coloured purple so you can spot them.' },
        },
        {
          kind: 'example',
          title: 'Spot the reserved words',
          body: 'Every purple word below is a reserved word. Everything else is a name chosen by the programmer (or a built-in command like `writeln`).',
          code: pas`
program Weekend;
var
  day : integer;
begin
  day := 6;
  if day >= 6 then
    writeln('Weekend!')
  else
    writeln('School day');
end.
`,
        },
        { kind: 'check', question: 'rw-2' },
        {
          kind: 'try',
          title: 'See what Pascal says',
          body: 'This program uses a reserved word as a variable name. Press **Run** to read the error message, then fix it.',
          starter: pas`
program Oops;
var
  begin : integer;
begin
  begin := 5;
  writeln(begin);
end.
`,
          tests: [{ expect: ['5'] }],
          hints: ['`begin` is a reserved word, so it can\'t be a variable name.', 'Rename the variable to something like `beginValue` or `start` everywhere except the real `begin` of the program.'],
          solution: pas`
program Oops;
var
  start : integer;
begin
  start := 5;
  writeln(start);
end.
`,
        },
        { kind: 'check', question: 'rw-1' },
      ],
      revision: {
        what: 'Reserved words are words with a fixed meaning in Pascal (e.g. `begin`, `if`, `while`, `div`).',
        why: 'Pascal uses them to understand the structure of your program, so they can\'t be used as names.',
        mistakes: ['Declaring `var end : integer;` or `var then : integer;` causes an error.'],
        examPoints: ['Be able to pick out reserved words from a list.', 'Know that reserved words can\'t be used as identifiers.'],
        keyTerms: [{ term: 'Reserved word', def: 'A word with a special meaning that can\'t be used as an identifier.' }],
        mini: 'rw-5',
      },
    },
  ],
  questions: [
    // ---------- intro
    {
      id: 'intro-1', topic: 'intro', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Recall facts about Pascal',
      prompt: 'Who created the Pascal programming language?',
      options: ['Blaise Pascal', 'Niklaus Wirth', 'Charles Babbage', 'Alan Turing'],
      answer: 1,
      why: ['Pascal is *named after* Blaise Pascal (a mathematician), but he didn\'t create it.', '', 'Charles Babbage designed early mechanical computers.', 'Alan Turing was a computing pioneer, but he didn\'t create Pascal.'],
      hints: ['The language was created in 1970.', 'It is named after a mathematician, but created by someone else.'],
      explanation: 'Pascal was created by **Niklaus Wirth** in **1970** and named after the French mathematician Blaise Pascal.',
    },
    {
      id: 'intro-2', topic: 'intro', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Know how a program ends',
      prompt: 'What must come right after the **final** `end` of a Pascal program?',
      options: ['A semicolon `;`', 'A full stop `.`', 'A colon `:`', 'Nothing'],
      answer: 1,
      why: ['`end;` is used for inner blocks, not the end of the whole program.', '', 'A colon is used in declarations like `age : integer`.', 'Pascal needs a signal that the program is complete.'],
      hints: ['It tells Pascal "the program is complete".', 'It is the same symbol that ends a sentence.'],
      explanation: 'The program ends with `end.` — the full stop tells Pascal the program is complete.',
    },
    {
      id: 'intro-3', topic: 'intro', type: 'output', difficulty: 'easy', skill: 'problem',
      objective: 'Predict the output of writeln statements',
      prompt: 'What does this program print?',
      code: pas`
program Greet;
begin
  writeln('Good morning');
  writeln('Class 11');
end.
`,
      answer: 'Good morning\nClass 11',
      hints: ['Each writeln prints its text and then moves to a new line.', 'The quotes themselves are not printed.'],
      explanation: 'Each `writeln` prints the text inside the quotes on its own line.',
    },
    {
      id: 'intro-4', topic: 'intro', type: 'arrange', difficulty: 'easy', skill: 'coding',
      objective: 'Know the structure of a program',
      prompt: 'Put the lines in the right order to make a working program.',
      lines: ['program Hello;', 'begin', "  writeln('Hello!');", 'end.'],
      hints: ['The program heading always comes first.', 'Instructions go between begin and end.'],
      explanation: 'Heading → `begin` → statements → `end.`',
    },
    {
      id: 'intro-5', topic: 'intro', type: 'spot', difficulty: 'practice', skill: 'coding',
      objective: 'Find a missing full stop',
      prompt: 'This program will not run. Click the line with the mistake.',
      code: pas`
program Mistake;
begin
  writeln('Pascal is fun');
  writeln('Let us learn');
end
`,
      lines: [5],
      hints: ['Look at how the program finishes.', 'What should come after the last end?'],
      explanation: 'Line 5 should be `end.` — the final `end` needs a full stop.',
    },
    {
      id: 'intro-6', topic: 'intro', type: 'fix', difficulty: 'practice', skill: 'coding',
      objective: 'Fix syntax errors',
      prompt: 'Fix this program so it runs and prints both lines.',
      code: pas`
program FixMe;
begin
  writeln('Line one')
  writeln("Line two");
end
`,
      tests: [{ exact: 'Line one\nLine two' }],
      hints: ['Run it and read the first error message.', 'Statements are separated by semicolons.', 'Text needs single quotes, and the program must end with end.'],
      solution: pas`
program FixMe;
begin
  writeln('Line one');
  writeln('Line two');
end.
`,
      explanation: 'Three fixes: add `;` after the first writeln, use single quotes `\'Line two\'`, and finish with `end.`',
    },
    {
      id: 'intro-7', topic: 'intro', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Know where variables are declared',
      prompt: 'Where are variables declared in a Pascal program?',
      options: ['After `end.`', 'In the `var` section, before the main `begin`', 'Inside `writeln`', 'Anywhere between `begin` and `end`'],
      answer: 1,
      why: ['Pascal stops reading at `end.`', '', '`writeln` prints values; it doesn\'t declare them.', 'Declarations must come before `begin`, not inside the main body.'],
      hints: ['There is a special section that starts with the word var.'],
      explanation: 'Variables are declared in the `var` section, which comes **before** the main `begin`.',
    },
    {
      id: 'intro-8', topic: 'intro', type: 'write', difficulty: 'practice', skill: 'coding',
      objective: 'Write a program that prints text',
      prompt: `Write a program that prints this box exactly:

\`\`\`
*****
*   *
*****
\`\`\``,
      starter: pas`
program Box;
begin

end.
`,
      tests: [{ exact: '*****\n*   *\n*****' }],
      hints: ['You need three writeln statements.', "The middle line is writeln('*   *'); with 3 spaces."],
      solution: pas`
program Box;
begin
  writeln('*****');
  writeln('*   *');
  writeln('*****');
end.
`,
      explanation: 'Three `writeln` statements, one for each line. Spaces inside the quotes are printed exactly.',
    },
    {
      id: 'intro-9', topic: 'intro', type: 'categorize', difficulty: 'easy', skill: 'concept',
      objective: 'Identify the parts of a program',
      prompt: 'Which part of a program does each line belong to?',
      categories: ['Heading', 'Declarations', 'Main body'],
      codeItems: true,
      items: [
        { text: 'program Marks;', category: 0 },
        { text: 'var total : integer;', category: 1 },
        { text: 'const PASS = 50;', category: 1 },
        { text: "writeln('Done');", category: 2 },
        { text: 'total := 75;', category: 2 },
      ],
      hints: ['The heading names the program.', 'Declarations come before begin (var, const).', 'Statements that do things go between begin and end.'],
      explanation: 'Heading: `program …;`. Declarations: `const` and `var`. Main body: the statements between `begin` and `end.`',
    },
    {
      id: 'intro-10', topic: 'intro', type: 'output', difficulty: 'practice', skill: 'problem',
      objective: 'Understand comments',
      prompt: 'What does this program print?',
      code: pas`
program Secret;
begin
  writeln('A');
  { writeln('B'); }
  writeln('C');
end.
`,
      answer: 'A\nC',
      hints: ['Pascal ignores everything inside { }.'],
      explanation: 'Line 4 is a comment, so `B` is never printed.',
    },
    {
      id: 'intro-11', topic: 'intro', type: 'mcq', difficulty: 'challenge', skill: 'problem', exam: true,
      objective: 'Recognise a correct program',
      prompt: 'Which program is written correctly?',
      codeOptions: true,
      options: [
        "program A;\nbegin\n  writeln('Hi')\n  writeln('Bye');\nend.",
        "program B;\nbegin\n  writeln('Hi');\n  writeln('Bye');\nend.",
        "program C;\nbegin\n  writeln(\"Hi\");\nend.",
        "program D\nbegin\n  writeln('Hi');\nend;",
      ],
      answer: 1,
      why: ['The first writeln is missing its semicolon.', '', 'Text must use single quotes, not double quotes.', 'The heading is missing `;` and the program should end with `end.`'],
      hints: ['Check every line ending.', 'Check the quotes and the very last line.'],
      explanation: 'Program B has a heading with `;`, statements separated by `;`, single quotes and `end.`',
    },
    {
      id: 'intro-12', topic: 'intro', type: 'fill', difficulty: 'easy', skill: 'coding',
      objective: 'Complete a program skeleton',
      prompt: 'Fill in the missing parts.',
      code: pas`
program Hello[[0]]
[[1]]
  writeln('Hello!');
[[2]]
`,
      blanks: [{ accept: [';'], width: 2 }, { accept: ['begin'], width: 6 }, { accept: ['end.'], width: 5 }],
      hints: ['The heading ends with a symbol.', 'Instructions are wrapped in two reserved words.'],
      explanation: '`program Hello;` → `begin` → statements → `end.`',
    },
    // ---------- identifiers
    {
      id: 'id-1', topic: 'identifiers', type: 'categorize', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Classify identifiers as valid or invalid',
      prompt: 'Sort each name: is it a **valid** or **invalid** identifier?',
      categories: ['Valid', 'Invalid'],
      codeItems: true,
      items: [
        { text: 'studentName', category: 0 },
        { text: 'marks2023', category: 0 },
        { text: 'student_age', category: 0 },
        { text: '9thGrade', category: 1 },
        { text: 'total-marks', category: 1 },
        { text: 'begin', category: 1 },
        { text: 'student name', category: 1 },
        { text: 'TotalMarks', category: 0 },
      ],
      hints: ['Check: does it start with a letter?', 'Look for spaces, hyphens and reserved words.'],
      explanation: '`9thGrade` starts with a digit, `total-marks` has a hyphen, `begin` is reserved and `student name` has a space. The rest are valid.',
    },
    {
      id: 'id-2', topic: 'identifiers', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Identify a valid identifier',
      prompt: 'Which of these is a **valid** identifier?',
      codeOptions: true,
      options: ['123Total', 'my-variable', 'AvgMarks', 'end'],
      answer: 2,
      why: ['It starts with a digit.', 'Hyphens are not allowed.', '', '`end` is a reserved word.'],
      hints: ['It must start with a letter and contain no symbols.'],
      explanation: '`AvgMarks` starts with a letter and contains only letters.',
    },
    {
      id: 'id-3', topic: 'identifiers', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Know that Pascal is not case-sensitive',
      prompt: 'In Pascal, are `Total` and `TOTAL` the same identifier?',
      options: ['Yes — Pascal is not case-sensitive', 'No — capital letters make them different', 'Only if declared as a constant', 'Only inside writeln'],
      answer: 0,
      why: ['', 'That is true in some languages (like C or Python), but not in Pascal.', 'Case doesn\'t matter for any identifier.', 'Case doesn\'t matter anywhere in Pascal names.'],
      hints: ['Remember rule 6.'],
      explanation: 'Pascal is **not case-sensitive**: `Total`, `total` and `TOTAL` all refer to the same thing.',
    },
    {
      id: 'id-4', topic: 'identifiers', type: 'mcq', difficulty: 'practice', skill: 'concept',
      objective: 'Explain why an identifier is invalid',
      prompt: 'Why is `student name` an invalid identifier?',
      options: ['It is too long', 'It contains a space', 'It uses lowercase letters', 'It contains the word "name"'],
      answer: 1,
      why: ['Length is not a problem.', '', 'Lowercase letters are fine.', '`name` is not a reserved word.'],
      hints: ['Look between the two words.'],
      explanation: 'Identifiers cannot contain spaces. Use `studentName` or `student_name` instead.',
    },
    {
      id: 'id-5', topic: 'identifiers', type: 'match', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'Link invalid identifiers to the rule they break',
      prompt: 'Match each invalid identifier with the rule it breaks.',
      codeLeft: true,
      pairs: [
        ['9thGrade', 'Starts with a digit'],
        ['student name', 'Contains a space'],
        ['total-marks', 'Contains a hyphen'],
        ['begin', 'Is a reserved word'],
        ['student#', 'Contains a special symbol'],
      ],
      hints: ['Read each name character by character.'],
      explanation: 'Each name breaks exactly one rule.',
    },
    {
      id: 'id-6', topic: 'identifiers', type: 'spot', difficulty: 'practice', skill: 'coding',
      objective: 'Find an invalid identifier in code',
      prompt: 'One variable name is invalid. Click its line.',
      code: pas`
program Students;
var
  studentCount : integer;
  average_mark : real;
  1stPlace : string;
  isPassed : boolean;
begin
end.
`,
      lines: [5],
      hints: ['Check the first character of each name.'],
      explanation: '`1stPlace` starts with a digit. It could be renamed `firstPlace`.',
    },
    {
      id: 'id-7', topic: 'identifiers', type: 'fix', difficulty: 'practice', skill: 'coding',
      objective: 'Correct invalid identifiers',
      prompt: 'Fix the identifiers so the program runs and prints `Sum = 30`.',
      code: pas`
program AddUp;
var
  first num, second# : integer;
begin
  first num := 10;
  second# := 20;
  writeln('Sum = ', first num + second#);
end.
`,
      tests: [{ expect: ['Sum = 30'] }],
      hints: ['`first num` has a space.', '`second#` has a symbol.', 'Rename them, e.g. `firstNum` and `secondNum`, everywhere.'],
      solution: pas`
program AddUp;
var
  firstNum, secondNum : integer;
begin
  firstNum := 10;
  secondNum := 20;
  writeln('Sum = ', firstNum + secondNum);
end.
`,
      explanation: 'Use names without spaces or symbols, like `firstNum` and `secondNum`.',
    },
    {
      id: 'id-8', topic: 'identifiers', type: 'mcq', difficulty: 'challenge', skill: 'concept', exam: true,
      objective: 'Apply all identifier rules',
      prompt: 'Which group contains **only valid** identifiers?',
      options: [
        '`Area`, `x1`, `_count`',
        '`total2`, `Grade_A`, `averageMarks`',
        '`sum`, `2sum`, `sum_2`',
        '`var1`, `var`, `variable`',
      ],
      answer: 1,
      why: ['`_count` starts with an underscore — identifiers must start with a letter.', '', '`2sum` starts with a digit.', '`var` is a reserved word.'],
      hints: ['Check every name in each group — one bad name ruins the group.'],
      explanation: 'Only `total2`, `Grade_A` and `averageMarks` all follow every rule.',
    },
    {
      id: 'id-9', topic: 'identifiers', type: 'mcq', difficulty: 'easy', skill: 'concept',
      objective: 'Choose meaningful names',
      prompt: 'Which is the **best** name for a variable that stores the number of students in a class?',
      codeOptions: true,
      options: ['x', 'n1', 'studentCount', 's'],
      answer: 2,
      why: ['Valid, but doesn\'t say what it stores.', 'Valid, but meaningless.', '', 'Too short to understand.'],
      hints: ['All are valid — which one explains itself?'],
      explanation: '`studentCount` tells the reader exactly what the value means.',
    },
    {
      id: 'id-10', topic: 'identifiers', type: 'output', difficulty: 'challenge', skill: 'problem',
      objective: 'Apply case-insensitivity',
      prompt: 'What does this program print?',
      code: pas`
program Cases;
var
  score : integer;
begin
  Score := 5;
  SCORE := score + 2;
  writeln(sCoRe);
end.
`,
      answer: '7',
      hints: ['How many different variables are there really?'],
      explanation: '`Score`, `SCORE`, `score` and `sCoRe` are all the same variable: 5 + 2 = 7.',
    },
    // ---------- reserved
    {
      id: 'rw-1', topic: 'reserved', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Identify a reserved word',
      prompt: 'Which of these is a reserved word?',
      codeOptions: true,
      options: ['marks', 'begin', 'total', 'studentName'],
      answer: 1,
      why: ['A programmer-chosen name.', '', 'A programmer-chosen name.', 'A programmer-chosen name.'],
      hints: ['Which word marks the start of the instructions?'],
      explanation: '`begin` is a reserved word — it marks the start of a block of statements.',
    },
    {
      id: 'rw-2', topic: 'reserved', type: 'categorize', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Classify reserved words',
      prompt: 'Sort the words: **reserved word** or **free to use as a name**?',
      categories: ['Reserved word', 'Can be a name'],
      codeItems: true,
      items: [
        { text: 'while', category: 0 },
        { text: 'mod', category: 0 },
        { text: 'then', category: 0 },
        { text: 'array', category: 0 },
        { text: 'average', category: 1 },
        { text: 'score', category: 1 },
        { text: 'totalMarks', category: 1 },
      ],
      hints: ['Reserved words are the words Pascal uses to build statements (loops, conditions, operators).'],
      explanation: '`while`, `mod`, `then` and `array` are reserved. `average`, `score` and `totalMarks` are ordinary names.',
    },
    {
      id: 'rw-3', topic: 'reserved', type: 'mcq', difficulty: 'practice', skill: 'concept',
      objective: 'Predict what happens with a reserved word as a name',
      prompt: 'What happens if you declare `var end : integer;`?',
      options: ['It works normally', 'Pascal gives an error', 'The program ends immediately', 'end becomes 0'],
      answer: 1,
      why: ['Reserved words can\'t be used as names.', '', 'Nothing runs — it won\'t even compile.', 'It never gets a value — it is an error.'],
      hints: ['Can a VIP word be used as an ordinary name?'],
      explanation: '`end` is a reserved word, so Pascal reports an error.',
    },
    {
      id: 'rw-4', topic: 'reserved', type: 'fix', difficulty: 'practice', skill: 'coding',
      objective: 'Rename reserved words used as names',
      prompt: 'Fix this program so it prints `Remainder: 2`.',
      code: pas`
program Remainders;
var
  mod, number : integer;
begin
  number := 17;
  mod := number mod 5;
  writeln('Remainder: ', mod);
end.
`,
      tests: [{ expect: ['Remainder: 2'] }],
      hints: ['`mod` is an operator (a reserved word).', 'Rename the variable, e.g. `remainder`, but keep the operator `mod` in `number mod 5`.'],
      solution: pas`
program Remainders;
var
  remainder, number : integer;
begin
  number := 17;
  remainder := number mod 5;
  writeln('Remainder: ', remainder);
end.
`,
      explanation: '`mod` is reserved, so the variable needs a different name like `remainder`.',
    },
    {
      id: 'rw-5', topic: 'reserved', type: 'mcq', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'Identify a non-reserved word',
      prompt: 'Which word is **NOT** a reserved word?',
      codeOptions: true,
      options: ['until', 'downto', 'score', 'program'],
      answer: 2,
      why: ['Used in repeat...until loops.', 'Used in for loops that count down.', '', 'Starts every program.'],
      hints: ['Three of these appear in loops or program structure.'],
      explanation: '`score` is an ordinary identifier; the others are reserved words.',
    },
    {
      id: 'rw-6', topic: 'reserved', type: 'spot', difficulty: 'easy', skill: 'coding',
      objective: 'Find a reserved word used as a variable',
      prompt: 'Click the line that will cause an error.',
      code: pas`
program Shop;
var
  price : real;
  then : integer;
  quantity : integer;
begin
end.
`,
      lines: [4],
      hints: ['One of these names is used in if statements.'],
      explanation: '`then` is a reserved word (used in `if ... then`).',
    },
    {
      id: 'rw-7', topic: 'reserved', type: 'match', difficulty: 'practice', skill: 'concept',
      objective: 'Know what common reserved words do',
      prompt: 'Match each reserved word with its job.',
      codeLeft: true,
      pairs: [
        ['var', 'Starts the variables section'],
        ['const', 'Starts the constants section'],
        ['div', 'Whole-number division'],
        ['then', 'Comes after an if condition'],
        ['until', 'Ends a repeat loop'],
      ],
      hints: ['Think about where you have seen each word used.'],
      explanation: 'Each reserved word has one fixed job in Pascal.',
    },
    {
      id: 'rw-8', topic: 'reserved', type: 'mcq', difficulty: 'challenge', skill: 'concept', exam: true,
      objective: 'Recognise reserved words in a list',
      prompt: 'Which list contains **only** reserved words?',
      options: ['`begin`, `end`, `total`', '`if`, `then`, `else`', '`for`, `count`, `do`', '`var`, `name`, `const`'],
      answer: 1,
      why: ['`total` is a normal name.', '', '`count` is a normal name.', '`name` is a normal name.'],
      hints: ['Look for the one normal name hiding in each list.'],
      explanation: '`if`, `then` and `else` are all reserved words.',
    },
  ],
  boss: {
    id: 'boss-u1',
    unit: 'u1',
    title: 'The Welcome Sign',
    emoji: 'signpost',
    story: 'The school needs a welcome sign for its new computer lab — and the old program is broken. Fix and build it to win!',
    stages: [
      {
        title: 'Print the banner',
        prompt: `Write a program that prints this banner **exactly**:

\`\`\`
==========
 WELCOME!
==========
\`\`\``,
        starter: pas`
program Banner;
begin

end.
`,
        tests: [{ exact: '==========\n WELCOME!\n==========' }],
        hints: ['Three writeln statements.', "The middle line starts with one space: writeln(' WELCOME!');"],
        solution: pas`
program Banner;
begin
  writeln('==========');
  writeln(' WELCOME!');
  writeln('==========');
end.
`,
      },
      {
        title: 'Repair the old program',
        prompt: 'This program has **three** mistakes. Fix them all so it prints `Computer Lab` and then `Open 8am - 2pm`.',
        starter: pas`
program Lab
begin
  writeln("Computer Lab");
  writeln('Open 8am - 2pm');
end
`,
        tests: [{ exact: 'Computer Lab\nOpen 8am - 2pm' }],
        hints: ['Run it and fix one error at a time.', 'Check the heading, the quotes and the last line.'],
        solution: pas`
program Lab;
begin
  writeln('Computer Lab');
  writeln('Open 8am - 2pm');
end.
`,
      },
      {
        title: 'Sign it with a comment',
        prompt: 'Write a program that prints `Built by Grade 11` and includes at least one **comment** `{ ... }` explaining what it does.',
        starter: pas`
program Signature;
begin

end.
`,
        tests: [{ expect: ['Built by Grade 11'] }],
        requires: [{ pattern: '\\{[^}]*\\}', message: 'Add a comment inside { } that explains your program.', raw: true }],
        hints: ['A comment looks like { This prints the signature }', 'Comments can go on their own line anywhere in the program.'],
        solution: pas`
program Signature;
begin
  { Prints who made the sign }
  writeln('Built by Grade 11');
end.
`,
      },
    ],
  },
};

export default mod;
