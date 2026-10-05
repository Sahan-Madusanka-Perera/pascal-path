/**
 * Pascal error model + beginner-friendly explanations.
 *
 * Every error the interpreter can raise has a stable `code`. The UI never shows
 * raw compiler jargon on its own: it looks the code up here to get a short title,
 * a plain-language explanation and a hint about what to check.
 */

export type ErrorPhase = 'syntax' | 'type' | 'runtime';

export interface PascalErrorData {
  code: string;
  line: number;
  col?: number;
  /** Technical message (what a real compiler might say). */
  message: string;
  params?: Record<string, string>;
  phase: ErrorPhase;
}

export class PascalError extends Error implements PascalErrorData {
  code: string;
  line: number;
  col?: number;
  params: Record<string, string>;
  phase: ErrorPhase;

  constructor(data: PascalErrorData) {
    super(data.message);
    this.code = data.code;
    this.line = data.line;
    this.col = data.col;
    this.params = data.params ?? {};
    this.phase = data.phase;
  }

  toData(): PascalErrorData {
    return { code: this.code, line: this.line, col: this.col, message: this.message, params: this.params, phase: this.phase };
  }
}

export interface PascalWarning {
  code: string;
  line: number;
  message: string;
  params?: Record<string, string>;
}

export interface FriendlyError {
  title: string;
  explanation: string;
  hint: string;
}

type P = Record<string, string>;
type Entry = { title: string | ((p: P) => string); explain: (p: P) => string; hint: (p: P) => string };

const c = (s: string | undefined) => (s ? `\`${s}\`` : 'something');

const CATALOGUE: Record<string, Entry> = {
  // ---------- Syntax (the way the code is written) ----------
  E_UNEXPECTED_CHAR: {
    title: 'A symbol Pascal does not understand',
    explain: (p) => `The character ${c(p.char)} is not allowed here. Pascal names can only use letters, digits and underscore (_).`,
    hint: () => 'Remove the symbol, or replace it with a letter or underscore.',
  },
  E_DOUBLE_QUOTES: {
    title: 'Use single quotes for text',
    explain: () => 'Pascal writes text (strings) inside single quotes like \'Hello\'. Double quotes " " are not allowed.',
    hint: () => "Change \"Hello\" to 'Hello'.",
  },
  E_UNTERMINATED_STRING: {
    title: 'Text is missing its closing quote',
    explain: () => "A piece of text starts with ' but never ends. Pascal keeps reading until it finds the closing quote.",
    hint: () => "Check this line: every opening ' needs a matching closing '. To show an apostrophe inside text, type it twice: 'It''s fine'.",
  },
  E_UNTERMINATED_COMMENT: {
    title: 'A comment was never closed',
    explain: () => 'A comment that starts with { must end with }. Everything after { is being ignored as a comment.',
    hint: () => 'Find the { and add a matching } at the end of the comment.',
  },
  E_IDENT_STARTS_WITH_DIGIT: {
    title: 'A name cannot start with a number',
    explain: (p) => `${c(p.text)} starts with a digit. Identifiers (names) must start with a letter.`,
    hint: (p) => `Try a name like ${c('n' + (p.text ?? ''))} or move the number to the end.`,
  },
  E_IDENT_STARTS_WITH_UNDERSCORE: {
    title: 'A name must start with a letter',
    explain: (p) => `${c(p.text)} starts with an underscore. In the O/L syllabus, identifiers must start with a letter (A–Z or a–z).`,
    hint: (p) => `Remove the underscore at the start: ${c((p.text ?? '_x').replace(/^_+/, ''))}`,
  },
  E_MISSING_SEMICOLON: {
    title: 'Missing semicolon (;)',
    explain: (p) => `Line ${p.prevLine ?? '?'} looks finished, but there is no semicolon after it. In Pascal, statements are separated by ;`,
    hint: (p) => `Add a ; at the end of line ${p.prevLine ?? '?'}.`,
  },
  E_MISSING_PERIOD: {
    title: 'The program needs a full stop at the end',
    explain: () => 'The final end of a Pascal program must be followed by a full stop: end.  This tells Pascal the program is complete.',
    hint: () => 'Change the last end (or end;) to end.',
  },
  E_EXPECTED: {
    title: (p) => `Expected ${p.expected ?? 'something else'} here`,
    explain: (p) => `Pascal expected ${c(p.expected)} but found ${c(p.found)}.`,
    hint: () => 'Compare this line with the correct syntax pattern. Check for a missing word or symbol just before this point.',
  },
  E_EXPECTED_EXPRESSION: {
    title: 'A value is missing',
    explain: (p) => `Pascal expected a value or calculation here (like 5, total or a + b) but found ${c(p.found)}.`,
    hint: () => 'Check for a missing number or variable, or an extra operator such as + or *.',
  },
  E_EXPECTED_STATEMENT: {
    title: 'This does not look like a statement',
    explain: (p) => `A statement can't start with ${c(p.found)}. Statements usually start with a variable name (for :=), a command like writeln, or a keyword like if, for or while.`,
    hint: () => 'Check the line above too: a missing begin or an extra end can cause this.',
  },
  E_ASSIGN_EQUALS: {
    title: 'Use := to store a value',
    explain: (p) => `To put a value into a variable, Pascal uses := (colon equals). A single = is only for comparing. You wrote ${c(p.name)} = ...`,
    hint: (p) => `Change it to ${p.name ?? 'name'} := ...`,
  },
  E_COLON_EQUALS_IN_CONDITION: {
    title: 'Use = to compare, not :=',
    explain: () => 'Inside a condition you are asking a question ("is it equal?"), so use =.  := is only for storing a value.',
    hint: () => 'Change := to = inside the condition.',
  },
  E_SEMICOLON_BEFORE_ELSE: {
    title: 'No semicolon before else',
    explain: () => 'In Pascal, if ... then ... else is ONE statement. A ; before else ends the if too early, so Pascal finds an else with no matching if.',
    hint: (p) => `Remove the ; at the end of line ${p.prevLine ?? 'before else'}.`,
  },
  E_MISSING_END: {
    title: 'A begin is missing its end',
    explain: (p) => `The begin on line ${p.beginLine ?? '?'} was never closed. Every begin needs a matching end.`,
    hint: () => 'Count your begins and ends. Indenting the code inside each begin...end helps you see which one is missing.',
  },
  E_CODE_AFTER_PROGRAM_END: {
    title: 'Code after end.',
    explain: () => 'The program ended with end. but there is more code after it.',
    hint: () => 'Only the very last end should have a full stop. Inner ends use end; or just end.',
  },
  E_EXTRA_END: {
    title: 'The program ends too early',
    explain: (p) => `The end on line ${p.line ?? '?'} closes the whole program, but there is more code after it. You probably have an extra end, or a missing begin.`,
    hint: () => 'Check that every end matches a begin. Indenting your code makes the pairs easy to see.',
  },
  E_CHAINED_COMPARISON: {
    title: 'Compare one thing at a time',
    explain: () => 'Pascal can\'t check something like  1 < x < 10  in one go. Each comparison needs two values only.',
    hint: () => 'Split it and join with and:  (x > 1) and (x < 10)',
  },
  E_MISSING_BEGIN: {
    title: 'Missing begin',
    explain: () => 'After the declarations (var, const), the main program must start with begin.',
    hint: () => 'Add begin on the line before your first statement.',
  },
  E_MISSING_THEN: {
    title: 'if needs then',
    explain: () => 'An if statement is written as: if condition then statement',
    hint: () => 'Add then after the condition.',
  },
  E_MISSING_DO: {
    title: (p) => `${p.keyword ?? 'This loop'} needs do`,
    explain: (p) => `A ${p.keyword ?? 'loop'} is written with do before the statement to repeat. For example: ${p.keyword === 'while' ? 'while count <= 5 do' : 'for i := 1 to 5 do'}`,
    hint: () => 'Add do at the end of the loop header.',
  },
  E_MISSING_OF: {
    title: 'case needs of',
    explain: () => 'A case statement is written as: case variable of',
    hint: () => 'Add of after the variable name.',
  },
  E_MISSING_TO: {
    title: 'for loop needs to or downto',
    explain: () => 'A for loop counts from a start value to an end value: for i := 1 to 10 do  (or downto to count backwards).',
    hint: () => 'Add to (counting up) or downto (counting down).',
  },
  E_FOR_ASSIGN: {
    title: 'for loops start with :=',
    explain: () => 'The loop counter gets its first value with := , for example: for i := 1 to 5 do',
    hint: () => 'Change = to := in the for line.',
  },
  E_MISSING_UNTIL: {
    title: 'repeat needs until',
    explain: () => 'A repeat loop must end with until followed by a condition.',
    hint: () => 'Add until condition; after the last statement of the loop.',
  },
  E_RESERVED_AS_IDENTIFIER: {
    title: 'That name is a reserved word',
    explain: (p) => `${c(p.word)} is a reserved word: Pascal already uses it for something special, so you can't use it as a name.`,
    hint: (p) => `Pick another name, e.g. ${c((p.word ?? 'x') + 'Value')} or ${c('my' + capital(p.word ?? 'x'))}.`,
  },
  E_RETURN_STATEMENT: {
    title: 'Pascal does not use return',
    explain: () => 'In Pascal, a function gives back its answer by assigning to its own name: FunctionName := value;',
    hint: () => 'Replace return value; with FunctionName := value;',
  },
  E_VAR_AFTER_BEGIN: {
    title: 'Declarations go before begin',
    explain: (p) => `${c(p.word)} sections must come before the begin of the program (or procedure), not inside it.`,
    hint: () => 'Move this declaration up, above begin.',
  },
  E_EXPECTED_IDENTIFIER: {
    title: 'A name is expected here',
    explain: (p) => `Pascal expected a name (identifier) but found ${c(p.found)}.`,
    hint: () => 'Names start with a letter and contain only letters, digits and _.',
  },
  E_EXPECTED_TYPE: {
    title: 'Unknown data type',
    explain: (p) => `${c(p.found)} is not a data type Pascal knows. Common types are integer, real, char, string and boolean.`,
    hint: () => 'Check the spelling of the type after the colon.',
  },
  E_EMPTY_PROGRAM: {
    title: 'There is no program yet',
    explain: () => 'The editor is empty. Write a program that starts with program Name; and ends with end.',
    hint: () => 'Start with:  program Hello;  begin  writeln(\'Hi\');  end.',
  },

  // ---------- Meaning / types ----------
  E_UNDECLARED: {
    title: (p) => `Unknown name: ${p.name ?? ''}`,
    explain: (p) =>
      `Pascal doesn't know what ${c(p.name)} is. Every variable must be declared in the var section before you use it.` +
      (p.suggestion ? ` Did you mean ${c(p.suggestion)}?` : ''),
    hint: (p) => (p.suggestion ? `Check the spelling. You declared ${c(p.suggestion)}.` : `Add ${p.name ?? 'name'} : type; to your var section, or check the spelling.`),
  },
  E_DUPLICATE: {
    title: 'Name used twice',
    explain: (p) => `${c(p.name)} has already been declared. Each name can only be declared once.`,
    hint: () => 'Remove the extra declaration or rename one of them.',
  },
  E_TYPE_MISMATCH_ASSIGN: {
    title: (p) => `Can't store ${article(p.source)} in ${article(p.target)} variable`,
    explain: (p) => explainAssignMismatch(p),
    hint: (p) => hintAssignMismatch(p),
  },
  E_TYPE_MISMATCH_OP: {
    title: 'These values can\'t be combined',
    explain: (p) => `You can't use ${c(p.op)} between ${article(p.left)} and ${article(p.right)}.`,
    hint: (p) =>
      p.left === 'string' || p.right === 'string' || p.left === 'char' || p.right === 'char'
        ? 'Text and numbers are different types. Compare text with text and numbers with numbers. Did you forget quotes, or put quotes around a number?'
        : 'Check the data types of both sides of the operator.',
  },
  E_CONDITION_NOT_BOOLEAN: {
    title: 'The condition must be TRUE or FALSE',
    explain: (p) => `The condition after ${c(p.keyword)} must be a question with a yes/no answer, like marks >= 50. Yours gives ${article(p.type)} instead.`,
    hint: () => 'Use a comparison operator: =, <>, <, >, <=, >=',
  },
  E_LOGIC_BRACKETS: {
    title: 'Put brackets around each condition',
    explain: () =>
      'and / or are worked out BEFORE comparisons like > or =. So  a > 5 and b < 3  is read as  a > (5 and b) < 3 , which makes no sense.',
    hint: () => 'Wrap each condition in brackets:  (a > 5) and (b < 3)',
  },
  E_DIV_REAL: {
    title: (p) => `${p.op ?? 'div'} only works with whole numbers`,
    explain: (p) => `${c(p.op)} needs integer values on both sides, but one side is a real (decimal) number.`,
    hint: () => 'Use / for decimal division, or make sure both values are integers.',
  },
  E_ASSIGN_CONST: {
    title: 'Constants can\'t change',
    explain: (p) => `${c(p.name)} is a constant: its value is fixed in the const section and can never be changed.`,
    hint: () => 'If the value needs to change, declare it in the var section instead.',
  },
  E_ASSIGN_FOR_VAR: {
    title: 'Don\'t change the for-loop counter',
    explain: (p) => `${c(p.name)} is the counter of a for loop. Pascal changes it automatically each time round, so you are not allowed to change it inside the loop.`,
    hint: () => 'Use a while loop if you need to control the counter yourself, or use a different variable.',
  },
  E_NOT_ARRAY: {
    title: 'This is not an array',
    explain: (p) => `You used [ ] after ${c(p.name)}, but it is not an array (or string).`,
    hint: () => 'Only arrays (and strings) can be indexed with square brackets.',
  },
  E_ARRAY_INDEX_TYPE: {
    title: 'Array index must be a whole number',
    explain: (p) => `The number inside [ ] must be an integer, but this is ${article(p.type)}.`,
    hint: () => 'Use an integer variable or value as the index.',
  },
  E_ARG_COUNT: {
    title: (p) => `${p.name ?? 'This'} needs ${p.expected ?? 'a different number of'} value(s)`,
    explain: (p) => `${c(p.name)} expects ${p.expected} parameter(s), but you gave ${p.found}.`,
    hint: (p) => (p.signature ? `It is declared as: ${p.signature}` : 'Check how many values you pass inside the brackets.'),
  },
  E_ARG_TYPE: {
    title: 'Wrong type of value passed',
    explain: (p) => `Parameter ${p.index} of ${c(p.name)} needs ${article(p.expected)}, but you passed ${article(p.found)}.`,
    hint: () => 'Check the order and types of the values in the brackets.',
  },
  E_VAR_PARAM_NEEDS_VARIABLE: {
    title: 'This needs a variable',
    explain: (p) => `${c(p.name)} needs a variable here (it will store a value into it), not a fixed value or calculation.`,
    hint: () => 'Pass a variable name instead.',
  },
  E_NOT_A_PROCEDURE: {
    title: 'This line does nothing',
    explain: (p) => `${c(p.name)} is a ${p.kind ?? 'value'}, not a command, so it can't be a statement on its own.`,
    hint: (p) => `Did you mean ${p.name ?? 'x'} := something; or writeln(${p.name ?? 'x'});?`,
  },
  E_NOT_A_FUNCTION: {
    title: 'This doesn\'t give back a value',
    explain: (p) => `${c(p.name)} is a procedure. Procedures do a job but don't return a value, so they can't be used inside a calculation or writeln.`,
    hint: () => 'Call it on its own line, or change it into a function.',
  },
  E_CALL_NON_ROUTINE: {
    title: 'This can\'t be called',
    explain: (p) => `${c(p.name)} is a variable, so you can't put brackets ( ) after it like a function call.`,
    hint: () => 'Use [ ] for arrays. Use ( ) only for procedures and functions.',
  },
  E_FOR_VAR_TYPE: {
    title: 'for-loop counter must be an integer',
    explain: (p) => `The counter of a for loop must be an integer (or char) variable. ${c(p.name)} is ${article(p.type)}.`,
    hint: () => 'Declare the counter as integer, e.g. i : integer;',
  },
  E_FOR_VAR_NOT_VARIABLE: {
    title: 'for-loop counter must be a variable',
    explain: (p) => `${c(p.name)} can't be used as a loop counter.`,
    hint: () => 'Use a simple integer variable such as i.',
  },
  E_CASE_TYPE: {
    title: 'case label has the wrong type',
    explain: (p) => `The case variable is ${article(p.expected)}, but this label is ${article(p.found)}.`,
    hint: () => "For a char variable use labels like 'A'. For an integer variable use labels like 1.",
  },
  E_CASE_LABEL_CONST: {
    title: 'case labels must be fixed values',
    explain: () => 'Each case label must be a fixed value (like 1 or \'A\'), not a variable or calculation.',
    hint: () => 'If you need to compare with variables, use if ... else if instead.',
  },
  E_WRITE_ARRAY: {
    title: 'Can\'t print a whole array at once',
    explain: () => 'writeln can print single values, but not a whole array.',
    hint: () => 'Use a for loop to print each element:  for i := 1 to 5 do writeln(arr[i]);',
  },
  E_WRITE_TYPE: {
    title: 'Can\'t print this',
    explain: (p) => `writeln can't print ${article(p.type)}.`,
    hint: () => 'Print the individual values instead.',
  },
  E_READ_TYPE: {
    title: 'Can\'t read into this',
    explain: () => 'readln needs variables to store what the user types.',
    hint: () => 'Put variable names inside readln( ), e.g. readln(age);',
  },
  E_FORMAT_NOT_REAL: {
    title: 'Decimal places only work for real numbers',
    explain: () => 'The second number in  value:width:decimals  is only allowed for real values.',
    hint: () => 'For integers just use value:width, e.g. writeln(count:5);',
  },
  E_CONST_EXPR: {
    title: 'Needs a fixed value',
    explain: () => 'Constants and array sizes must use fixed values that Pascal can work out before the program runs.',
    hint: () => 'Use numbers or other constants here, not variables.',
  },
  E_ARRAY_BOUNDS: {
    title: 'Array range is back to front',
    explain: (p) => `An array range must go from low to high, but ${p.lo}..${p.hi} goes backwards.`,
    hint: () => 'Write the smaller index first, e.g. array[1..10].',
  },
  E_BREAK_OUTSIDE_LOOP: {
    title: (p) => `${p.name ?? 'break'} must be inside a loop`,
    explain: (p) => `${c(p.name)} jumps out of (or to the next turn of) a loop, so it can only be used inside a loop.`,
    hint: () => 'Move it inside the loop, or remove it.',
  },
  E_PROCEDURE_RESULT: {
    title: 'Procedures don\'t return values',
    explain: () => 'Only functions can return a value by assigning to their name.',
    hint: () => 'Change the procedure into a function:  function Name(...): type;',
  },
  E_FUNCTION_NO_RETURN_TYPE: {
    title: 'function needs a return type',
    explain: () => 'A function must say what type of value it returns, e.g. function Square(n: integer): integer;',
    hint: () => 'Add : type after the closing bracket of the parameters.',
  },

  // ---------- Runtime (while the program runs) ----------
  R_DIV_ZERO: {
    title: 'Division by zero',
    explain: () => 'The program tried to divide by 0, which is impossible in maths and in programming.',
    hint: () => 'Check the value you are dividing by. Use an if to make sure it is not 0 before dividing.',
  },
  R_INDEX_RANGE: {
    title: 'Array index out of range',
    explain: (p) => `The program tried to use ${p.name ?? 'the array'}[${p.index}], but this array only has positions ${p.lo} to ${p.hi}.`,
    hint: () => 'Check the start and end values of your loop, and remember where the array index starts (0 or 1).',
  },
  R_STRING_INDEX: {
    title: 'Position outside the text',
    explain: (p) => `The program used position ${p.index} of a string that is only ${p.length} characters long.`,
    hint: () => 'String positions start at 1 and end at length(s).',
  },
  R_INVALID_INPUT: {
    title: 'That input is not the right type',
    explain: (p) =>
      `You typed ${c(p.input)}, but the program was expecting ${p.expected === 'integer' ? 'a whole number (integer) like 42' : p.expected === 'real' ? 'a number like 3.5' : p.expected === 'boolean' ? 'TRUE or FALSE' : 'a value'}.`,
    hint: () => 'Run the program again and type a value that matches the variable\'s data type.',
  },
  R_STEP_LIMIT: {
    title: 'Your program ran for too long',
    explain: (p) =>
      `The program ran ${p.steps ?? 'millions of'} steps without finishing. This usually means an infinite loop: a loop whose condition never becomes false.` +
      (p.line ? ` It was busy around line ${p.line}.` : ''),
    hint: () => 'Check that the loop variable changes inside the loop, and that the condition can eventually stop the loop. (e.g. did you forget count := count + 1?)',
  },
  R_STACK_OVERFLOW: {
    title: 'Too many calls',
    explain: () => 'A procedure or function kept calling itself and never stopped.',
    hint: () => 'Make sure there is a stopping condition, so it doesn\'t call itself forever.',
  },
  R_OVERFLOW: {
    title: 'Number too big',
    explain: () => 'A calculation produced a number too big for an integer variable.',
    hint: () => 'Use smaller numbers, or use a real variable for very large values.',
  },
  R_NO_INPUT: {
    title: 'The program wanted more input',
    explain: () => 'The program asked for input (readln) but there was no more input to give it in this test.',
    hint: () => 'Check that you read exactly the number of values the task describes, no more.',
  },
  R_CHR_RANGE: {
    title: 'Invalid character code',
    explain: (p) => `chr(${p.value}) is not a valid character. Character codes go from 0 to 255.`,
    hint: () => 'Check the number passed to chr.',
  },
  R_MATH_DOMAIN: {
    title: 'Impossible calculation',
    explain: (p) => `${p.fn ?? 'This function'} can't work with ${p.value}. (For example, you can't take the square root of a negative number.)`,
    hint: () => 'Check the value before calling the function.',
  },
  R_STOPPED: {
    title: 'Program stopped',
    explain: () => 'You stopped the program before it finished.',
    hint: () => 'Run it again when you are ready.',
  },

  // ---------- Warnings ----------
  W_UNINITIALIZED: {
    title: (p) => `${p.name ?? 'A variable'} was used before it got a value`,
    explain: (p) => `Your program read ${c(p.name)} before storing anything in it. Pascal used ${p.defaultValue ?? '0'}, but on other computers it could be any random value.`,
    hint: (p) => `Give it a starting value first, e.g. ${p.name ?? 'total'} := 0;`,
  },
  W_FUNCTION_RESULT: {
    title: (p) => `${p.name ?? 'The function'} may not return a value`,
    explain: (p) => `The function ${c(p.name)} never assigns its result. A function must contain ${p.name ?? 'Name'} := value;`,
    hint: (p) => `Add ${p.name ?? 'Name'} := ...; inside the function.`,
  },
  W_CODE_AFTER_END: {
    title: 'Some code was ignored',
    explain: (p) => `Pascal stops reading at the end. on line ${p.line}. Everything after it was ignored.`,
    hint: () => 'Only the very last end of the program has a full stop. Use end; for inner blocks.',
  },
};

function capital(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function article(t?: string): string {
  if (!t) return 'a value';
  const map: Record<string, string> = {
    integer: 'an integer (whole number)',
    real: 'a real (decimal number)',
    string: 'a string (text)',
    char: 'a char (one character)',
    boolean: 'a boolean (TRUE/FALSE)',
    array: 'an array',
  };
  return map[t] ?? (/^[aeiou]/i.test(t) ? `an ${t}` : `a ${t}`);
}

function explainAssignMismatch(p: P): string {
  const { target, source, name } = p;
  const v = name ? `\`${name}\`` : 'This variable';
  if (target === 'integer' && source === 'real')
    return `${v} is an integer, so it can only hold whole numbers. The value on the right is a real (decimal) number. Remember: the / operator ALWAYS gives a real result, even 10 / 2.`;
  if ((target === 'integer' || target === 'real') && (source === 'string' || source === 'char'))
    return `${v} holds numbers, but you are trying to store text in it. Anything inside quotes is text, even '5'.`;
  if ((target === 'string' || target === 'char') && (source === 'integer' || source === 'real'))
    return `${v} holds text, but the value on the right is a number. Text values must be inside single quotes.`;
  if (target === 'char' && source === 'string')
    return `${v} is a char, so it can hold only ONE character. The value on the right is a string (could be many characters).`;
  if (target === 'boolean') return `${v} is a boolean, so it can only hold TRUE or FALSE.`;
  if (source === 'boolean') return `The value on the right is TRUE/FALSE, but ${v} is ${article(target)}.`;
  return `${v} is ${article(target)}, but the value is ${article(source)}. Both sides of := must have matching types.`;
}

function hintAssignMismatch(p: P): string {
  const { target, source } = p;
  if (target === 'integer' && source === 'real') return 'Declare the variable as real, use div for whole-number division, or use round(...) / trunc(...).';
  if (source === 'string' || source === 'char') return 'Remove the quotes if you meant a number, or change the variable type.';
  if (target === 'string' || target === 'char') return "Put the text inside single quotes, e.g. 'A'.";
  return 'Make the variable type match the value you are storing.';
}

export function explainError(e: { code: string; params?: Record<string, string>; message: string }): FriendlyError {
  const entry = CATALOGUE[e.code];
  const params = e.params ?? {};
  if (!entry) {
    return { title: 'Something went wrong', explanation: e.message, hint: 'Read the line carefully and compare it with an example.' };
  }
  const title = typeof entry.title === 'function' ? entry.title(params) : entry.title;
  return { title, explanation: entry.explain(params), hint: entry.hint(params) };
}

export function hasFriendly(code: string) {
  return code in CATALOGUE;
}
