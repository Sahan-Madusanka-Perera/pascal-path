import type { UnitModule } from '../index';

const mod: UnitModule = {
  unit: {
    id: 'u9',
    title: 'How Programs Run',
    subtitle: 'Languages, paradigms and translators',
    hue: 'slate',
    icon: 'landmark',
    topics: ['languages', 'paradigms', 'translators'],
    theory: true,
  },
  topics: [
    // ---------------------------------------------------------------- languages
    {
      id: 'languages',
      unit: 'u9',
      title: 'Evolution of Languages',
      short: 'Machine, assembly and high-level languages',
      source: 'Tute §17',
      minutes: 8,
      objectives: ['Describe machine, assembly and high-level languages', 'Give advantages and disadvantages of each', 'Explain why translation is needed'],
      lesson: [
        {
          kind: 'concept',
          title: 'Computers only understand 0s and 1s',
          body: `A **program** is a sequence of instructions to solve a problem. But a computer's CPU doesn't understand English — only **machine-level instructions** made of 0s and 1s.

That's why programming languages evolved: to make it easier for **humans** to write instructions.`,
        },
        { kind: 'visual', title: 'The language ladder', body: 'The same instruction at three levels. Tap each level.', visual: 'language-ladder' },
        {
          kind: 'concept',
          title: 'Low-level languages',
          body: `**Machine language** is binary (0 and 1).
- Good: very fast; the CPU runs it directly; no translator needed
- Bad: very hard for humans; **machine dependent**

**Assembly language** uses **mnemonics** like \`MOV\`, \`ADD\`.
- Good: easier than machine language
- Bad: needs an **assembler**; still machine dependent`,
        },
        { kind: 'check', question: 'lang-2' },
        {
          kind: 'concept',
          title: 'High-level languages',
          body: `High-level languages use human-friendly words and structure. Examples: **FORTRAN, BASIC, COBOL, PASCAL, C**.

- Good: easy to read and write
- Good: usually **machine independent**
- Bad: must be **translated** into machine code before running (by a compiler or interpreter)`,
          callout: { kind: 'tip', text: 'Pascal is a high-level language — excellent for learning structured, procedural programming.' },
        },
        { kind: 'check', question: 'lang-4' },
      ],
      revision: {
        what: 'Programming languages evolved from machine language (binary) to assembly (mnemonics) to high-level languages (English-like).',
        why: 'Each step made programs easier for humans to write, read and move between computers.',
        mistakes: ['Saying assembly language runs directly on the CPU (it needs an assembler).', 'Forgetting that machine and assembly languages are machine dependent.'],
        examPoints: ['Machine language: fast, no translator, hard, machine dependent.', 'Assembly: mnemonics (MOV, ADD), needs an assembler, machine dependent.', 'High-level: easy, machine independent, needs a compiler or interpreter.'],
        keyTerms: [
          { term: 'Machine language', def: 'Instructions in binary (0 and 1) that the CPU executes directly.' },
          { term: 'Assembly language', def: 'A low-level language using mnemonics such as MOV and ADD.' },
          { term: 'Mnemonic', def: 'A short code word that stands for a machine instruction.' },
          { term: 'High-level language', def: 'A human-friendly language such as Pascal, C or BASIC.' },
          { term: 'Machine dependent', def: 'Only works on one type of computer/CPU.' },
        ],
        mini: 'lang-1',
      },
    },
    // ---------------------------------------------------------------- paradigms
    {
      id: 'paradigms',
      unit: 'u9',
      title: 'Programming Paradigms',
      short: 'Procedural, declarative, structured, object-oriented',
      source: 'Tute §18',
      minutes: 9,
      objectives: ['Compare procedural and declarative programming', 'Describe structured programming', 'Explain classes, objects, properties and methods'],
      lesson: [
        {
          kind: 'concept',
          title: 'Different ways to solve problems',
          body: 'Different languages follow different approaches. These approaches are called **paradigms**.',
        },
        { kind: 'visual', title: 'HOW vs WHAT', body: 'Same goal, two approaches.', visual: 'paradigms' },
        {
          kind: 'concept',
          title: 'Procedural vs declarative',
          body: `- **Procedural** — describes step by step **HOW** to solve the problem, using statements like \`if\`, \`for\`, \`while\` and procedures. *Pascal is mainly procedural.*
- **Declarative** — describes **WHAT** result you want; the system decides how. *Common in AI and database thinking.*`,
          callout: { kind: 'mistake', text: "Don't mix them up: procedural = how; declarative = what." },
        },
        { kind: 'check', question: 'par-2' },
        {
          kind: 'concept',
          title: 'Structured programming',
          body: `**Structured programming** breaks a system into functions/processes using a **top-down** approach, with the flow **Input → Process → Output**.

Pascal supports structured programming strongly (procedures, functions, if, loops).`,
        },
        { kind: 'visual', title: 'Object-oriented programming', body: 'A **class** is a blueprint. **Objects** are made from it. Each object has **properties** (data) and **methods** (actions). Pick a car and use its methods.', visual: 'oop-car' },
        {
          kind: 'concept',
          title: 'Programming vs scripting languages',
          body: `- **Programming languages** often need compiling and have strict structure: *Pascal, C, C++*
- **Scripting languages** are often interpreted and used to automate tasks: *JavaScript, PHP*`,
        },
        { kind: 'check', question: 'par-5' },
      ],
      revision: {
        what: 'A paradigm is an approach to programming: procedural (how), declarative (what), structured (top-down, input→process→output) and object-oriented (objects with properties and methods).',
        why: 'Knowing paradigms helps you understand why languages look different and which suits a problem.',
        mistakes: ['Confusing procedural (how) with declarative (what).', 'Mixing up class (blueprint) and object (a real thing made from it).', 'Calling properties "methods" — properties are data, methods are actions.'],
        examPoints: ['Pascal is procedural and structured.', 'OOP: class Car → properties (color, speed) and methods (start(), brake()); objects ToyotaCar, BMWCar.', 'Programming languages: Pascal, C, C++. Scripting: JavaScript, PHP.'],
        keyTerms: [
          { term: 'Paradigm', def: 'An approach or style of programming.' },
          { term: 'Procedural', def: 'Describes step by step how to solve a problem.' },
          { term: 'Declarative', def: 'Describes what result is wanted, not how.' },
          { term: 'Structured programming', def: 'Breaking a program into functions/processes, top-down.' },
          { term: 'Class', def: 'A blueprint describing properties and methods.' },
          { term: 'Object', def: 'An instance created from a class.' },
          { term: 'Method', def: 'An action an object can perform.' },
          { term: 'Property', def: 'A piece of data that describes an object (attribute).' },
        ],
        mini: 'par-1',
      },
    },
    // ---------------------------------------------------------------- translators
    {
      id: 'translators',
      unit: 'u9',
      title: 'Language Translators',
      short: 'Assembler, compiler and interpreter',
      source: 'Tute §19',
      minutes: 9,
      objectives: ['Define assembler, compiler and interpreter', 'State differences between a compiler and an interpreter', 'Predict what happens when a program has an error'],
      lesson: [
        {
          kind: 'concept',
          title: 'Why translate?',
          body: `Every language except machine language must be **translated** into machine code before the CPU can run it. There are three kinds of translator:

- **Assembler**: assembly language → machine code
- **Compiler**: translates the **whole program at once**
- **Interpreter**: translates and runs **line by line**`,
        },
        { kind: 'visual', title: 'Compiler vs interpreter', body: 'The program has an error on line 3. See what each translator does.', visual: 'translators' },
        {
          kind: 'concept',
          title: 'The key differences',
          body: `**Compiler**
- Translates the **whole program at once** into machine code
- If there are errors, compilation fails and **nothing runs**
- After compiling once, the program runs **many times without translating again**

**Interpreter**
- Translates and executes **statement by statement**
- Stops at the error line — **earlier lines have already run**
- Translates **every time** you run the program
- Great for learning: you can quickly test small parts`,
          callout: { kind: 'exam', text: 'Must know: interpreter = statement by statement; compiler = whole program at once.' },
        },
        { kind: 'check', question: 'tr-3' },
        { kind: 'check', question: 'tr-6' },
      ],
      revision: {
        what: 'Translators convert source code into machine code: an assembler (assembly), a compiler (whole program at once) and an interpreter (line by line).',
        why: 'The CPU only understands machine code, so every other language must be translated.',
        mistakes: ['Saying a compiler runs the program line by line.', 'Forgetting that an interpreter translates every time the program runs.'],
        examPoints: ['Assembly → Assembler → Machine code.', 'Compiler: errors → no executable; compile once, run many times.', 'Interpreter: stops at the error line; earlier lines already executed.'],
        keyTerms: [
          { term: 'Translator', def: 'A program that converts code into machine code.' },
          { term: 'Assembler', def: 'Converts assembly language into machine code.' },
          { term: 'Compiler', def: 'Translates the whole high-level program into machine code at once.' },
          { term: 'Interpreter', def: 'Translates and executes a program one statement at a time.' },
          { term: 'Source code', def: 'The program as written by the programmer.' },
        ],
        mini: 'tr-1',
      },
    },
  ],
  questions: [
    // ---------- languages
    {
      id: 'lang-1', topic: 'languages', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Machine language', prompt: 'Machine language is written using…', options: ['English words', 'Mnemonics like MOV and ADD', 'Binary digits (0 and 1)', 'Flowcharts'], answer: 2,
      why: ['That describes high-level languages.', 'That is assembly language.', '', 'Flowcharts are diagrams, not a language.'],
      hints: ['It is what the CPU understands directly.'], explanation: 'Machine language is binary — 0s and 1s.',
    },
    {
      id: 'lang-2', topic: 'languages', type: 'categorize', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Classify language levels', prompt: 'Sort each example into its language level.', categories: ['Machine language', 'Assembly language', 'High-level language'],
      items: [
        { text: '10110000 01100001', category: 0 },
        { text: '00000100 00000001', category: 0 },
        { text: 'MOV AX, 5', category: 1 },
        { text: 'ADD AX, BX', category: 1 },
        { text: 'total := total + 1;', category: 2 },
        { text: "writeln('Hello');", category: 2 },
      ],
      codeItems: true, hints: ['Binary → machine; mnemonics → assembly; English-like → high-level.'], explanation: 'Binary is machine code, MOV/ADD are assembly mnemonics, Pascal statements are high-level.',
    },
    {
      id: 'lang-3', topic: 'languages', type: 'match', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'Features of each level', prompt: 'Match each feature with the language type.',
      pairs: [['Runs directly on the CPU without translation', 'Machine language'], ['Uses mnemonics and needs an assembler', 'Assembly language'], ['Machine independent and English-like', 'High-level language'], ['Examples: FORTRAN, BASIC, COBOL, PASCAL', 'High-level language examples']],
      hints: ['Think about who can read it easily and what translator it needs.'], explanation: 'Machine: direct; assembly: mnemonics + assembler; high-level: English-like, portable.',
    },
    {
      id: 'lang-4', topic: 'languages', type: 'mcq', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'Disadvantage of machine language', prompt: 'Which is a **disadvantage** of machine language?',
      options: ['It runs very fast', 'It needs no translator', 'It is machine dependent and hard for humans', 'The CPU executes it directly'], answer: 2,
      why: ['That is an advantage.', 'That is an advantage.', '', 'That is an advantage.'],
      hints: ['Three of these are advantages.'], explanation: 'Machine language is hard to write and only works on one type of machine.',
    },
    {
      id: 'lang-5', topic: 'languages', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'High-level examples', prompt: 'Which of these is a **high-level** language?', options: ['Binary', 'Assembly', 'Pascal', 'Machine code'], answer: 2,
      why: ['Binary is machine language.', 'Assembly is low-level.', '', 'Machine code is low-level.'],
      hints: ['You are learning it right now!'], explanation: 'Pascal is a high-level language.',
    },
    {
      id: 'lang-6', topic: 'languages', type: 'categorize', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'Advantages and disadvantages', prompt: 'Is each statement about **high-level languages** an advantage or a disadvantage?', categories: ['Advantage', 'Disadvantage'],
      items: [
        { text: 'Easy to read and write', category: 0 },
        { text: 'Usually machine independent', category: 0 },
        { text: 'Must be translated before running', category: 1 },
        { text: 'Uses English-like words', category: 0 },
      ],
      hints: ['Only one of these is a drawback.'], explanation: 'High-level languages are easy and portable, but need translating.',
    },
    {
      id: 'lang-7', topic: 'languages', type: 'mcq', difficulty: 'challenge', skill: 'concept', exam: true,
      objective: 'Machine dependence', prompt: 'A program written in assembly language for one type of CPU is moved to a computer with a different CPU. What is most likely?',
      options: ['It runs without changes', 'It may not run, because assembly language is machine dependent', 'It runs faster', 'It automatically becomes a high-level program'], answer: 1,
      why: ['Assembly is tied to a CPU type.', '', 'It may not run at all.', 'Languages don\'t change by moving computers.'],
      hints: ['Low-level languages are tied to the hardware.'], explanation: 'Assembly (like machine language) is machine dependent.',
    },
    // ---------- paradigms
    {
      id: 'par-1', topic: 'paradigms', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Procedural paradigm', prompt: 'Which paradigm describes **step by step how** to solve a problem?', options: ['Declarative', 'Procedural', 'Scripting', 'Object-oriented only'], answer: 1,
      why: ['Declarative describes WHAT, not HOW.', '', 'Scripting is a kind of language, not this paradigm.', 'OOP is organised around objects.'],
      hints: ['Pascal uses this paradigm.'], explanation: 'Procedural programming gives step-by-step instructions — like Pascal.',
    },
    {
      id: 'par-2', topic: 'paradigms', type: 'categorize', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'Procedural vs declarative', prompt: 'Is each example procedural or declarative?', categories: ['Procedural (HOW)', 'Declarative (WHAT)'],
      items: [
        { text: '"First do this, then do that, then finish."', category: 0 },
        { text: '"I want students with marks > 75."', category: 1 },
        { text: 'A Pascal program with for loops and if statements', category: 0 },
        { text: 'A database query that lists all books by an author', category: 1 },
      ],
      hints: ['Does it list steps, or just describe the result?'], explanation: 'Steps → procedural; describing the wanted result → declarative.',
    },
    {
      id: 'par-3', topic: 'paradigms', type: 'match', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'OOP vocabulary', prompt: 'Match each OOP word with its example from the Car activity.',
      pairs: [['Class', 'Car (the blueprint)'], ['Object', 'ToyotaCar'], ['Property', 'color, speed, fuelLevel'], ['Method', 'start(), accelerate(), brake()']],
      hints: ['Properties are data; methods are actions.'], explanation: 'Car is the class; ToyotaCar is an object; color is a property; accelerate() is a method.',
    },
    {
      id: 'par-4', topic: 'paradigms', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Scripting languages', prompt: 'Which pair are both **scripting** languages?', options: ['Pascal and C', 'JavaScript and PHP', 'C and C++', 'Pascal and JavaScript'], answer: 1,
      why: ['Both are programming languages.', '', 'Both are programming languages.', 'Pascal is a programming language.'],
      hints: ['Scripting languages are often used on websites.'], explanation: 'JavaScript and PHP are scripting languages.',
    },
    {
      id: 'par-5', topic: 'paradigms', type: 'mcq', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'Structured programming', prompt: 'Which statement best describes **structured programming**?',
      options: ['Describing only the result you want', 'Breaking a system into functions/processes using a top-down approach', 'Writing programs only in binary', 'Programs made only of objects'], answer: 1,
      why: ['That is declarative.', '', 'That is machine language.', 'That is object-oriented.'],
      hints: ['Think "Input → Process → Output" and top-down.'], explanation: 'Structured programming breaks a problem into smaller processes, top-down.',
    },
    {
      id: 'par-6', topic: 'paradigms', type: 'categorize', difficulty: 'challenge', skill: 'concept', exam: true,
      objective: 'Properties vs methods', prompt: 'A class `Student` is designed. Is each item a **property** or a **method**?', categories: ['Property (data)', 'Method (action)'],
      items: [
        { text: 'name', category: 0 },
        { text: 'indexNumber', category: 0 },
        { text: 'calculateAverage()', category: 1 },
        { text: 'marks', category: 0 },
        { text: 'printReport()', category: 1 },
      ],
      codeItems: true, hints: ['Methods do something (they usually have brackets).'], explanation: 'name, indexNumber and marks are data; calculateAverage() and printReport() are actions.',
    },
    {
      id: 'par-7', topic: 'paradigms', type: 'mcq', difficulty: 'challenge', skill: 'concept', exam: true,
      objective: 'Class vs object', prompt: 'Which statement is correct?',
      options: ['An object is a blueprint for creating classes', 'A class is a blueprint; objects are created from it', 'Classes contain no properties', 'Each object must be a different class'], answer: 1,
      why: ['It is the other way round.', '', 'Classes define properties and methods.', 'Many objects can come from one class.'],
      hints: ['Car is to ToyotaCar as … is to …'], explanation: 'A class (Car) is the blueprint; ToyotaCar and BMWCar are objects made from it.',
    },
    // ---------- translators
    {
      id: 'tr-1', topic: 'translators', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Assembler', prompt: 'Which translator converts **assembly language** into machine code?', options: ['Compiler', 'Interpreter', 'Assembler', 'Linker'], answer: 2,
      why: ['A compiler translates high-level languages.', 'An interpreter translates high-level languages line by line.', '', 'Not part of the O/L syllabus here.'],
      hints: ['Its name sounds like the language.'], explanation: 'Assembly → **Assembler** → machine code.',
    },
    {
      id: 'tr-2', topic: 'translators', type: 'categorize', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'Compiler vs interpreter', prompt: 'Does each statement describe a **compiler** or an **interpreter**?', categories: ['Compiler', 'Interpreter'],
      items: [
        { text: 'Translates the whole program at once', category: 0 },
        { text: 'Translates and runs statement by statement', category: 1 },
        { text: 'If there is an error, nothing runs', category: 0 },
        { text: 'Lines before the error have already run', category: 1 },
        { text: 'Translates again every time the program runs', category: 1 },
        { text: 'Once translated, can run many times without translating again', category: 0 },
      ],
      hints: ['Compiler = all at once; interpreter = one line at a time.'], explanation: 'These are the key compiler/interpreter differences for the exam.',
    },
    {
      id: 'tr-3', topic: 'translators', type: 'mcq', difficulty: 'practice', skill: 'concept', exam: true,
      objective: 'Error behaviour', prompt: 'A 10-line program has an error on line 6. It is run using an **interpreter**. What happens?',
      options: ['Nothing runs at all', 'Lines 1–5 run, then it stops at line 6', 'All 10 lines run', 'Only line 6 runs'], answer: 1,
      why: ['That is what a compiler would do.', '', 'It stops at the error.', 'Earlier lines run first.'],
      hints: ['An interpreter works one line at a time.'], explanation: 'The interpreter runs lines 1–5, then stops when it reaches the error.',
    },
    {
      id: 'tr-4', topic: 'translators', type: 'match', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Translator flows', prompt: 'Match each source with its translator.',
      pairs: [['Assembly program', 'Assembler'], ['High-level program translated all at once', 'Compiler'], ['High-level program translated line by line', 'Interpreter']],
      hints: ['Assembly has its own translator.'], explanation: 'Assembly → assembler; high-level → compiler (all at once) or interpreter (line by line).',
    },
    {
      id: 'tr-5', topic: 'translators', type: 'mcq', difficulty: 'easy', skill: 'concept', exam: true,
      objective: 'Need for translation', prompt: 'Which language does **NOT** need to be translated before the CPU can run it?', options: ['Pascal', 'Assembly language', 'Machine language', 'C'], answer: 2,
      why: ['Pascal needs a compiler/interpreter.', 'Assembly needs an assembler.', '', 'C needs a compiler.'],
      hints: ['Which one is already 0s and 1s?'], explanation: 'Machine language is already binary, so the CPU runs it directly.',
    },
    {
      id: 'tr-6', topic: 'translators', type: 'mcq', difficulty: 'challenge', skill: 'concept', exam: true,
      objective: 'Choose a translator', prompt: 'A student wants to test small pieces of code quickly while learning. Which translator suits this best, and why?',
      options: ['A compiler, because it translates the whole program at once', 'An interpreter, because it runs code line by line so small parts can be tested quickly', 'An assembler, because it is fastest', 'None — code can\'t be tested'], answer: 1,
      why: ['Translating everything first is slower for quick tests.', '', 'An assembler only translates assembly language.', 'Interpreters make testing easy.'],
      hints: ['The tute says one of them is "great for learning".'], explanation: 'Interpreters let you test small parts quickly because they run line by line.',
    },
    {
      id: 'tr-7', topic: 'translators', type: 'mcq', difficulty: 'challenge', skill: 'concept', exam: true,
      objective: 'Compiled programs', prompt: 'A program is compiled successfully. The source code is not changed. To run it 5 more times…',
      options: ['It must be compiled 5 more times', 'The machine code can be run 5 times without compiling again', 'It must be interpreted instead', 'It must be converted to assembly first'], answer: 1,
      why: ['Compiling once is enough until the source changes.', '', 'No need to switch translators.', 'No extra conversion is needed.'],
      hints: ['What does a compiler produce?'], explanation: 'A compiler produces machine code that can be run many times without translating again.',
    },
  ],
};

export default mod;
