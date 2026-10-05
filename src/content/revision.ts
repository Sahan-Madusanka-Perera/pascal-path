import { pas } from './util';

/** Exam-focused revision material that spans topics (tute §12, §14 and comparisons). */

export const COMMON_MISTAKES: Array<{ title: string; wrong: string; right: string; why: string; topic: string }> = [
  { title: 'Forgetting the full stop at the end', wrong: 'end', right: 'end.', why: 'The final end of the program needs a full stop.', topic: 'intro' },
  { title: 'Using = instead of :=', wrong: 'age = 16;', right: 'age := 16;', why: ':= stores a value. = only compares.', topic: 'variables' },
  { title: 'Forgetting semicolons', wrong: "writeln('Hello')\nwriteln('Bye');", right: "writeln('Hello');\nwriteln('Bye');", why: 'Statements are separated by semicolons.', topic: 'intro' },
  { title: 'Not matching begin and end', wrong: "if marks > 50 then\nbegin\n  writeln('Pass');\n  writeln('Good');\n{ missing end! }", right: "if marks > 50 then\nbegin\n  writeln('Pass');\n  writeln('Good');\nend;", why: 'Every begin needs its own end.', topic: 'elseif' },
  { title: 'Wrong quotes for strings', wrong: 'name := "John";', right: "name := 'John';", why: 'Pascal uses single quotes for text.', topic: 'datatypes' },
  { title: 'A semicolon before else', wrong: "if x > 0 then\n  writeln('Positive');\nelse\n  writeln('Not positive');", right: "if x > 0 then\n  writeln('Positive')\nelse\n  writeln('Not positive');", why: 'if…then…else is ONE statement — no ; before else.', topic: 'if' },
  { title: 'Storing / in an integer', wrong: 'avg := total / 3;   { avg : integer }', right: 'avg := total / 3;   { avg : real }', why: '/ always gives a real result. Use a real variable or div.', topic: 'arithmetic' },
  { title: 'No brackets around conditions', wrong: 'if age >= 18 and hasID then', right: 'if (age >= 18) and hasID then', why: 'and/or are worked out before comparisons, so each comparison needs brackets.', topic: 'logical' },
  { title: 'Character without quotes', wrong: 'grade := A;', right: "grade := 'A';", why: 'Characters (and strings) must be inside single quotes.', topic: 'datatypes' },
  { title: 'Forgetting to start a total at 0', wrong: 'for i := 1 to 5 do\n  sum := sum + i;', right: 'sum := 0;\nfor i := 1 to 5 do\n  sum := sum + i;', why: 'Always initialise counters and totals before the loop.', topic: 'for' },
  { title: 'Infinite while loop', wrong: 'count := 1;\nwhile count <= 5 do\n  writeln(count);', right: 'count := 1;\nwhile count <= 5 do\nbegin\n  writeln(count);\n  count := count + 1;\nend;', why: 'The loop variable must change inside the loop, and multiple statements need begin…end.', topic: 'while' },
  { title: 'Array index out of range', wrong: 'marks : array[0..9] of integer;\n...\nfor i := 1 to 10 do\n  readln(marks[i]);', right: 'for i := 0 to 9 do\n  readln(marks[i]);', why: 'The loop must use the same index range as the array.', topic: 'arrays' },
  { title: 'Using return in a function', wrong: 'return n * n;', right: 'Square := n * n;', why: 'A Pascal function returns a value by assigning to its own name.', topic: 'functions' },
  { title: 'Wrong array declaration', wrong: 'marks ( array[0..9] of integer;', right: 'marks : array[0..9] of integer;', why: 'Use a colon between the name and the type.', topic: 'arrays' },
];

export const DIFFERENCES: Array<{ title: string; a: { name: string; points: string[] }; b: { name: string; points: string[] }; c?: { name: string; points: string[] }; topic: string }> = [
  { title: ':= vs =', a: { name: ':=', points: ['Assignment — stores a value', '`age := 16;`', 'Used in statements'] }, b: { name: '=', points: ['Comparison — asks "is it equal?"', '`if age = 16 then`', 'Also used in const declarations'] }, topic: 'variables' },
  { title: 'write vs writeln', a: { name: 'write', points: ['Prints and stays on the same line', "`write('Enter name: ');`", 'Good for input prompts'] }, b: { name: 'writeln', points: ['Prints then moves to a new line', "`writeln('Hello');`", '`writeln;` alone prints an empty line'] }, topic: 'io' },
  { title: '/ vs div vs mod', a: { name: '/', points: ['Real division', '`10 / 4` = 2.5', 'Result is always real'] }, b: { name: 'div', points: ['Whole-number division', '`10 div 4` = 2', 'Integers only'] }, c: { name: 'mod', points: ['Remainder', '`10 mod 4` = 2', 'Integers only. `n mod 2 = 0` → even'] }, topic: 'arithmetic' },
  { title: 'and vs or vs not', a: { name: 'and', points: ['TRUE only if BOTH are TRUE'] }, b: { name: 'or', points: ['TRUE if AT LEAST ONE is TRUE'] }, c: { name: 'not', points: ['Reverses: TRUE ↔ FALSE'] }, topic: 'logical' },
  { title: 'for vs while vs repeat', a: { name: 'for', points: ['Known number of repetitions', 'Counter changes automatically', 'May run 0 times'] }, b: { name: 'while', points: ['Unknown number of repetitions', 'Checks BEFORE each round', 'May run 0 times'] }, c: { name: 'repeat…until', points: ['Checks AFTER each round', 'Always runs at least once', 'Stops when condition is TRUE'] }, topic: 'repeat' },
  { title: 'if vs case', a: { name: 'if … else if', points: ['Any condition (ranges, and/or)', 'Good for marks → grade'] }, b: { name: 'case … of', points: ['One variable compared to fixed values', 'Cleaner for menus (1, 2, 3, 4)', 'Integer or char values'] }, topic: 'case' },
  { title: 'char vs string', a: { name: 'char', points: ['Exactly ONE character', "`grade := 'A';`"] }, b: { name: 'string', points: ['Text of many characters', "`name := 'Kamal';`"] }, topic: 'datatypes' },
  { title: 'integer vs real', a: { name: 'integer', points: ['Whole numbers: 16, −5, 450', 'Range about −32768 to 32767 (standard Pascal)'] }, b: { name: 'real', points: ['Decimal numbers: 5.8, 87.5', 'Format with `:0:2`'] }, topic: 'datatypes' },
  { title: 'variable vs constant', a: { name: 'Variable (var)', points: ['Value can change', '`score := score + 5;`'] }, b: { name: 'Constant (const)', points: ['Value never changes', '`PI = 3.14159;`', 'Usually written in CAPITALS'] }, topic: 'variables' },
  { title: 'procedure vs function', a: { name: 'Procedure', points: ['Does a job', 'Does NOT return a value', 'Called as a statement: `PrintMenu;`'] }, b: { name: 'Function', points: ['Returns a value', 'Has a return type: `: integer`', 'Used in expressions: `x := Square(4);`'] }, topic: 'functions' },
  { title: 'value vs var parameter', a: { name: 'Value parameter', points: ['`procedure Show(r : real);`', 'Gets a copy — changes stay inside'] }, b: { name: 'var parameter', points: ['`procedure GetData(var r : real);`', 'Changes go back to the caller'] }, topic: 'procedures' },
  { title: 'Compiler vs Interpreter', a: { name: 'Compiler', points: ['Translates the WHOLE program at once', 'Errors → nothing runs', 'After compiling, runs many times without translating'] }, b: { name: 'Interpreter', points: ['Translates and runs line by line', 'Stops at the error line (earlier lines already ran)', 'Translates every time it runs'] }, topic: 'translators' },
  { title: 'Low-level vs High-level', a: { name: 'Machine / Assembly', points: ['Binary or mnemonics (MOV, ADD)', 'Machine dependent', 'Hard for humans'] }, b: { name: 'High-level', points: ['English-like (Pascal, C, BASIC)', 'Usually machine independent', 'Needs a compiler or interpreter'] }, topic: 'languages' },
  { title: 'Procedural vs Declarative', a: { name: 'Procedural', points: ['Says HOW — step by step', 'Pascal, C'] }, b: { name: 'Declarative', points: ['Says WHAT you want', 'Databases (SQL), AI'] }, topic: 'paradigms' },
];

export const PATTERNS: Array<{ title: string; when: string; code: string; topic: string }> = [
  { title: 'Read, process, print', when: 'Almost every program: Input → Process → Output.', topic: 'io', code: pas`
write('Enter length: ');
readln(len);
write('Enter width: ');
readln(wid);
area := len * wid;
writeln('Area = ', area);
` },
  { title: 'Counting loop', when: 'Repeat something a known number of times.', topic: 'for', code: pas`
for i := 1 to 10 do
  writeln(i);
` },
  { title: 'Total (accumulator)', when: 'Add up values. Start the total at 0!', topic: 'for', code: pas`
total := 0;
for i := 1 to 5 do
begin
  readln(number);
  total := total + number;
end;
average := total / 5;
` },
  { title: 'Counter with a condition', when: 'Count how many values match a rule.', topic: 'nested', code: pas`
passCount := 0;
for i := 1 to n do
begin
  readln(marks);
  if marks >= 50 then
    passCount := passCount + 1;
end;
` },
  { title: 'Find the maximum', when: 'Largest value in a list or array.', topic: 'arrayloops', code: pas`
max := marks[0];
for i := 1 to 34 do
  if marks[i] > max then
    max := marks[i];
` },
  { title: 'Input validation', when: 'Keep asking until the input is valid.', topic: 'repeat', code: pas`
repeat
  write('Enter marks (0-100): ');
  readln(marks);
until (marks >= 0) and (marks <= 100);
` },
  { title: 'Even or odd', when: 'Test divisibility with mod.', topic: 'arithmetic', code: pas`
if number mod 2 = 0 then
  writeln('Even')
else
  writeln('Odd');
` },
  { title: 'Menu with case', when: 'Choose an action from a number.', topic: 'case', code: pas`
case choice of
  1 : writeln('Add');
  2 : writeln('Delete');
else
  writeln('Invalid choice');
end;
` },
  { title: 'Fill and print an array', when: 'Store many values, then use them.', topic: 'arrayloops', code: pas`
for i := 1 to 10 do
  readln(nums[i]);
for i := 10 downto 1 do
  writeln(nums[i]);
` },
  { title: 'Function that returns a value', when: 'Calculate and give back one answer.', topic: 'functions', code: pas`
function Square(n : integer) : integer;
begin
  Square := n * n;
end;
` },
];
